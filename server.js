'use strict';

/* 码阶 CODE LADDER · 账号与进度服务
   仅使用 Node 内置模块，运行：node server.js
   数据文件：data/db.json（含密码哈希，已在静态服务中屏蔽） */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PORT = Number(process.env.PORT || 3000);
const TEACHER_CODE = process.env.TEACHER_CODE || 'TEACH2026';

const TRACK_COUNTS = { basic: 15, algo: 18, adva: 16, advb: 16 };
const TRACK_NAMES = {
  basic: '基础编程培训',
  algo: '算法入门培训',
  adva: '算法提升 A · 数据结构与图论',
  advb: '算法提升 B · 动态规划与数学'
};
const TOTAL_LESSONS = Object.keys(TRACK_COUNTS).reduce((sum, k) => sum + TRACK_COUNTS[k], 0);

let db = { users: [], sessions: {}, seededAt: null };

/* ---------------- 工具 ---------------- */

function localDay(date) {
  const d = date || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function isoNow() {
  return new Date().toISOString();
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

function verifyPassword(password, user) {
  const attempt = Buffer.from(hashPassword(password, user.salt), 'hex');
  const known = Buffer.from(user.passwordHash, 'hex');
  return attempt.length === known.length && crypto.timingSafeEqual(attempt, known);
}

function validLessonKey(key) {
  const match = /^(basic|algo|adva|advb)-(\d{1,2})$/.exec(String(key || ''));
  if (!match) return false;
  const n = Number(match[2]);
  return n >= 1 && n <= TRACK_COUNTS[match[1]];
}

function sanitizeProgress(input) {
  const done = {};
  const days = {};
  const recent = [];
  if (input && typeof input === 'object') {
    const rawDone = input.done && typeof input.done === 'object' ? input.done : {};
    Object.keys(rawDone).forEach(key => {
      if (rawDone[key] && validLessonKey(key)) done[key] = true;
    });
    const rawDays = input.days && typeof input.days === 'object' ? input.days : {};
    Object.keys(rawDays).forEach(key => {
      if (rawDays[key] && /^\d{4}-\d{2}-\d{2}$/.test(key)) days[key] = true;
    });
    const rawRecent = Array.isArray(input.recent) ? input.recent : [];
    rawRecent.forEach(key => {
      if (validLessonKey(key) && recent.indexOf(key) === -1 && recent.length < 8) recent.push(key);
    });
  }
  return { done, days, recent };
}

function emptyProgress() {
  return { done: {}, days: {}, recent: [] };
}

function makeUser(config) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    id: crypto.randomBytes(9).toString('hex'),
    name: config.name,
    username: config.username,
    role: config.role,
    className: config.className || '',
    salt: salt,
    passwordHash: hashPassword(config.password, salt),
    createdAt: isoNow(),
    lastActive: config.lastActive || null,
    progress: sanitizeProgress(config.progress || emptyProgress())
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    className: user.className,
    createdAt: user.createdAt
  };
}

function streakOf(days) {
  const set = new Set(Object.keys(days || {}));
  if (!set.size) return 0;
  const cursor = new Date();
  if (!set.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (set.has(localDay(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function summaryOf(user) {
  const done = user.progress && user.progress.done ? user.progress.done : {};
  const keys = Object.keys(done).filter(validLessonKey);
  const tracks = {};
  Object.keys(TRACK_COUNTS).forEach(id => {
    const prefix = id + '-';
    tracks[id] = {
      name: TRACK_NAMES[id],
      done: keys.filter(key => key.indexOf(prefix) === 0).length,
      total: TRACK_COUNTS[id]
    };
  });
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    className: user.className,
    lastActive: user.lastActive || null,
    doneCount: keys.length,
    total: TOTAL_LESSONS,
    percent: Math.round(keys.length / TOTAL_LESSONS * 100),
    streak: streakOf(user.progress && user.progress.days),
    tracks: tracks
  };
}

/* ---------------- 数据库 ---------------- */

function saveDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = DB_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, DB_FILE);
}

function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      db = { users: [], sessions: {}, seededAt: null };
      saveDb();
      return;
    }
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!parsed || !Array.isArray(parsed.users)) throw new Error('数据结构不正确');
    parsed.sessions = parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {};
    parsed.users.forEach(user => {
      user.progress = sanitizeProgress(user.progress);
      user.lastActive = user.lastActive || null;
    });
    db = parsed;
  } catch (err) {
    console.warn('读取数据文件失败，已重建空数据文件：' + err.message);
    db = { users: [], sessions: {}, seededAt: null };
    saveDb();
  }
}

/* ---------------- HTTP 工具 ---------------- */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function sendText(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(httpError(413, '请求体过大'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(httpError(400, '请求格式不正确'));
      }
    });
    req.on('error', reject);
  });
}

function authUser(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const userId = db.sessions[match[1].trim()];
  if (!userId) return null;
  return db.users.find(user => user.id === userId) || null;
}

function issueToken(userId) {
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = userId;
  return token;
}

/* ---------------- API ---------------- */

