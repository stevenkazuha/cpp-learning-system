'use strict';

/* 码阶 CODE LADDER · 账号全量清理工具
   用法：
     node cleanup-accounts.js            演练（dry-run）：只备份 + 出清单，不写库
     node cleanup-accounts.js --execute  备份后执行账号注销与数据清除
   仅使用 Node 内置模块；执行前必须停止 server.js，避免内存中的旧数据覆盖清理结果。 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const net = require('net');

const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const PORT = Number(process.env.PORT || 3000);
const TOTAL_LESSONS = 65;
const EXECUTE = process.argv.includes('--execute');

function pad(n) { return String(n).padStart(2, '0'); }
function timeStamp() {
  const d = new Date();
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}

const BACKUP_DIR = path.join(ROOT, 'backups', 'account-cleanup-' + timeStamp());
const ACCOUNT_DIR = path.join(BACKUP_DIR, 'accounts');
const LOG_FILE = path.join(BACKUP_DIR, 'cleanup.log');
const SNAPSHOT_FILE = path.join(BACKUP_DIR, 'db.snapshot.json');
const CSV_FILE = path.join(BACKUP_DIR, 'accounts.csv');
const MANIFEST_FILE = path.join(BACKUP_DIR, 'manifest.json');
const REPORT_FILE = path.join(BACKUP_DIR, 'report.md');

fs.mkdirSync(ACCOUNT_DIR, { recursive: true });

/* ---------------- 日志 ---------------- */

const stepResults = [];
let stepNo = 0;
let failedSteps = 0;

function now() { return new Date().toISOString(); }
function writeLine(line) {
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  console.log(line);
}
function log(level, message) { writeLine('[' + now() + '] [' + level + '] ' + message); }

async function runStep(name, fn) {
  stepNo++;
  const no = stepNo;
  log('INFO', '──── STEP ' + no + ' · ' + name + ' ────');
  const started = Date.now();
  try {
    const detail = await fn(no);
    log('OK', 'STEP ' + no + ' 完成：' + (detail || '成功') + '（' + (Date.now() - started) + 'ms）');
    stepResults.push({ no: no, name: name, ok: true, detail: detail || '成功' });
    return true;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    log('FAIL', 'STEP ' + no + ' 失败：' + message);
    stepResults.push({ no: no, name: name, ok: false, detail: message });
    failedSteps++;
    return false;
  }
}

/* ---------------- 工具 ---------------- */

function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function csvCell(value) {
  const text = String(value == null ? '' : value);
  return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}
function rel(file) { return path.relative(BACKUP_DIR, file).split(path.sep).join('/'); }

function lessonKeyValid(key) {
  const match = /^(basic|algo|adva|advb)-(\d{1,2})$/.exec(String(key || ''));
  if (!match) return false;
  const max = { basic: 15, algo: 18, adva: 16, advb: 16 }[match[1]];
  return Number(match[2]) >= 1 && Number(match[2]) <= max;
}

function portInUse(port) {
  return new Promise(function (resolve) {
    const socket = net.createConnection({ host: '127.0.0.1', port: port });
    let settled = false;
    function done(value) {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    }
    socket.setTimeout(800);
    socket.once('connect', function () { done(true); });
    socket.once('timeout', function () { done(false); });
    socket.once('error', function () { done(false); });
  });
}

/* ---------------- 上下文 ---------------- */

const ctx = {
  startedAt: now(),
  finishedAt: null,
  original: null,       // 原始 db 对象
  snapshotSha: null,
  snapshotSize: 0,
  dbShaBefore: null,
  dbShaAfter: null,
  users: [],
  sessions: {},
  accountFiles: [],
  removedSessions: 0,
  results: [],          // { user, sessions, status, backupFile, sha }
  verification: [],
  reportPath: null
};

function accountsOfSession() {
  const map = {};
  Object.keys(ctx.sessions).forEach(function (token) {
    const uid = ctx.sessions[token];
    map[uid] = (map[uid] || 0) + 1;
  });
  return map;
}