async function handleApi(req, res, url) {
  const pathname = url.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, users: db.users.length, seededAt: db.seededAt });
  }

  if (pathname === '/api/register' && req.method === 'POST') {
    const body = await readBody(req);
    const name = String(body.name || '').trim();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const role = body.role === 'teacher' ? 'teacher' : 'student';
    const className = String(body.className || '').trim().slice(0, 30) || '未分班';
    const inviteCode = String(body.inviteCode || '').trim();

    if (name.length < 1 || name.length > 20) throw httpError(400, '姓名请填写 1–20 个字');
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) throw httpError(400, '用户名需为 3–20 位字母、数字或下划线');
    if (password.length < 6) throw httpError(400, '密码至少 6 位');
    if (role === 'teacher' && inviteCode !== TEACHER_CODE) throw httpError(403, '教师邀请码不正确');
    if (db.users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      throw httpError(409, '这个用户名已经被注册了');
    }

    const user = makeUser({
      name: name,
      username: username,
      password: password,
      role: role,
      className: className,
      progress: emptyProgress(),
      lastActive: isoNow()
    });
    db.users.push(user);
    const token = issueToken(user.id);
    saveDb();
    return sendJSON(res, 201, { token: token, user: publicUser(user), progress: user.progress });
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await readBody(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const user = db.users.find(item => item.username.toLowerCase() === username.toLowerCase());
    if (!user || !verifyPassword(password, user)) throw httpError(401, '用户名或密码不正确');
    const token = issueToken(user.id);
    saveDb();
    return sendJSON(res, 200, { token: token, user: publicUser(user), progress: user.progress });
  }

  if (pathname === '/api/me' && req.method === 'GET') {
    const user = authUser(req);
    if (!user) throw httpError(401, '登录状态已失效');
    return sendJSON(res, 200, { user: publicUser(user), progress: user.progress });
  }

  if (pathname === '/api/logout' && req.method === 'POST') {
    const header = req.headers.authorization || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (match) {
      delete db.sessions[match[1].trim()];
      saveDb();
    }
    return sendJSON(res, 200, { ok: true });
  }

  if (pathname === '/api/progress' && req.method === 'PUT') {
    const user = authUser(req);
    if (!user) throw httpError(401, '登录状态已失效');
    const body = await readBody(req);
    user.progress = sanitizeProgress(body);
    user.lastActive = isoNow();
    saveDb();
    return sendJSON(res, 200, { ok: true, progress: user.progress, lastActive: user.lastActive });
  }

  if (pathname === '/api/teacher/students' && req.method === 'GET') {
    const user = authUser(req);
    if (!user) throw httpError(401, '登录状态已失效');
    if (user.role !== 'teacher') throw httpError(403, '仅教师账号可以查看班级学情');
    const students = db.users
      .filter(item => item.role === 'student')
      .map(summaryOf)
      .sort((a, b) => {
        const diff = new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
        if (diff !== 0) return diff;
        return String(a.name).localeCompare(String(b.name), 'zh-CN');
      });
    return sendJSON(res, 200, { students: students });
  }

  if (pathname.indexOf('/api/teacher/students/') === 0 && req.method === 'GET') {
    const user = authUser(req);
    if (!user) throw httpError(401, '登录状态已失效');
    if (user.role !== 'teacher') throw httpError(403, '仅教师账号可以查看班级学情');
    const id = decodeURIComponent(pathname.slice('/api/teacher/students/'.length));
    const student = db.users.find(item => item.id === id && item.role === 'student');
    if (!student) throw httpError(404, '没有找到这位学生');
    const summary = summaryOf(student);
    summary.progress = sanitizeProgress(student.progress);
    return sendJSON(res, 200, { student: summary });
  }

  throw httpError(404, '接口不存在');
}

/* ---------------- 静态文件 ---------------- */

function serveStatic(req, res, pathname) {
  let relative;
  try {
    relative = decodeURIComponent(pathname);
  } catch (err) {
    return sendText(res, 400, 'Bad Request');
  }
  if (relative === '/' || relative === '') relative = '/index.html';
  const segments = relative.split('/').filter(Boolean);
  if (segments.some(segment => segment.charAt(0) === '.')) return sendText(res, 404, 'Not Found');
  if (relative === '/server.js' || relative === '/data' || relative.indexOf('/data/') === 0) {
    return sendText(res, 404, 'Not Found');
  }

  const resolved = path.resolve(path.join(ROOT, relative));
  if (resolved !== path.resolve(ROOT) && resolved.indexOf(path.resolve(ROOT) + path.sep) !== 0) {
    return sendText(res, 404, 'Not Found');
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) return sendText(res, 404, 'Not Found');
    fs.readFile(resolved, (readErr, buffer) => {
      if (readErr) return sendText(res, 500, 'Internal Server Error');
      const ext = path.extname(resolved).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });
      res.end(buffer);
    });
  });
}

/* ---------------- 启动 ---------------- */

loadDb();

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.indexOf('/api/') === 0) {
    handleApi(req, res, url).catch(err => {
      const status = err.status || 500;
      if (status === 500) console.error(err);
      sendJSON(res, status, { error: err.message || '服务器内部错误' });
    });
    return;
  }
  serveStatic(req, res, url.pathname);
}).listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  码阶 CODE LADDER · 账号服务已启动');
  console.log('  本机访问: http://localhost:' + PORT);
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach(name => {
    (interfaces[name] || []).forEach(item => {
      if (item.family === 'IPv4' && !item.internal) {
        console.log('  局域网访问: http://' + item.address + ':' + PORT + '  (' + name + ')');
      }
    });
  });
  console.log('  教师邀请码: ' + TEACHER_CODE);
  console.log('  数据文件: data/db.json');
  console.log('');
});