function csvRows(statusMap) {
  const lines = [];
  lines.push(['序号', '账号ID', '姓名', '用户名', '角色', '班级', '完成讲次', '总讲次', '完成占比',
    '学习天数', '创建时间', '最后活跃', '会话数', '备份文件', '注销状态'].map(csvCell).join(','));
  ctx.results.forEach(function (item, index) {
    const user = item.user;
    const done = user.progress && user.progress.done ? user.progress.done : {};
    const days = user.progress && user.progress.days ? user.progress.days : {};
    const doneCount = Object.keys(done).filter(lessonKeyValid).length;
    lines.push([
      index + 1,
      user.id,
      user.name,
      user.username,
      user.role === 'teacher' ? '老师' : '学生',
      user.className || '',
      doneCount,
      TOTAL_LESSONS,
      Math.round(doneCount / TOTAL_LESSONS * 100) + '%',
      Object.keys(days).length,
      user.createdAt || '',
      user.lastActive || '',
      item.sessions,
      item.backupFile,
      statusMap ? statusMap[user.id] || '未知' : '待清理'
    ].map(csvCell).join(','));
  });
  return '\ufeff' + lines.join('\r\n') + '\r\n';
}

function writeCsv(statusMap) {
  fs.writeFileSync(CSV_FILE, csvRows(statusMap), 'utf8');
}

function writeManifest(execution) {
  const files = [
    { path: 'db.snapshot.json', bytes: ctx.snapshotSize, sha256: ctx.snapshotSha },
    { path: 'accounts.csv', bytes: fs.statSync(CSV_FILE).size, sha256: sha256(fs.readFileSync(CSV_FILE)) },
    { path: 'cleanup.log', bytes: fs.statSync(LOG_FILE).size, sha256: sha256(fs.readFileSync(LOG_FILE)) }
  ].concat(ctx.accountFiles.map(function (item) {
    const buffer = fs.readFileSync(path.join(BACKUP_DIR, item.path));
    return { path: item.path, bytes: buffer.length, sha256: sha256(buffer) };
  }));

  const manifest = {
    operation: 'account-cleanup',
    mode: EXECUTE ? 'execute' : 'dry-run',
    startedAt: ctx.startedAt,
    finishedAt: now(),
    operator: {
      user: process.env.USERNAME || os.userInfo().username,
      host: os.hostname(),
      platform: os.platform() + ' ' + os.release(),
      node: process.version
    },
    database: {
      path: 'data/db.json',
      sha256Before: ctx.dbShaBefore,
      sha256After: ctx.dbShaAfter,
      seededAt: ctx.original.seededAt || null
    },
    totals: {
      usersBefore: ctx.users.length,
      teachers: ctx.users.filter(function (u) { return u.role === 'teacher'; }).length,
      students: ctx.users.filter(function (u) { return u.role === 'student'; }).length,
      sessionsBefore: Object.keys(ctx.sessions).length,
      accountsCleared: ctx.results.filter(function (r) { return r.status === '已注销'; }).length,
      sessionsRevoked: ctx.removedSessions
    },
    accounts: ctx.results.map(function (item) {
      return {
        id: item.user.id,
        name: item.user.name,
        username: item.user.username,
        role: item.user.role,
        className: item.user.className,
        sessions: item.sessions,
        backupFile: item.backupFile,
        backupSha256: item.sha,
        status: item.status
      };
    }),
    files: files,
    steps: stepResults,
    verification: ctx.verification,
    execution: execution || null
  };
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
}

function writeReport() {
  const lines = [];
  const cleared = ctx.results.filter(function (r) { return r.status === '已注销'; }).length;
  const passed = ctx.verification.filter(function (v) { return v.ok; }).length;

  lines.push('# 码阶 CODE LADDER · 账号清理结果报告');
  lines.push('');
  lines.push('- 操作模式：' + (EXECUTE ? '执行删除（--execute）' : '演练（dry-run）'));
  lines.push('- 开始时间：' + ctx.startedAt);
  lines.push('- 结束时间：' + (ctx.finishedAt || now()));
  lines.push('- 操作人：' + (process.env.USERNAME || os.userInfo().username) + '@' + os.hostname());
  lines.push('- 备份目录：`backups/' + path.basename(BACKUP_DIR) + '/`');
  lines.push('');
  lines.push('## 一、结果概览');
  lines.push('');
  lines.push('| 指标 | 数值 |');
  lines.push('| --- | --- |');
  lines.push('| 清理前账号数 | ' + ctx.users.length + '（教师 ' + ctx.users.filter(function (u) { return u.role === 'teacher'; }).length + ' / 学生 ' + ctx.users.filter(function (u) { return u.role === 'student'; }).length + '） |');
  lines.push('| 已注销账号 | ' + cleared + ' |');
  lines.push('| 失败账号 | ' + (ctx.users.length - cleared) + ' |');
  lines.push('| 回收会话 | ' + ctx.removedSessions + ' |');
  lines.push('| 清理后账号数 | ' + (EXECUTE ? '0' : '未变更') + ' |');
  lines.push('| 校验项 | ' + passed + '/' + ctx.verification.length + ' 通过 |');
  lines.push('');
  lines.push('## 二、账号清单');
  lines.push('');
  lines.push('| # | 姓名 | 用户名 | 角色 | 班级 | 完成讲次 | 会话 | 状态 |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  ctx.results.forEach(function (item, index) {
    const user = item.user;
    const done = user.progress && user.progress.done ? user.progress.done : {};
    lines.push('| ' + (index + 1) + ' | ' + user.name + ' | ' + user.username + ' | ' +
      (user.role === 'teacher' ? '老师' : '学生') + ' | ' + (user.className || '-') + ' | ' +
      Object.keys(done).filter(lessonKeyValid).length + ' | ' + item.sessions + ' | ' + item.status + ' |');
  });
  lines.push('');
  lines.push('## 三、逐步执行记录');
  lines.push('');
  lines.push('| 步骤 | 名称 | 结果 | 说明 |');
  lines.push('| --- | --- | --- | --- |');
  stepResults.forEach(function (step) {
    lines.push('| ' + step.no + ' | ' + step.name + ' | ' + (step.ok ? '成功' : '失败') + ' | ' + step.detail + ' |');
  });
  lines.push('');
  lines.push('## 四、清理后校验');
  lines.push('');
  lines.push('| 校验项 | 期望 | 实际 | 结论 |');
  lines.push('| --- | --- | --- | --- |');
  ctx.verification.forEach(function (item) {
    lines.push('| ' + item.name + ' | ' + item.expect + ' | ' + item.actual + ' | ' + (item.ok ? '通过' : '未通过') + ' |');
  });
  lines.push('');
  lines.push('## 五、备份与恢复');
  lines.push('');
  lines.push('- 完整快照：`db.snapshot.json`（SHA-256 `' + ctx.snapshotSha + '`）');
  lines.push('- 逐账号明细：`accounts/*.json`');
  lines.push('- 账号清单：`accounts.csv`；操作日志：`cleanup.log`；清单校验：`manifest.json`');
  lines.push('');
  lines.push('恢复方式：停止 server.js 后，将 `db.snapshot.json` 复制覆盖 `data/db.json`，再重新启动服务。');
  lines.push('');
  lines.push('## 六、结论');
  lines.push('');
  if (EXECUTE) {
    lines.push(failedSteps === 0 && passed === ctx.verification.length
      ? '清理执行完成：' + cleared + ' 个账号已注销，' + ctx.removedSessions + ' 个会话已回收，库内无目标账号残留，备份完整可用于恢复。'
      : '清理存在异常项，请查看上表失败步骤与未通过校验项后再决定是否恢复。');
  } else {
    lines.push('本次为演练模式，未修改 data/db.json；确认清单无误后可加 --execute 正式执行。');
  }

  fs.writeFileSync(REPORT_FILE, lines.join('\n') + '\n', 'utf8');
  ctx.reportPath = REPORT_FILE;
}

/* ---------------- 主流程 ---------------- */

(async function main() {
  writeLine('============================================================');
  writeLine('码阶 CODE LADDER · 全量账号清理操作');
  writeLine('模式：' + (EXECUTE ? '执行删除（--execute）' : '演练（dry-run，不写库）'));
  writeLine('开始时间：' + ctx.startedAt);
  writeLine('操作人：' + (process.env.USERNAME || os.userInfo().username) + '@' + os.hostname());
  writeLine('运行环境：Node ' + process.version + ' · ' + os.platform() + ' ' + os.release());
  writeLine('备份目录：' + BACKUP_DIR);
  writeLine('============================================================');

  /* STEP 1 · 环境预检 */
  const preflightOk = await runStep('环境预检', async function () {
    if (!fs.existsSync(DB_FILE)) throw new Error('未找到数据文件 data/db.json');
    if (await portInUse(PORT)) {
      throw new Error('端口 ' + PORT + ' 仍有账号服务在运行，请先停止 server.js（否则内存中的旧数据会覆盖清理结果）');
    }
    const buffer = fs.readFileSync(DB_FILE);
    const parsed = readJson(DB_FILE);
    if (!parsed || !Array.isArray(parsed.users) || typeof parsed.sessions !== 'object' || parsed.sessions === null) {
      throw new Error('data/db.json 结构不正确，缺少 users 数组或 sessions 对象');
    }
    ctx.original = parsed;
    ctx.users = parsed.users.slice();
    ctx.sessions = Object.assign({}, parsed.sessions);
    ctx.dbShaBefore = sha256(buffer);
    log('INFO', '数据文件 ' + buffer.length + ' 字节，SHA-256 ' + ctx.dbShaBefore);
    log('INFO', '账号 ' + ctx.users.length + ' 个（教师 ' +
      ctx.users.filter(function (u) { return u.role === 'teacher'; }).length + ' / 学生 ' +
      ctx.users.filter(function (u) { return u.role === 'student'; }).length + '），会话 ' +
      Object.keys(ctx.sessions).length + ' 个');
    if (!ctx.users.length) throw new Error('当前没有可清理的账号，操作终止');
    return '数据可读，服务已停止，共 ' + ctx.users.length + ' 个账号待清理';
  });
  if (!preflightOk) {
    log('ABORT', '预检未通过，操作终止，未修改任何数据');
    ctx.finishedAt = now();
    console.log('\n[终止] 预检失败，详情见 ' + LOG_FILE);
    process.exit(1);
  }

  /* STEP 2 · 完整数据库快照 */
  await runStep('备份完整数据库快照', async function () {
    const buffer = fs.readFileSync(DB_FILE);
    fs.writeFileSync(SNAPSHOT_FILE, buffer);
    ctx.snapshotSize = fs.statSync(SNAPSHOT_FILE).size;
    ctx.snapshotSha = sha256(fs.readFileSync(SNAPSHOT_FILE));
    if (ctx.snapshotSha !== ctx.dbShaBefore) throw new Error('快照 SHA-256 与源文件不一致');
    log('INFO', '快照写入 db.snapshot.json（' + ctx.snapshotSize + ' 字节），SHA-256 校验一致');
    return 'db.snapshot.json · ' + ctx.snapshotSize + ' 字节 · SHA-256 一致';
  });

  /* STEP 3 · 逐账号导出 */
  await runStep('逐账号导出 JSON 明细', async function () {
    const sessionMap = accountsOfSession();
    const errors = [];
    ctx.users.forEach(function (user) {
      const record = {
        exportedAt: now(),
        source: 'data/db.json',
        account: user,
        sessions: Object.keys(ctx.sessions).filter(function (token) {
          return ctx.sessions[token] === user.id;
        })
      };
      const file = path.join(ACCOUNT_DIR, user.username + '.json');
      const text = JSON.stringify(record, null, 2);
      fs.writeFileSync(file, text, 'utf8');
      const buffer = Buffer.from(text, 'utf8');
      const digest = sha256(buffer);
      const verify = readJson(file);
      if (!verify.account || verify.account.id !== user.id || verify.account.passwordHash !== user.passwordHash) {
        errors.push(user.username);
      }
      ctx.accountFiles.push({ path: 'accounts/' + user.username + '.json', bytes: buffer.length, sha256: digest });
      ctx.results.push({
        user: user,
        sessions: sessionMap[user.id] || 0,
        status: '待清理',
        backupFile: 'accounts/' + user.username + '.json',
        sha: digest
      });
      log('OK', '已备份账号：' + user.name + '（' + user.username + '，' + user.role + '）→ accounts/' +
        user.username + '.json · ' + digest.slice(0, 16));
    });
    if (errors.length) throw new Error('以下账号备份回读校验失败：' + errors.join(', '));
    return ctx.users.length + ' 个账号已逐个导出并回读校验';
  });

  /* STEP 4 · 账号清单 CSV */
  await runStep('生成账号清单 CSV', async function () {
    writeCsv(null);
    const size = fs.statSync(CSV_FILE).size;
    log('INFO', 'accounts.csv 已生成（' + size + ' 字节，UTF-8 BOM，Excel 可直接打开）');
    return 'accounts.csv · ' + size + ' 字节';
  });

  /* STEP 5 · 清理前清单确认 */
  await runStep('确认清理范围与规则', async function () {
    log('INFO', '清理规则：全量清理数据库内全部 ' + ctx.users.length + ' 个账号（含教师账号）');
    log('INFO', '注销内容：账号记录（含密码哈希与学习进度）+ 该账号全部登录会话');
    ctx.users.forEach(function (user) {
      const done = user.progress && user.progress.done ? user.progress.done : {};
      log('INFO', '目标：' + user.name + '（' + user.username + '）· ' + user.role + ' · ' +
        (user.className || '未分班') + ' · 完成 ' + Object.keys(done).filter(lessonKeyValid).length + ' 讲');
    });
    if (!EXECUTE) log('INFO', '当前为演练模式，以下步骤仅预演，不写入数据库');
    return '范围确认：全部 ' + ctx.users.length + ' 个账号';
  });

  /* STEP 6 · 执行清理（写库） */
  let executionOk = true;
  if (EXECUTE) {
    const backupManifestState = { mode: 'execute' };
    const ok = await runStep('执行账号注销与数据清除', async function () {
      const targetIds = new Set(ctx.users.map(function (u) { return u.id; }));
      const failList = [];
      let cleared = 0;
      let revoked = 0;

      ctx.users.forEach(function (user) {
        try {
          if (!ctx.original.users.some(function (item) { return item.id === user.id; })) {
            throw new Error('账号不在当前数据中');
          }
          const tokens = Object.keys(ctx.sessions).filter(function (token) {
            return ctx.sessions[token] === user.id;
          });
          tokens.forEach(function (token) {
            delete ctx.sessions[token];
            revoked++;
          });
          ctx.original.users = ctx.original.users.filter(function (item) { return item.id !== user.id; });
          cleared++;
          const record = ctx.results.find(function (item) { return item.user.id === user.id; });
          record.status = '已注销';
          log('OK', '账号已注销：' + user.name + '（' + user.username + '）· 进度记录 ' +
            Object.keys(user.progress && user.progress.done ? user.progress.done : {}).filter(lessonKeyValid).length +
            ' 讲已随账号清除 · 回收会话 ' + tokens.length + ' 个');
        } catch (err) {
          const record = ctx.results.find(function (item) { return item.user.id === user.id; });
          record.status = '失败';
          failList.push(user.username + '：' + err.message);
          log('FAIL', '账号注销失败：' + user.name + '（' + user.username + '）· ' + err.message);
        }
      });

      // 回收所有残留会话（含指向已删除账号的孤儿会话）
      Object.keys(ctx.sessions).forEach(function (token) {
        if (!ctx.original.users.some(function (item) { return item.id === ctx.sessions[token]; })) {
          delete ctx.sessions[token];
          revoked++;
          log('INFO', '回收孤儿会话：' + token.slice(0, 12) + '…');
        }
      });
      ctx.removedSessions = revoked;

      const cleanedDb = {
        users: ctx.original.users,
        sessions: ctx.sessions,
        seededAt: ctx.original.seededAt || null,
        lastCleanup: {
          at: now(),
          mode: 'execute',
          scope: 'all',
          accountsCleared: cleared,
          sessionsRevoked: revoked,
          backupDir: 'backups/' + path.basename(BACKUP_DIR),
          snapshotSha256: ctx.snapshotSha
        }
      };

      const temp = DB_FILE + '.cleanup-tmp';
      fs.writeFileSync(temp, JSON.stringify(cleanedDb, null, 2), 'utf8');
      fs.renameSync(temp, DB_FILE);
      ctx.dbShaAfter = sha256(fs.readFileSync(DB_FILE));
      ctx.original = cleanedDb;

      // 逐账号写入 CSV 最终状态
      const statusMap = {};
      ctx.results.forEach(function (item) { statusMap[item.user.id] = item.status; });
      writeCsv(statusMap);

      log('INFO', '数据库已原子写回 data/db.json（临时文件 + rename），新 SHA-256 ' + ctx.dbShaAfter);
      log('INFO', '清理汇总：注销 ' + cleared + ' 个账号，回收 ' + revoked + ' 个会话，剩余账号 ' +
        cleanedDb.users.length + ' 个');

      if (failList.length) throw new Error('部分账号注销失败：' + failList.join('；'));
      return cleared + ' 个账号已注销，回收 ' + revoked + ' 个会话';
    });
    executionOk = ok;
  } else {
    log('INFO', 'STEP 6 · 演练模式，跳过写库，data/db.json 保持原样');
  }

  /* STEP 7 · 清理后校验 */
  await runStep('清理后校验与残留扫描', async function () {
    const checks = [];
    const push = function (name, expect, actual, ok) {
      checks.push({ name: name, expect: expect, actual: actual, ok: ok });
      log(ok ? 'OK' : 'FAIL', '校验 · ' + name + '：期望 ' + expect + '，实际 ' + actual);
    };

    const dbBuffer = fs.readFileSync(DB_FILE);
    let finalDb = null;
    try {
      finalDb = JSON.parse(dbBuffer.toString('utf8'));
    } catch (err) {
      push('数据库可解析', 'JSON 合法', '解析失败：' + err.message, false);
    }
    if (finalDb) {
      push('数据库可解析', 'JSON 合法', '合法（' + dbBuffer.length + ' 字节）', true);
      push('users 结构', '数组', Array.isArray(finalDb.users) ? '数组' : typeof finalDb.users, Array.isArray(finalDb.users));
      push('sessions 结构', '对象', finalDb.sessions && typeof finalDb.sessions === 'object' ? '对象' : '缺失',
        !!(finalDb.sessions && typeof finalDb.sessions === 'object'));

      if (EXECUTE) {
        push('账号总数', '0', String((finalDb.users || []).length), (finalDb.users || []).length === 0);
        const remainingIds = (finalDb.users || []).map(function (u) { return u.id; })
          .filter(function (id) { return ctx.users.some(function (u) { return u.id === id; }); });
        push('目标账号残留', '0', String(remainingIds.length), remainingIds.length === 0);
        push('会话残留', '0', String(Object.keys(finalDb.sessions || {}).length), Object.keys(finalDb.sessions || {}).length === 0);
        const orphans = Object.keys(finalDb.sessions || {}).filter(function (token) {
          return !(finalDb.users || []).some(function (u) { return u.id === finalDb.sessions[token]; });
        });
        push('孤儿会话', '0', String(orphans.length), orphans.length === 0);

        const text = JSON.stringify(finalDb.users) + JSON.stringify(finalDb.sessions);
        const hitUsers = ctx.users.filter(function (u) { return text.indexOf('"' + u.username + '"') !== -1; });
        push('用户名文本残留', '0', String(hitUsers.length), hitUsers.length === 0);
        const hitIds = ctx.users.filter(function (u) { return text.indexOf(u.id) !== -1; });
        push('账号 ID 残留', '0', String(hitIds.length), hitIds.length === 0);
        push('清理审计字段', 'lastCleanup 存在', finalDb.lastCleanup ? '存在' : '缺失', !!finalDb.lastCleanup);
      } else {
        const same = sha256(dbBuffer) === ctx.dbShaBefore;
        push('演练未改动数据库', 'SHA-256 不变', same ? '一致' : '已变化', same);
      }

      // 备份完整性
      const snapshotSha = sha256(fs.readFileSync(SNAPSHOT_FILE));
      push('快照 SHA-256', ctx.snapshotSha, snapshotSha, snapshotSha === ctx.snapshotSha);
      const badBackups = ctx.results.filter(function (item) {
        const file = path.join(BACKUP_DIR, item.backupFile);
        if (!fs.existsSync(file)) return true;
        const record = JSON.parse(fs.readFileSync(file, 'utf8'));
        return !record.account || record.account.passwordHash !== item.user.passwordHash;
      });
      push('逐账号备份可恢复', '全部完整', badBackups.length ? badBackups.length + ' 个异常' : ctx.results.length + ' 个完整',
        badBackups.length === 0);
    }

    ctx.verification = checks;
    return checks.filter(function (c) { return c.ok; }).length + '/' + checks.length + ' 项通过';
  });

  /* STEP 8 · 输出报告 */
  await runStep('输出清理结果统计报告', async function () {
    ctx.finishedAt = now();
    writeManifest({ executed: EXECUTE, steps: stepResults.length, failedSteps: failedSteps });
    writeReport();
    log('INFO', 'report.md 已生成：' + REPORT_FILE);
    log('INFO', 'manifest.json 已写入文件哈希清单');
    return 'report.md + manifest.json';
  });

  ctx.finishedAt = now();

  const cleared = ctx.results.filter(function (r) { return r.status === '已注销'; }).length;
  const passed = ctx.verification.filter(function (v) { return v.ok; }).length;
  writeLine('============================================================');
  writeLine('操作结束：' + ctx.finishedAt);
  writeLine('注销账号 ' + cleared + ' 个 · 回收会话 ' + ctx.removedSessions + ' 个 · 校验 ' +
    passed + '/' + ctx.verification.length + ' 通过 · 失败步骤 ' + failedSteps + ' 个');
  writeLine('备份目录：' + BACKUP_DIR);
  writeLine('============================================================');
  writeManifest({ executed: EXECUTE, steps: stepResults.length, failedSteps: failedSteps });

  process.exit(failedSteps === 0 && passed === ctx.verification.length ? 0 : 1);
})();
