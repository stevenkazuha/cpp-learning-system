/* 码阶 CODE LADDER · 应用逻辑 */

(function () {
  'use strict';

  /* ---------------- 基础数据索引 ---------------- */

  const TRACK_MAP = {};
  TRACKS.forEach(t => { TRACK_MAP[t.id] = t; });
  const TRACK_ORDER = ['basic', 'algo', 'adva', 'advb'];
  const ALL_LESSONS = [];
  TRACK_ORDER.forEach(id => {
    TRACK_MAP[id].lessons.forEach(l => {
      ALL_LESSONS.push({ track: TRACK_MAP[id], lesson: l, key: id + '-' + l.n });
    });
  });
  const TOTAL = ALL_LESSONS.length;
  const STORE_KEY = 'codeLadder.progress.v1';
  const DRAFT_KEY = 'codeLadder.drafts.v1';
  const SESSION_KEY = 'codeLadder.session.v1';
  const ROLE_LABEL = { student: '学生', teacher: '老师' };

  const TABS = [
    { id: 'all', label: '全部', tracks: TRACK_ORDER },
    { id: 'basic', label: 'Ⅰ 基础', tracks: ['basic'] },
    { id: 'algo', label: 'Ⅱ 算法入门', tracks: ['algo'] },
    { id: 'adv', label: 'Ⅲ 算法提升', tracks: ['adva', 'advb'] }
  ];

  const BADGES = [
    { name: '起步', en: 'FIRST STEP', check: d => d >= 1 },
    { name: '基础结业', en: 'FOUNDATION', check: () => trackDone(TRACK_MAP.basic) === 15 },
    { name: '算法新兵', en: 'ENTRY', check: () => trackDone(TRACK_MAP.algo) >= 9 },
    { name: '三十讲', en: 'THIRTY', check: d => d >= 30 },
    { name: '过半', en: 'HALFWAY', check: d => d >= Math.ceil(TOTAL / 2) },
    { name: '三级贯通', en: 'ALL CLEAR', check: d => d >= TOTAL }
  ];

  /* ---------------- 本地存储 ---------------- */

  let store = { done: {}, days: {}, recent: [] };
  let drafts = {};

  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      store.done = parsed.done && typeof parsed.done === 'object' ? parsed.done : {};
      store.days = parsed.days && typeof parsed.days === 'object' ? parsed.days : {};
      store.recent = Array.isArray(parsed.recent) ? parsed.recent.slice(0, 8) : [];
    }
  } catch (e) { /* 忽略存储异常 */ }

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) drafts = JSON.parse(raw) || {};
  } catch (e) { drafts = {}; }

  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }
  function persistDrafts() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); } catch (e) { /* ignore */ }
  }

  function isoDay(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function isDone(key) { return !!store.done[key]; }
  function doneCount() { return Object.keys(store.done).filter(k => ALL_LESSONS.some(x => x.key === k)).length; }
  function trackDone(track) {
    return track.lessons.filter(l => isDone(track.id + '-' + l.n)).length;
  }
  function trackPercent(track) {
    return Math.round(trackDone(track) / track.lessons.length * 100);
  }
  function streakDays() {
    const set = new Set(Object.keys(store.days));
    if (!set.size) return 0;
    const cursor = new Date();
    if (!set.has(isoDay(cursor))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (set.has(isoDay(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  /* ---------------- 工具函数 ---------------- */

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.prototype.slice.call(document.querySelectorAll(sel));

  function pad2(n) { return String(n).padStart(2, '0'); }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function normalizeOutput(text) {
    return String(text == null ? '' : text)
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(line => line.replace(/[ \t]+$/g, ''))
      .join('\n')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');
  }

  const CPP_TYPES = new Set(['int', 'long', 'short', 'double', 'float', 'char', 'bool', 'void', 'unsigned', 'signed', 'auto', 'string', 'vector', 'queue', 'stack', 'pair', 'priority_queue', 'size_t']);
  const CPP_KEYWORDS = new Set(['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'using', 'namespace', 'struct', 'class', 'const', 'static', 'inline', 'true', 'false', 'new', 'delete', 'try', 'catch', 'throw', 'template', 'typename', 'public', 'private', 'protected', 'goto', 'operator']);
  const CPP_STD = new Set(['cout', 'cin', 'endl', 'sort', 'max', 'min', 'swap', 'memset', 'greater', 'getline', 'ios', 'isalpha', 'isdigit', 'toupper', 'tolower', 'to_string', 'reverse', 'next_permutation', 'printf', 'scanf', 'getchar', 'isdigit', '__builtin_popcount', 'stable_sort', 'lower_bound', 'upper_bound', 'push_back', 'begin', 'end', 'size', 'empty', 'back', 'front']);

  function highlightCode(code) {
    let out = '';
    let i = 0;
    const n = code.length;
    while (i < n) {
      const c = code[i];
      if (c === '/' && code[i + 1] === '/') {
        let j = code.indexOf('\n', i);
        if (j === -1) j = n;
        out += '<span class="c-com">' + esc(code.slice(i, j)) + '</span>';
        i = j;
        continue;
      }
      if (c === '/' && code[i + 1] === '*') {
        let j = code.indexOf('*/', i + 2);
        j = j === -1 ? n : j + 2;
        out += '<span class="c-com">' + esc(code.slice(i, j)) + '</span>';
        i = j;
        continue;
      }
      if (c === '#') {
        let j = code.indexOf('\n', i);
        if (j === -1) j = n;
        out += '<span class="c-pre">' + esc(code.slice(i, j)) + '</span>';
        i = j;
        continue;
      }
      if (c === '"' || c === "'") {
        const quote = c;
        let j = i + 1;
        while (j < n && code[j] !== quote) {
          if (code[j] === '\\') j++;
          j++;
        }
        j = Math.min(j + 1, n);
        out += '<span class="c-str">' + esc(code.slice(i, j)) + '</span>';
        i = j;
        continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < n && /[0-9a-fA-FxX.]/.test(code[j])) j++;
        out += '<span class="c-num">' + esc(code.slice(i, j)) + '</span>';
        i = j;
        continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_]/.test(code[j])) j++;
        const word = code.slice(i, j);
        let cls = '';
        if (CPP_KEYWORDS.has(word)) cls = 'c-kw';
        else if (CPP_TYPES.has(word)) cls = 'c-ty';
        else if (CPP_STD.has(word)) cls = 'c-fn';
        out += cls ? '<span class="' + cls + '">' + esc(word) + '</span>' : esc(word);
        i = j;
        continue;
      }
      out += esc(c);
      i++;
    }
    return out;
  }

  /* ---------------- 状态 ---------------- */

  const state = {
    view: 'home',
    courseFilter: 'all',
    query: '',
    schedMode: 'semester',
    schedTrack: 'basic',
    problemId: PROBLEMS.length ? PROBLEMS[0].id : null,
    editorReady: false,
    modalKey: null,
    running: false,
    authMode: 'login',
    registerRole: 'student',
    classFilter: 'all',
    studentQuery: '',
    teacherStudents: [],
    teacherLoaded: false,
    teacherLoading: false,
    studentDetailId: null,
    lastFocus: null
  };

  /* ---------------- 账号状态 ---------------- */

  let auth = { token: null, user: null };

  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token && parsed.user) {
        auth.token = parsed.token;
        auth.user = parsed.user;
      }
    } catch (e) { /* ignore */ }
  }

  function saveSession() {
    try {
      if (auth.token && auth.user) localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* ignore */ }
  }

  function isLoggedIn() { return !!(auth.token && auth.user); }
  function isTeacher() { return isLoggedIn() && auth.user.role === 'teacher'; }
  function isStudent() { return !isLoggedIn() || auth.user.role === 'student'; }

  async function apiRequest(path, options) {
    const opts = options || {};
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (auth.token) headers.Authorization = 'Bearer ' + auth.token;
    const response = await fetch(path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    let payload = null;
    try { payload = await response.json(); } catch (e) { payload = null; }
    if (!response.ok) {
      const err = new Error((payload && payload.error) || ('请求失败（' + response.status + '）'));
      err.status = response.status;
      throw err;
    }
    return payload || {};
  }

  function serverAvailable() {
    return location.protocol === 'http:' || location.protocol === 'https:';
  }

  let syncTimer = null;
  let syncPending = false;
  let syncQueued = false;
  function syncProgress() {
    if (!isLoggedIn() || isTeacher() || !serverAvailable()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(pushProgress, 600);
  }

  async function pushProgress() {
    if (!isLoggedIn() || isTeacher() || !serverAvailable()) return;
    if (syncPending) {
      syncQueued = true;
      return;
    }
    syncPending = true;
    try {
      await apiRequest('/api/progress', { method: 'PUT', body: store });
    } catch (err) {
      if (err.status === 401) {
        clearAuth('登录状态已失效，请重新登录');
      }
    } finally {
      syncPending = false;
      if (syncQueued) {
        syncQueued = false;
        syncProgress();
      }
    }
  }

  function applyProgress(progress) {
    if (!progress || typeof progress !== 'object') return;
    store = {
      done: progress.done && typeof progress.done === 'object' ? progress.done : {},
      days: progress.days && typeof progress.days === 'object' ? progress.days : {},
      recent: Array.isArray(progress.recent) ? progress.recent.slice(0, 8) : []
    };
    persist();
  }

  function applyAuth(payload) {
    auth.token = payload.token || auth.token;
    auth.user = payload.user || auth.user;
    saveSession();
    applyProgress(payload.progress);
    state.teacherStudents = [];
    state.teacherLoaded = false;
    renderAuthUI();
    renderProgressEverywhere();
  }

  function clearAuth(message) {
    auth = { token: null, user: null };
    store = { done: {}, days: {}, recent: [] };
    persist();
    saveSession();
    state.teacherStudents = [];
    state.teacherLoaded = false;
    state.teacherLoading = false;
    state.classFilter = 'all';
    state.studentQuery = '';
    const searchEl = $('#studentSearch');
    if (searchEl) searchEl.value = '';
    renderAuthUI();
    renderProgressEverywhere();
    if (state.view === 'teacher') navigate('home');
    if (message) showToast(message);
  }

  async function restoreSession() {
    if (!isLoggedIn() || !serverAvailable()) {
      renderAuthUI();
      return;
    }
    try {
      const data = await apiRequest('/api/me');
      auth.user = data.user;
      saveSession();
      applyProgress(data.progress);
    } catch (err) {
      if (err.status === 401) {
        auth = { token: null, user: null };
        store = { done: {}, days: {}, recent: [] };
        persist();
        saveSession();
      }
    }
    renderAuthUI();
    renderProgressEverywhere();
  }

  function renderAuthUI() {
    const chip = $('#userChip');
    const entry = $('#authEntry');
    const menu = $('#userMenu');
    if (chip) {
      chip.hidden = !isLoggedIn();
      if (isLoggedIn()) {
        $('#userAvatar').textContent = String(auth.user.name || '学').charAt(0);
        $('#userName').textContent = auth.user.name;
        $('#userRole').textContent = ROLE_LABEL[auth.user.role] + (auth.user.className ? ' · ' + auth.user.className : '');
      }
    }
    if (entry) entry.hidden = isLoggedIn();
    if (menu && !isLoggedIn()) {
      menu.hidden = true;
      chip && chip.setAttribute('aria-expanded', 'false');
    }
    const head = $('#userMenuHead');
    if (head) {
      head.textContent = isLoggedIn()
        ? auth.user.name + ' · ' + auth.user.username + ' · ' + ROLE_LABEL[auth.user.role]
        : '未登录';
    }
    document.body.dataset.userRole = isLoggedIn() ? auth.user.role : 'guest';
    const isTeacherRole = isTeacher();
    $$('[data-student-only]').forEach(el => { el.hidden = isTeacherRole; });
    $$('[data-teacher-only]').forEach(el => { el.hidden = !isTeacherRole; });
    const headerProgress = $('.header-progress');
    if (headerProgress) headerProgress.hidden = isTeacherRole;
  }

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
  }

  /* ---------------- 进度展示 ---------------- */

  function refreshHeader() {
    const done = doneCount();
    $('#headerDone').textContent = done;
    $('#headerTotal').textContent = TOTAL;
    $('#topProgressBar').style.width = (done / TOTAL * 100).toFixed(2) + '%';
  }

  function renderProgressEverywhere() {
    refreshHeader();
    if (state.view === 'home') renderHome();
    if (state.view === 'courses') renderCourses();
    if (state.view === 'me') renderDashboard();
  }

  /* ---------------- 首页：阶梯卡片 ---------------- */

  function stageProgress(stage) {
    let done = 0, total = 0;
    stage.trackIds.forEach(id => {
      const t = TRACK_MAP[id];
      done += trackDone(t);
      total += t.lessons.length;
    });
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  }

  function renderTracks() {
    const wrap = $('#trackCards');
    if (!wrap) return;
    wrap.innerHTML = STAGES.map((stage, index) => {
      const primary = TRACK_MAP[stage.trackIds[0]];
      const prog = stageProgress(stage);
      const isAdv = stage.trackIds.length > 1;
      const dark = index === 1 ? ' track--dark' : '';
      const tags = isAdv
        ? TRACK_MAP.adva.highlights.slice(0, 2).concat(TRACK_MAP.advb.highlights.slice(0, 2))
        : primary.highlights;
      const sub = isAdv ? `
        <div class="stage-sub">
          ${stage.trackIds.map((id, i) => {
            const t = TRACK_MAP[id];
            return `<div class="stage-sub-row">
              <b>${t.roman}</b>
              <span>${esc(t.name.replace('算法提升 ', ''))}</span>
              <em>${trackDone(t)}/${t.lessons.length}</em>
            </div>`;
          }).join('')}
        </div>` : `<ul class="tag-list">${tags.map(x => `<li class="tag">${esc(x)}</li>`).join('')}</ul>`;

      return `
      <article class="track${dark}">
        <div class="track-top">
          <span class="track-roman">${stage.roman}</span>
          <span class="track-en">${esc(stage.en)}</span>
        </div>
        <h3>${esc(stage.name)}</h3>
        <p class="track-sum">${esc(stage.summary)}</p>
        <dl class="track-meta">
          <div><dt>适合</dt><dd>${esc(isAdv ? '完成算法入门 · 按方向自由组合' : primary.audience)}</dd></div>
          ${stage.meta.map(m => `<div><dt>${esc(m.k)}</dt><dd>${esc(m.v)}</dd></div>`).join('')}
        </dl>
        ${sub}
        <div class="track-progress">
          <span>${prog.pct}%</span>
          <div class="bar"><i style="width:${prog.pct}%"></i></div>
          <span>${prog.done}/${prog.total}</span>
        </div>
        <button class="track-link" type="button" data-goto-track="${stage.id}">
          查看 ${stage.lectures} 讲 <span>→</span>
        </button>
      </article>`;
    }).join('');
  }

  /* ---------------- 首页：排课 ---------------- */

  function renderModeChips() {
    const wrap = $('#modeChips');
    if (!wrap) return;
    wrap.innerHTML = TRACK_ORDER.map(id => {
      const t = TRACK_MAP[id];
      return `<button class="track-chip${state.schedTrack === id ? ' is-active' : ''}" type="button" data-sched-track="${id}">${esc(t.short)} · ${t.lessons.length} 讲</button>`;
    }).join('');
  }

  function buildCampDays(track) {
    const days = [];
    const totalSlots = track.campDays * 2;
    let idx = 0;
    for (let s = 0; s < totalSlots; s++) {
      const dayIndex = Math.floor(s / 2);
      if (!days[dayIndex]) days[dayIndex] = { day: dayIndex + 1, slots: [] };
      const items = [];
      if (idx < track.lessons.length) {
        items.push(track.lessons[idx++]);
        if (s === totalSlots - 1) {
          while (idx < track.lessons.length) items.push(track.lessons[idx++]);
        }
      }
      const half = s % 2 === 0 ? '上午' : '下午';
      let empty = '';
      if (!items.length) {
        empty = track.id === 'algo'
          ? (half === '上午' ? '测评讲评 · 错题复盘' : '一对一学习规划')
          : '结营 · 学习规划';
      }
      days[dayIndex].slots.push({ half: half, items: items, empty: empty });
    }
    return days;
  }

  function renderSchedule() {
    const panel = $('#schedulePanel');
    if (!panel) return;
    $$('.mode-tab').forEach(b => {
      const on = b.dataset.schedMode === state.schedMode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    const track = TRACK_MAP[state.schedTrack] || TRACK_MAP.basic;

    if (state.schedMode === 'semester') {
      const rows = track.lessons.map((l, i) => {
        const done = isDone(track.id + '-' + l.n);
        return `<div class="week-row${done ? ' is-done' : ''}" data-open-lesson="${track.id}-${l.n}" role="button" tabindex="0">
          <span class="week-no">W${pad2(i + 1)}</span>
          <span class="week-title">${esc(l.title)}</span>
          <span class="week-tag">90 min</span>
        </div>`;
      }).join('');
      panel.innerHTML = `
        <div class="semester-grid" style="grid-template-rows:repeat(${Math.ceil(track.lessons.length / 2)}, auto);grid-auto-flow:column;">${rows}</div>
        <div class="mode-foot">
          <span>${esc(track.name)} · 学期制 共 ${track.lessons.length} 讲</span>
          <span>每周 1 讲 · 每讲 90 分钟 · 讲授 + 上机</span>
        </div>`;
      return;
    }

    const days = buildCampDays(track);
    panel.innerHTML = `
      <div class="camp-grid" style="--camp-cols:${days.length === 10 ? 5 : 4}">
        ${days.map(d => `
          <div class="day-card">
            <div class="day-head"><span>DAY</span><b>${pad2(d.day)}</b></div>
            ${d.slots.map(slot => `
              <div class="day-slot">
                <span class="slot-label">${slot.half}</span>
                <div class="slot-lesson${slot.empty ? ' is-empty' : ''}">
                  ${slot.empty ? esc(slot.empty) : slot.items.map(l => `
                    <button class="slot-btn" type="button" data-open-lesson="${track.id}-${l.n}">
                      <small>第 ${pad2(l.n)} 讲 · ${l.n === track.lessons.length && /结课/.test(l.title) ? '测评' : '正课'}</small>
                      <span>${esc(l.title)}</span>
                    </button>`).join('')}
                </div>
              </div>`).join('')}
          </div>`).join('')}
      </div>
      <div class="mode-foot">
        <span>${esc(track.name)} · 假期集训 ${track.campDays} 天 · 上下午各一个教学点</span>
        <span>每个教学点 90 分钟 · 点击讲次查看讲义</span>
      </div>`;
  }

  /* ---------------- 首页：精选讲次 ---------------- */

  function renderFeatured() {
    const wrap = $('#featuredGrid');
    if (!wrap) return;
    wrap.innerHTML = FEATURED.map(item => {
      const track = TRACK_MAP[item.trackId];
      const lesson = track.lessons.find(l => l.n === item.n);
      if (!lesson) return '';
      const codeLines = lesson.code.body.split('\n').slice(0, 7).join('\n');
      return `
      <article class="feature-card" data-open-lesson="${track.id}-${lesson.n}" role="button" tabindex="0">
        <div class="fc-head"><span>${track.roman} · 第 ${pad2(lesson.n)} 讲</span><span>${esc(track.short)}</span></div>
        <div class="fc-body">
          <h3>${esc(lesson.title)}</h3>
          <p>${esc(lesson.sub)}</p>
          <ul class="tag-list">${lesson.tags.map(t => `<li class="tag">${esc(t)}</li>`).join('')}</ul>
        </div>
        <pre class="fc-code">${highlightCode(codeLines)}</pre>
        <div class="fc-foot"><span>讲义 / 示例 / 任务</span><span>查看 →</span></div>
      </article>`;
    }).join('');
  }

  function renderHome() {
    renderTracks();
    renderModeChips();
    renderSchedule();
    renderFeatured();
    refreshHeader();
    observeReveals();
  }

  /* ---------------- 课程总览 ---------------- */

  function renderCourseTabs() {
    const wrap = $('#courseTabs');
    if (!wrap) return;
    wrap.innerHTML = TABS.map(tab => {
      const count = getLessonsByFilter(tab.id).length;
      return `<button class="seg-btn${state.courseFilter === tab.id ? ' is-active' : ''}" type="button" data-filter="${tab.id}" role="tab" aria-selected="${state.courseFilter === tab.id}">${tab.label} ${count}</button>`;
    }).join('');
  }

  function getLessonsByFilter(filterId) {
    const tab = TABS.find(t => t.id === filterId) || TABS[0];
    const list = [];
    tab.tracks.forEach(id => {
      const t = TRACK_MAP[id];
      t.lessons.forEach(l => list.push({ track: t, lesson: l }));
    });
    return list;
  }

  function getFilteredLessons() {
    let list = getLessonsByFilter(state.courseFilter);
    const q = state.query.trim().toLowerCase();
    if (q) {
      list = list.filter(item => {
        const haystack = [
          item.lesson.title,
          item.lesson.sub,
          item.track.name,
          item.track.short,
          item.lesson.tags.join(' '),
          item.lesson.points.join(' ')
        ].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      });
    }
    return list;
  }

  function lessonCardHTML(track, lesson) {
    const key = track.id + '-' + lesson.n;
    const done = isDone(key);
    return `
    <article class="lesson-card${done ? ' is-done' : ''}" data-track="${track.id}" data-n="${lesson.n}" role="button" tabindex="0" aria-label="查看第 ${lesson.n} 讲 ${esc(lesson.title)}">
      <div class="lesson-card-top">
        <span class="lesson-num">${pad2(lesson.n)}</span>
        <span class="lesson-track">${track.roman} · ${esc(track.short)}</span>
      </div>
      <h3>${esc(lesson.title)}</h3>
      <p>${esc(lesson.sub)}</p>
      <ul class="tag-list">${lesson.tags.slice(0, 3).map(t => `<li class="tag">${esc(t)}</li>`).join('')}</ul>
      <div class="lesson-card-foot">
        <button class="check-btn" type="button" data-toggle-lesson="${key}" aria-pressed="${done}">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8.5l3.4 3.4 7.6-7.8" stroke="currentColor" stroke-width="1.8"/></svg>
          ${done ? '已完成' : '标记完成'}
        </button>
        <span class="lesson-open">查看讲义 →</span>
      </div>
    </article>`;
  }

  function renderCourses() {
    renderCourseTabs();
    const grid = $('#courseGrid');
    if (!grid) return;
    const list = getFilteredLessons();
    grid.innerHTML = list.map(item => lessonCardHTML(item.track, item.lesson)).join('');
    const empty = $('#courseEmpty');
    if (empty) empty.hidden = list.length > 0;
    const count = $('#courseCount');
    if (count) count.textContent = state.query.trim() ? '找到 ' + list.length + ' 讲' : '共 ' + list.length + ' 讲';
    const clear = $('#searchClear');
    if (clear) clear.hidden = !state.query;
    const prog = $('#courseProgress');
    if (prog) {
      const done = doneCount();
      const pct = Math.round(done / TOTAL * 100);
      const nxt = nextLesson();
      prog.innerHTML = `
        <span>总进度 <b>${done}</b> / ${TOTAL} 讲</span>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <span>${pct}%</span>
        ${nxt
          ? `<button class="course-resume" type="button" data-open-lesson="${nxt.track.id}-${nxt.lesson.n}">继续第 ${pad2(nxt.lesson.n)} 讲 →</button>`
          : '<span class="course-resume is-done">全部完成</span>'}`;
    }
  }

  function setCourseFilter(filterId) {
    state.courseFilter = filterId;
    renderCourses();
  }

  /* ---------------- 课程弹窗 ---------------- */

  function openLesson(trackId, n) {
    const track = TRACK_MAP[trackId];
    if (!track) return;
    const lesson = track.lessons.find(l => l.n === Number(n));
    if (!lesson) return;
    const key = track.id + '-' + lesson.n;
    state.modalKey = key;
    if (!$('#lessonModal').classList.contains('is-open')) {
      state.lastFocus = document.activeElement;
    }

    store.recent = [key].concat(store.recent.filter(k => k !== key)).slice(0, 8);
    persist();
    syncProgress();

    const saved = isDone(key);
    const index = track.lessons.findIndex(l => l.n === lesson.n);
    const prev = track.lessons[index - 1];
    const next = track.lessons[index + 1];
    const problem = PROBLEMS.find(p => p.trackId === track.id && p.lesson === lesson.n);

    const body = $('#modalBody');
    body.innerHTML = `
      <div class="modal-head">
        <p class="eyebrow">${track.roman} / ${esc(track.name)}</p>
        <h2 id="modalTitle">${esc(lesson.title)}</h2>
        <p class="m-sub">${esc(lesson.sub)}</p>
      </div>
      <div class="modal-stamp${saved ? ' is-visible' : ''}" id="modalStamp">已完成 · ARCHIVED</div>

      <div class="modal-grid">
        <div>
          <div class="m-block">
            <h4>学习目标</h4>
            <ul class="m-list">${lesson.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
          </div>
          <div class="m-block">
            <h4>课后任务</h4>
            <ul class="m-list m-list-plain">${lesson.tasks.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          </div>
          <div class="m-block">
            <h4>本讲信息</h4>
            <dl class="meta-rows">
              <div class="meta-row"><dt>所属阶梯</dt><dd>${esc(track.name)}</dd></div>
              <div class="meta-row"><dt>建议时长</dt><dd>90 分钟（讲授 45 + 上机 45）</dd></div>
              <div class="meta-row"><dt>配套内容</dt><dd>讲义 / 示例代码 / 课后任务 / 在线判题</dd></div>
              <div class="meta-row"><dt>讲次位置</dt><dd>第 ${pad2(lesson.n)} 讲 / 共 ${track.lessons.length} 讲</dd></div>
            </dl>
          </div>
        </div>

        <div>
          <div class="m-block">
            <h4>示例代码 · ${esc(lesson.code.title)}</h4>
            <div class="m-code">
              <div class="m-code-head"><span>main.cpp</span><span>C++17</span></div>
              <pre>${highlightCode(lesson.code.body)}</pre>
            </div>
          </div>
          <div class="m-block">
            <h4>课堂节奏</h4>
            <div class="meta-rows">
              <div class="meta-row"><dt>00–45</dt><dd>知识讲解：概念、图示与手推演算</dd></div>
              <div class="meta-row"><dt>45–80</dt><dd>示例拆解：一起读代码、现场改写</dd></div>
              <div class="meta-row"><dt>80–90</dt><dd>上机任务：独立完成并提交运行</dd></div>
            </div>
          </div>
          <div class="m-block">
            <h4>配套练习</h4>
            ${problem
              ? `<div class="meta-row" style="grid-template-columns:1fr auto;align-items:center;">
                   <dd>${esc(problem.title)} · ${esc(problem.difficulty)}</dd>
                   <button class="m-goto" type="button" data-open-problem="${problem.id}">去上机 →</button>
                 </div>
                 ${problem.external ? `<div class="m-ext-links">
                   <span>外站同类题</span>
                   ${problem.external.luogu ? `<a href="https://www.luogu.com.cn/problem/${problem.external.luogu.pid}" target="_blank" rel="noopener noreferrer">洛谷 ${problem.external.luogu.pid} ↗</a>` : ''}
                   ${problem.external.nowcoder ? `<a href="https://ac.nowcoder.com/acm/problem/list?keyword=${encodeURIComponent(problem.external.nowcoder.keyword)}" target="_blank" rel="noopener noreferrer">牛客搜「${esc(problem.external.nowcoder.keyword)}」↗</a>` : ''}
                 </div>` : ''}`
              : `<p class="m-sub" style="margin-top:4px;">本讲为综合/测评讲次，可在在线判题台自由练习任意题目。</p>
                 <div class="m-ext-links">
                   <span>外站检索</span>
                   <a href="https://www.luogu.com.cn/problem/list?keyword=${encodeURIComponent(lesson.title)}" target="_blank" rel="noopener noreferrer">洛谷搜「${esc(lesson.title)}」↗</a>
                   <a href="https://ac.nowcoder.com/acm/problem/list?keyword=${encodeURIComponent(lesson.title)}" target="_blank" rel="noopener noreferrer">牛客搜「${esc(lesson.title)}」↗</a>
                 </div>`}
          </div>
        </div>
      </div>

      <div class="modal-foot">
        <div class="m-nav">
          <button type="button" data-modal-nav="prev" ${prev ? '' : 'disabled'}>← 上一讲</button>
          <button type="button" data-modal-nav="next" ${next ? '' : 'disabled'}>下一讲 →</button>
        </div>
        <div class="m-actions">
          <span class="m-note">${isLoggedIn() ? '进度同步到账号' : '进度只保存在本机'}</span>
          <button class="btn btn-sm ${saved ? 'btn-ink' : 'btn-primary'}" type="button" data-toggle-lesson="${key}">
            ${saved ? '取消完成' : '标记完成'}
          </button>
        </div>
      </div>`;

    $('#lessonModal').classList.add('is-open');
    document.body.classList.add('modal-open');
    const closeBtn = $('.modal-close');
    if (closeBtn) {
      setTimeout(function () {
        if ($('#lessonModal').classList.contains('is-open')) closeBtn.focus({ preventScroll: true });
      }, 60);
    }
    if (state.view === 'me') renderDashboard();
  }

  function closeModal() {
    const modal = $('#lessonModal');
    const hadOpen = modal.classList.contains('is-open');
    modal.classList.remove('is-open');
    syncBodyLock();
    state.modalKey = null;
    if (hadOpen) {
      const last = state.lastFocus;
      state.lastFocus = null;
      if (last && typeof last.focus === 'function' && document.body.contains(last)) {
        last.focus({ preventScroll: true });
      }
    }
  }

  function trapFocus(container, e) {
    const nodes = container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const list = Array.prototype.filter.call(nodes, el => el.offsetParent !== null);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first || !container.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function syncBodyLock() {
    const anyOpen = $$('.modal.is-open').length > 0;
    document.body.classList.toggle('modal-open', anyOpen);
  }

  function toggleLesson(key) {
    if (!key) return;
    const wasDone = isDone(key);
    if (wasDone) {
      delete store.done[key];
    } else {
      store.done[key] = true;
      store.days[isoDay()] = true;
    }
    persist();
    renderProgressEverywhere();
    syncProgress();

    const stamp = $('#modalStamp');
    if (stamp) stamp.classList.toggle('is-visible', !wasDone);

    const modalBtn = $('#modalBody [data-toggle-lesson]');
    if (modalBtn) {
      modalBtn.textContent = wasDone ? '标记完成' : '取消完成';
      modalBtn.className = 'btn btn-sm ' + (wasDone ? 'btn-primary' : 'btn-ink');
    }

    const parts = key.split('-');
    const track = TRACK_MAP[parts[0]];
    const lesson = track ? track.lessons.find(l => l.n === Number(parts[1])) : null;
    showToast((wasDone ? '已取消完成 · ' : '已标记完成 · ') + (track ? track.short + ' 第 ' + pad2(parts[1]) + ' 讲' : key) + (lesson ? '「' + lesson.title + '」' : ''));
  }

  function openProblem(id) {
    if (!PROBLEMS.some(p => p.id === id)) return;
    closeModal();
    state.problemId = id;
    navigate('code');
  }

  /* ---------------- 在线编程 ---------------- */

  function currentProblem() {
    return PROBLEMS.find(p => p.id === state.problemId) || PROBLEMS[0];
  }

  function renderProblemRail() {
    const rail = $('#problemList');
    if (!rail) return;
    rail.innerHTML = PROBLEMS.map(p => {
      const t = TRACK_MAP[p.trackId];
      return `
      <button class="rail-item${p.id === state.problemId ? ' is-active' : ''}" type="button" data-problem="${p.id}">
        <span class="ri-top"><span>${t.roman} · 第 ${pad2(p.lesson)} 讲</span><span class="ri-diff">${esc(p.difficulty)}</span></span>
        <h4>${esc(p.title)}</h4>
      </button>`;
    }).join('');
    const active = rail.querySelector('.rail-item.is-active');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function renderStatement(p) {
    const panel = $('#statementPanel');
    if (!panel) return;
    const track = TRACK_MAP[p.trackId];
    const index = PROBLEMS.findIndex(x => x.id === p.id);
    panel.innerHTML = `
      <div class="st-bar">
        <span>PROBLEM ${pad2(index + 1)} / ${pad2(PROBLEMS.length)}</span>
        <div class="st-nav">
          <button type="button" data-problem-step="prev" ${index > 0 ? '' : 'disabled'}>← 上一题</button>
          <button type="button" data-problem-step="next" ${index < PROBLEMS.length - 1 ? '' : 'disabled'}>下一题 →</button>
        </div>
      </div>
      <div class="st-meta">
        <span class="st-tag st-level">${esc(p.difficulty)}</span>
        ${p.tags.map(t => `<span class="st-tag">${esc(t)}</span>`).join('')}
        <span class="st-tag">${track.roman} · 第 ${pad2(p.lesson)} 讲</span>
      </div>
      <h2>${esc(p.title)}</h2>
      ${p.statement.map(t => `<p>${esc(t)}</p>`).join('')}
      <div class="io-block"><b>输入格式</b>${esc(p.input)}</div>
      <div class="io-block"><b>输出格式</b>${esc(p.output)}</div>
      <div class="samples">
        ${p.samples.map(s => `
          <div class="sample">
            <span class="sample-label">样例输入</span>
            <pre>${esc(s.in)}</pre>
          </div>
          <div class="sample">
            <span class="sample-label">样例输出</span>
            <pre>${esc(s.out)}</pre>
          </div>`).join('')}
      </div>
      <div class="st-hint">提示 · ${esc(p.hint)}</div>
      ${p.external ? `
      <div class="st-external">
        <span class="st-ext-label">EXTERNAL / 外站同类题 · 新标签打开</span>
        <div class="st-ext-list">
          ${p.external.luogu ? `<a class="st-ext" href="https://www.luogu.com.cn/problem/${p.external.luogu.pid}" target="_blank" rel="noopener noreferrer">
            <b>洛谷</b><span>${p.external.luogu.pid} · ${esc(p.external.luogu.title)}</span><i>↗</i>
          </a>` : ''}
          ${p.external.nowcoder ? `<a class="st-ext" href="https://ac.nowcoder.com/acm/problem/list?keyword=${encodeURIComponent(p.external.nowcoder.keyword)}" target="_blank" rel="noopener noreferrer">
            <b>牛客</b><span>搜索「${esc(p.external.nowcoder.keyword)}」</span><i>↗</i>
          </a>` : ''}
        </div>
      </div>` : ''}
      <button class="st-goto" type="button" data-open-lesson="${p.trackId}-${p.lesson}">查看对应讲义 · 第 ${pad2(p.lesson)} 讲 →</button>`;
  }

  function updateEditor() {
    const ta = $('#codeInput');
    const pre = $('#codeHighlight');
    const gutter = $('#lineNums');
    if (!ta || !pre || !gutter) return;
    pre.innerHTML = highlightCode(ta.value);
    const lines = ta.value.split('\n').length;
    let nums = '';
    for (let i = 1; i <= lines; i++) nums += i + '\n';
    gutter.textContent = nums;
    syncEditorScroll();
  }

  function syncEditorScroll() {
    const ta = $('#codeInput');
    const pre = $('#codeHighlight');
    const gutter = $('#lineNums');
    if (!ta) return;
    if (pre) {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    }
    if (gutter) gutter.scrollTop = ta.scrollTop;
  }

  function setConsole(message, verdict, verdictState, isError) {
    const out = $('#consoleOut');
    const v = $('#verdict');
    if (out) {
      out.textContent = message;
      out.classList.toggle('is-error', !!isError);
      const body = out.parentElement;
      if (body) body.scrollTop = 0;
    }
    if (v) {
      v.textContent = verdict;
      v.classList.remove('is-ok', 'is-bad', 'is-busy');
      if (verdictState) v.classList.add(verdictState);
    }
  }

  function resetConsole(message) {
    const list = $('#testList');
    if (list) list.innerHTML = '';
    setConsole(message || '按 Ctrl + Enter 运行代码。首次运行会调用在线编译器，需要几秒钟。', '就绪', '');
  }

  function loadProblem(id) {
    const p = PROBLEMS.find(x => x.id === id) || PROBLEMS[0];
    if (!p) return;
    const ta = $('#codeInput');
    if (state.editorReady && ta && state.problemId) {
      drafts[state.problemId] = ta.value;
      persistDrafts();
    }
    state.problemId = p.id;
    renderProblemRail();
    renderStatement(p);
    const panel = $('#statementPanel');
    if (panel) panel.scrollTop = 0;
    if (ta) {
      ta.value = drafts[p.id] !== undefined ? drafts[p.id] : p.template;
      ta.scrollTop = 0;
      ta.scrollLeft = 0;
      updateEditor();
      state.editorReady = true;
    }
    resetConsole();
  }

  function stepProblem(dir) {
    const index = PROBLEMS.findIndex(p => p.id === state.problemId);
    const target = PROBLEMS[index + dir];
    if (target) loadProblem(target.id);
  }

  function renderCodeView() {
    const count = $('#problemCount');
    if (count) count.textContent = PROBLEMS.length;
    renderProblemRail();
    loadProblem(state.problemId || PROBLEMS[0].id);
  }

  function saveDraftNow() {
    const ta = $('#codeInput');
    if (!ta || !state.problemId) return;
    drafts[state.problemId] = ta.value;
    persistDrafts();
  }

  async function compileRemote(code, stdin) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 22000);
    try {
      const response = await fetch(COMPILER.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language_id: COMPILER.languageId,
          stdin: stdin
        }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const raw = await response.json();
      const statusId = raw.status ? raw.status.id : null;
      const accepted = statusId === 3;
      return {
        data: {
          status: accepted ? '0' : String(statusId == null ? '1' : statusId),
          compiler_error: (!accepted && raw.compile_output) ? raw.compile_output : '',
          compiler_output: '',
          program_output: raw.stdout == null ? '' : raw.stdout,
          program_error: [raw.stderr, raw.message].filter(Boolean).join('\n')
        }
      };
    } catch (err) {
      return { offline: true, error: err };
    } finally {
      clearTimeout(timer);
    }
  }

  function testRowHTML(index, result) {
    let mark = '·';
    let label = '待运行';
    let cls = '';
    if (result) {
      if (result.status === 'run') { mark = '…'; label = '运行中'; cls = 'run'; }
      else if (result.status === 'ok') { mark = '✓'; label = '通过'; cls = 'ok'; }
      else if (result.status === 'wa') { mark = '✕'; label = '输出不一致'; cls = 'bad'; }
      else if (result.status === 'ce') { mark = '!'; label = '编译未通过'; cls = 'bad'; }
      else if (result.status === 're') { mark = '!'; label = '运行错误'; cls = 'bad'; }
      else if (result.status === 'offline') { mark = '!'; label = '离线演示'; cls = 'bad'; }
    }
    return `<div class="test-row ${cls}"><span class="t-mark">${mark}</span>测试点 ${index + 1} · ${label}</div>`;
  }

  async function runCode() {
    if (state.running) return;
    const problem = currentProblem();
    if (!problem) return;
    const ta = $('#codeInput');
    const stdinEl = $('#stdinInput');
    const runBtn = $('#runBtn');
    const list = $('#testList');
    const out = $('#consoleOut');
    if (!ta) return;

    saveDraftNow();
    const code = ta.value;
    const custom = stdinEl ? stdinEl.value : '';
    const tests = custom ? [{ in: custom, out: null }] : problem.tests;

    state.running = true;
    if (runBtn) {
      runBtn.disabled = true;
      runBtn.dataset.label = runBtn.innerHTML;
      runBtn.innerHTML = '运行中…';
    }
    if (list) list.innerHTML = '';
    if (out) out.classList.remove('is-error');
    setConsole(custom ? '正在编译并运行自定义输入…' : ('正在编译，共 ' + tests.length + ' 个测试点…'), '运行中', 'is-busy');

    const results = [];
    let stop = false;

    for (let i = 0; i < tests.length && !stop; i++) {
      results[i] = { status: 'run' };
      if (list) list.innerHTML = tests.map((t, idx) => testRowHTML(idx, results[idx])).join('');

      const res = await compileRemote(code, tests[i].in);

      if (res.offline) {
        results[i] = { status: 'offline' };
        if (list) list.innerHTML = tests.map((t, idx) => testRowHTML(idx, results[idx])).join('');
        setConsole('离线演示模式：无法连接在线编译器。\n\n参考输出（测试点 ' + (i + 1) + '）：\n' + (tests[i].out == null ? '（自定义输入无参考输出）' : tests[i].out), '离线演示', 'is-bad', true);
        showToast('无法连接在线编译器，已切换离线演示');
        stop = true;
        break;
      }

      const data = res.data || {};
      const compilerError = String(data.compiler_error || '').trim();

      if (compilerError) {
        results[i] = { status: 'ce' };
        if (list) list.innerHTML = tests.map((t, idx) => testRowHTML(idx, results[idx])).join('');
        setConsole('编译错误：\n' + compilerError + (data.compiler_output ? '\n\n' + data.compiler_output : ''), '编译错误', 'is-bad', true);
        stop = true;
        break;
      }

      if (String(data.status) !== '0') {
        results[i] = { status: 're' };
        if (list) list.innerHTML = tests.map((t, idx) => testRowHTML(idx, results[idx])).join('');
        setConsole('运行错误（退出码 ' + data.status + '）：\n' + String(data.program_error || ''), '运行错误', 'is-bad', true);
        stop = true;
        break;
      }

      const actual = data.program_output == null ? '' : data.program_output;

      if (custom) {
        results[i] = { status: 'ok' };
        if (list) list.innerHTML = tests.map((t, idx) => testRowHTML(idx, results[idx])).join('');
        if (out) out.textContent = actual || '（程序没有输出）';
        setConsole(out ? out.textContent : '', '运行完成', 'is-ok');
        stop = true;
        break;
      }

      const passed = normalizeOutput(actual) === normalizeOutput(tests[i].out);
      results[i] = { status: passed ? 'ok' : 'wa' };
      if (list) list.innerHTML = tests.map((t, idx) => testRowHTML(idx, results[idx])).join('');

      if (!passed) {
        setConsole('测试点 ' + (i + 1) + ' 未通过。\n\n你的输出：\n' + (actual || '（无输出）') +
          '\n\n期望输出：\n' + tests[i].out, '答案错误', 'is-bad', true);
        stop = true;
        break;
      }
    }

    if (!stop) {
      const allPassed = results.length === tests.length && results.every(r => r.status === 'ok');
      if (allPassed) {
        const last = results.length - 1;
        setConsole('全部通过 · ' + tests.length + ' / ' + tests.length + ' 个测试点\n\n输出：\n' + (tests[last] && tests[last].out != null ? tests[last].out : '（无）'), '通过 AC', 'is-ok');
      }
    }

    state.running = false;
    if (runBtn) {
      runBtn.disabled = false;
      if (runBtn.dataset.label) {
        runBtn.innerHTML = runBtn.dataset.label;
        delete runBtn.dataset.label;
      }
    }
  }

  /* ---------------- 学习档案 ---------------- */

  function greeting() {
    const h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 12) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function nextLesson() {
    for (let i = 0; i < TRACK_ORDER.length; i++) {
      const t = TRACK_MAP[TRACK_ORDER[i]];
      const l = t.lessons.find(x => !isDone(t.id + '-' + x.n));
      if (l) return { track: t, lesson: l };
    }
    return null;
  }

  function renderActivity() {
    const wrap = $('#heatmap');
    if (!wrap) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = isoDay(today);
    const offset = (today.getDay() + 6) % 7;
    const start = new Date(today);
    start.setDate(start.getDate() - offset - 11 * 7);
    const learned = new Set(Object.keys(store.days));
    const weeks = [];
    let activeDays = 0;
    let weekDays = 0;
    for (let w = 0; w < 12; w++) {
      let cells = '';
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const key = isoDay(date);
        const on = learned.has(key);
        const future = date.getTime() > today.getTime();
        if (on) {
          activeDays++;
          if (w === 11) weekDays++;
        }
        cells += '<span class="heat-cell' + (on ? ' is-on' : '') +
          (key === todayKey ? ' is-today' : '') +
          (future ? ' is-future' : '') +
          '" title="' + key + (on ? ' · 已学习' : ' · 未学习') + '"' +
          (future ? ' aria-hidden="true"' : '') + '></span>';
      }
      weeks.push('<div class="heat-week">' + cells + '</div>');
    }
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', '近 12 周学习足迹，共 ' + activeDays + ' 天有学习记录');
    wrap.innerHTML = '<div class="heat-days" aria-hidden="true"><span>一</span><span>三</span><span>五</span></div>' +
      '<div class="heat-weeks">' + weeks.join('') + '</div>';
    const note = $('#heatmapNote');
    if (note) note.textContent = '本周 ' + weekDays + ' 天 · 近 12 周 ' + activeDays + ' 天';
  }

  function renderDashboard() {
    const done = doneCount();
    const pct = Math.round(done / TOTAL * 100);

    const greet = $('#dashGreeting');
    if (greet) greet.textContent = greeting() + '，继续往上走一级。';
    const sub = $('#dashSub');
    if (sub) sub.textContent = '今天是 ' + isoDay() + '。已完成 ' + done + ' / ' + TOTAL + ' 讲，距离下一枚印章更近一步。';

    const strip = $('#accountStrip');
    if (strip) {
      if (isLoggedIn()) {
        strip.className = 'account-strip';
        strip.innerHTML = '<span>当前账号</span><b>' + esc(auth.user.name) + '</b>' +
          '<span>·</span><span>' + ROLE_LABEL[auth.user.role] + (auth.user.className ? ' · ' + esc(auth.user.className) : '') + '</span>' +
          '<em>进度已同步</em>';
      } else {
        strip.className = 'account-strip is-guest';
        strip.innerHTML = '<em>游客模式</em><span>记录只保存在本机 ·</span>' +
          '<a href="#/auth" data-nav="auth">登录 / 注册</a>' +
          '<span>后，老师可以看到你的学习进度。</span>';
      }
    }
    const storageNote = $('#dashStorageNote');
    if (storageNote) {
      storageNote.textContent = isLoggedIn()
        ? '学习记录会同步到账号，老师可以在班级学情中查看。'
        : '学习记录仅保存在当前浏览器 localStorage 中，登录后可同步给老师查看。';
    }

    const nxt = nextLesson();
    const nextWrap = $('#dashNext');
    if (nextWrap) {
      nextWrap.innerHTML = nxt
        ? `<p class="eyebrow">UP NEXT / 继续学习</p>
           <h2>第 ${pad2(nxt.lesson.n)} 讲 · ${esc(nxt.lesson.title)}</h2>
           <p class="m-sub">${esc(nxt.track.name)} · ${esc(nxt.lesson.sub)}</p>
           <button class="btn btn-primary" type="button" data-open-lesson="${nxt.track.id}-${nxt.lesson.n}">打开这一讲 <span class="arrow">→</span></button>`
        : `<p class="eyebrow">ALL CLEAR / 全部完成</p>
           <h2>65 讲已经全部走完。</h2>
           <p class="m-sub">接下来去在线判题台，把模板变成手感。</p>
           <a class="btn btn-primary" href="#/code" data-nav="code">去在线判题台 <span class="arrow">→</span></a>`;
    }

    const ring = $('#dashRing');
    if (ring) {
      ring.style.setProperty('--p', pct + '%');
      ring.innerHTML = '<b>' + pct + '%</b><span>总进度</span>';
    }

    const stats = $('#statGrid');
    if (stats) {
      const unlocked = BADGES.filter(b => b.check(done)).length;
      stats.innerHTML = `
        <div class="stat"><b>${done}<i>讲</i></b><span>已完成</span></div>
        <div class="stat"><b>${pct}<i>%</i></b><span>完成率</span></div>
        <div class="stat"><b>${streakDays()}<i>天</i></b><span>连续学习</span></div>
        <div class="stat"><b>${unlocked}<i>/6</i></b><span>已获印章</span></div>`;
    }

    const list = $('#progressList');
    if (list) {
      list.innerHTML = TRACK_ORDER.map(id => {
        const t = TRACK_MAP[id];
        const d = trackDone(t);
        const p = Math.round(d / t.lessons.length * 100);
        return `
        <div class="pl-row">
          <div class="pl-top"><b>${t.roman} · ${esc(t.name)}</b><span>${d} / ${t.lessons.length} · ${p}%</span></div>
          <div class="pl-bar"><i style="width:${p}%"></i></div>
        </div>`;
      }).join('');
    }

    const badges = $('#badgeWall');
    if (badges) {
      badges.innerHTML = BADGES.map(b => {
        const on = b.check(done);
        return `<div class="badge${on ? ' is-unlocked' : ''}" title="${b.check(done) ? '已获得' : '未解锁'}"><b>${esc(b.name)}</b><span>${esc(b.en)}</span></div>`;
      }).join('');
    }
    const badgeCount = $('#badgeCount');
    if (badgeCount) badgeCount.textContent = BADGES.filter(b => b.check(done)).length + ' / ' + BADGES.length;

    const recent = $('#recentList');
    if (recent) {
      const items = store.recent
        .map(key => {
          const parts = key.split('-');
          const t = TRACK_MAP[parts[0]];
          if (!t) return null;
          const l = t.lessons.find(x => x.n === Number(parts[1]));
          if (!l) return null;
          return { t: t, l: l };
        })
        .filter(Boolean);
      recent.innerHTML = items.length
        ? items.map(item => `
          <div class="recent-row" data-open-lesson="${item.t.id}-${item.l.n}" role="button" tabindex="0">
            <span class="recent-no">${item.t.roman} · ${pad2(item.l.n)}</span>
            <span class="recent-title">${esc(item.l.title)}<small>${esc(item.t.short)}</small></span>
            <span class="recent-open">打开 →</span>
          </div>`).join('')
        : '<p class="recent-empty">还没有打开过讲次。去 <a href="#/courses" data-nav="courses">课程总览</a> 挑一讲开始吧。</p>';
    }

    renderActivity();
  }

  function resetProgress() {
    const message = isLoggedIn()
      ? '确定清空账号的学习记录吗？已标记的讲次、连续学习与印章都会重置，老师也将看不到这些进度。'
      : '确定清空本机学习记录吗？已标记的讲次、连续学习与印章都会重置。';
    if (!window.confirm(message)) return;
    store = { done: {}, days: {}, recent: [] };
    persist();
    renderProgressEverywhere();
    syncProgress();
    showToast('学习记录已清空');
  }

  /* ---------------- 登录 / 注册 ---------------- */

  function setButtonLoading(button, loading, label) {
    if (!button) return;
    if (loading) {
      button.dataset.origin = button.innerHTML;
      button.disabled = true;
      button.textContent = label || '处理中…';
    } else {
      button.disabled = false;
      if (button.dataset.origin) {
        button.innerHTML = button.dataset.origin;
        delete button.dataset.origin;
      } else {
        button.textContent = label || '确定';
      }
    }
  }

  function setAuthMessage(id, text, kind) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('is-ok', kind === 'ok');
  }

  function setAuthMode(mode) {
    state.authMode = mode === 'register' ? 'register' : 'login';
    $$('.auth-tab').forEach(tab => {
      const active = tab.dataset.authMode === state.authMode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    const loginForm = $('#loginForm');
    const registerForm = $('#registerForm');
    if (loginForm) loginForm.hidden = state.authMode !== 'login';
    if (registerForm) registerForm.hidden = state.authMode !== 'register';
  }

  function setRegisterRole(role) {
    state.registerRole = role === 'teacher' ? 'teacher' : 'student';
    $$('.role-card').forEach(card => {
      card.classList.toggle('is-active', card.dataset.role === state.registerRole);
    });
    const classField = $('#classField');
    const inviteField = $('#inviteField');
    if (classField) classField.hidden = state.registerRole === 'teacher';
    if (inviteField) inviteField.hidden = state.registerRole !== 'teacher';
  }

  async function checkAuthService() {
    const el = $('#authServiceStatus');
    if (!el) return;
    if (!serverAvailable()) {
      el.innerHTML = '<i class="status-dot is-offline"></i>本地文件模式 · 请双击 start.bat 启动服务';
      return;
    }
    el.innerHTML = '<i class="status-dot is-checking"></i>正在检查账号服务…';
    try {
      await apiRequest('/api/health');
      el.innerHTML = '<i class="status-dot"></i>账号服务在线 · 数据存于本机';
    } catch (err) {
      el.innerHTML = '<i class="status-dot is-offline"></i>账号服务未连接 · 请双击 start.bat';
    }
  }

  function renderAuthView() {
    setAuthMode(state.authMode);
    setRegisterRole(state.registerRole);
    checkAuthService();
  }

  function mergeProgress(first, second) {
    const done = Object.assign({}, first.done || {}, second.done || {});
    const days = Object.assign({}, first.days || {}, second.days || {});
    const recent = [];
    (first.recent || []).concat(second.recent || []).forEach(key => {
      if (recent.indexOf(key) === -1 && recent.length < 8) recent.push(key);
    });
    return { done: done, days: days, recent: recent };
  }

  async function handleLogin(event) {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');
    const username = ($('#loginUsername').value || '').trim();
    const password = $('#loginPassword').value || '';
    if (!username || !password) {
      setAuthMessage('loginMsg', '请输入用户名和密码');
      return;
    }
    setButtonLoading(button, true, '登录中…');
    try {
      const data = await apiRequest('/api/login', {
        method: 'POST',
        body: { username: username, password: password }
      });
      applyAuth(data);
      $('#loginPassword').value = '';
      setAuthMessage('loginMsg', '');
      showToast('欢迎回来，' + data.user.name);
      navigate(data.user.role === 'teacher' ? 'teacher' : 'me');
    } catch (err) {
      setAuthMessage('loginMsg', err.status
        ? err.message
        : '无法连接账号服务，请双击 start.bat 启动后重试');
    } finally {
      setButtonLoading(button, false, '登录');
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');
    const name = ($('#regName').value || '').trim();
    const username = ($('#regUsername').value || '').trim();
    const password = $('#regPassword').value || '';
    const className = ($('#regClass').value || '').trim();
    const inviteCode = ($('#regInvite').value || '').trim();
    const role = state.registerRole;

    if (!name) return setAuthMessage('registerMsg', '请填写姓名');
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) return setAuthMessage('registerMsg', '用户名需为 3–20 位字母、数字或下划线');
    if (password.length < 6) return setAuthMessage('registerMsg', '密码至少 6 位');
    if (role === 'teacher' && !inviteCode) return setAuthMessage('registerMsg', '教师注册需要邀请码');

    const guestProgress = mergeProgress({}, store);
    const guestHasProgress = role === 'student' && Object.keys(guestProgress.done).length > 0;

    setButtonLoading(button, true, '创建中…');
    try {
      const data = await apiRequest('/api/register', {
        method: 'POST',
        body: {
          name: name,
          username: username,
          password: password,
          role: role,
          className: className,
          inviteCode: inviteCode
        }
      });
      auth.token = data.token;
      auth.user = data.user;
      saveSession();
      renderAuthUI();

      let merged = false;
      if (guestHasProgress) {
        store = mergeProgress(guestProgress, data.progress);
        merged = true;
        persist();
        try {
          await apiRequest('/api/progress', { method: 'PUT', body: store });
        } catch (err) {
          syncProgress();
        }
      } else {
        applyProgress(data.progress);
      }
      refreshHeader();
      renderProgressEverywhere();
      setAuthMessage('registerMsg', '');
      showToast(merged
        ? '账号已创建，本机学习记录已并入'
        : '账号已创建，欢迎，' + data.user.name);
      navigate(data.user.role === 'teacher' ? 'teacher' : 'me');
    } catch (err) {
      setAuthMessage('registerMsg', err.status
        ? err.message
        : '无法连接账号服务，请双击 start.bat 启动后重试');
    } finally {
      setButtonLoading(button, false, '创建账号');
    }
  }

  async function handleLogout() {
    if (!isLoggedIn()) return;
    try {
      await apiRequest('/api/logout', { method: 'POST' });
    } catch (err) { /* 本地退出即可 */ }
    clearAuth('已退出登录');
    navigate('home');
  }

  function toggleUserMenu(force) {
    const menu = $('#userMenu');
    const chip = $('#userChip');
    if (!menu || !chip) return;
    const open = typeof force === 'boolean' ? force : menu.hidden;
    menu.hidden = !open;
    chip.setAttribute('aria-expanded', String(open));
  }

  /* ---------------- 教师 · 班级学情 ---------------- */

  function relTime(iso) {
    if (!iso) return '还没开始';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((today - target) / 86400000);
    if (diff <= 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff < 7) return diff + ' 天前';
    return (date.getMonth() + 1) + '/' + date.getDate();
  }

  function lessonByKey(key) {
    const parts = String(key || '').split('-');
    const track = TRACK_MAP[parts[0]];
    if (!track) return null;
    const lesson = track.lessons.find(item => item.n === Number(parts[1]));
    return lesson ? { track: track, lesson: lesson } : null;
  }

  function teacherBaseStudents() {
    if (state.classFilter === 'all') return state.teacherStudents;
    return state.teacherStudents.filter(student => (student.className || '未分班') === state.classFilter);
  }

  function teacherVisibleStudents() {
    const query = state.studentQuery.trim().toLowerCase();
    const base = teacherBaseStudents();
    if (!query) return base;
    return base.filter(student => {
      return (student.name + ' ' + student.username + ' ' + (student.className || '')).toLowerCase().indexOf(query) !== -1;
    });
  }

  function renderTeacherView() {
    if (!isTeacher()) {
      navigate('home');
      return;
    }
    if (!state.teacherLoaded) {
      const list = $('#studentList');
      if (list) list.innerHTML = '<div class="teacher-loading">正在读取班级数据…</div>';
    }
    renderClassFilters();
    renderTeacherStats();
    renderTeacherRows();
    loadTeacherData();
  }

  async function loadTeacherData(force) {
    if (!isTeacher() || state.teacherLoading) return;
    state.teacherLoading = true;
    const refreshBtn = $('#refreshStudents');
    if (refreshBtn) refreshBtn.disabled = true;
    try {
      const data = await apiRequest('/api/teacher/students');
      state.teacherStudents = Array.isArray(data.students) ? data.students : [];
      state.teacherLoaded = true;
      renderClassFilters();
      renderTeacherStats();
      renderTeacherRows();
    } catch (err) {
      if (err.status === 401) {
        clearAuth('登录状态已失效，请重新登录');
        navigate('auth');
      } else if (!state.teacherLoaded) {
        const list = $('#studentList');
        if (list) {
          list.innerHTML = '<div class="teacher-error">无法读取班级数据。<br>' +
            esc(err.message) +
            '<br><button class="retry" type="button" data-teacher-retry>重新加载</button></div>';
        }
      } else {
        showToast('刷新失败，请稍后再试');
      }
    } finally {
      state.teacherLoading = false;
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  function renderClassFilters() {
    const wrap = $('#classFilters');
    if (!wrap) return;
    const classes = ['all'];
    state.teacherStudents.forEach(student => {
      const name = student.className || '未分班';
      if (classes.indexOf(name) === -1) classes.push(name);
    });
    wrap.innerHTML = classes.map(id => {
      const label = id === 'all' ? '全部班级' : id;
      return '<button class="seg-btn' + (state.classFilter === id ? ' is-active' : '') +
        '" type="button" data-class-filter="' + esc(id) + '">' + esc(label) + '</button>';
    }).join('');
  }

  function renderTeacherStats() {
    const wrap = $('#teacherStats');
    if (!wrap) return;
    if (!state.teacherLoaded) {
      wrap.innerHTML = '';
      return;
    }
    const base = teacherBaseStudents();
    const avgPercent = base.length
      ? Math.round(base.reduce((sum, student) => sum + student.percent, 0) / base.length)
      : 0;
    const todayCount = base.filter(student => relTime(student.lastActive) === '今天').length;
    const avgStreak = base.length
      ? Math.round(base.reduce((sum, student) => sum + student.streak, 0) / base.length)
      : 0;
    wrap.innerHTML = `
      <div class="stat"><b>${base.length}<i>位</i></b><span>学生人数</span></div>
      <div class="stat"><b>${avgPercent}<i>%</i></b><span>平均完成率</span></div>
      <div class="stat"><b>${todayCount}<i>位</i></b><span>今日活跃</span></div>
      <div class="stat"><b>${avgStreak}<i>天</i></b><span>平均连续学习</span></div>`;
  }

  function renderTeacherRows() {
    const list = $('#studentList');
    const count = $('#studentCount');
    if (!list) return;
    if (!state.teacherLoaded) return;
    const rows = teacherVisibleStudents();
    if (count) count.textContent = '共 ' + rows.length + ' 位学生';
    if (!rows.length) {
      list.innerHTML = '<div class="teacher-loading">还没有匹配的学生。<br>学生在本平台注册后，会出现在这里。</div>';
      return;
    }
    list.innerHTML = rows.map(student => {
      const className = student.className || '未分班';
      return `
      <button class="student-row" type="button" data-student-id="${esc(student.id)}">
        <span class="s-avatar">${esc(String(student.name || '学').charAt(0))}</span>
        <span class="s-main">
          <b>${esc(student.name)}</b>
          <span>${esc(student.username)}</span>
          <span class="s-class-inline">${esc(className)}</span>
        </span>
        <span class="s-class">${esc(className)}</span>
        <span class="s-progress">
          <span class="s-bar"><i style="width:${student.percent}%"></i></span>
          <em>${student.doneCount} / ${student.total} · ${student.percent}%</em>
        </span>
        <span class="s-meta"><b>${relTime(student.lastActive)}</b><em>连续 ${student.streak} 天</em></span>
        <span class="s-open">查看 →</span>
      </button>`;
    }).join('');
  }

  async function openStudentModal(id) {
    if (!isTeacher() || !id) return;
    state.studentDetailId = id;
    const modal = $('#studentModal');
    const body = $('#studentModalBody');
    if (!modal || !body) return;
    body.innerHTML = '<div class="sm-loading">正在读取学生数据…</div>';
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    try {
      const data = await apiRequest('/api/teacher/students/' + encodeURIComponent(id));
      renderStudentDetail(data.student);
    } catch (err) {
      if (err.status === 401) {
        closeStudentModal();
        clearAuth('登录状态已失效，请重新登录');
        navigate('auth');
      } else {
        body.innerHTML = '<div class="sm-loading">读取失败：' + esc(err.message) + '</div>';
      }
    }
  }

  function closeStudentModal() {
    const modal = $('#studentModal');
    if (modal) modal.classList.remove('is-open');
    state.studentDetailId = null;
    syncBodyLock();
  }

  function renderStudentDetail(student) {
    const body = $('#studentModalBody');
    if (!body || !student) return;
    const progress = student.progress || { done: {}, days: {}, recent: [] };
    const doneKeys = Object.keys(progress.done || {});
    const doneSet = {};
    doneKeys.forEach(key => { doneSet[key] = true; });
    const className = student.className || '未分班';

    const trackBars = TRACK_ORDER.map(id => {
      const track = TRACK_MAP[id];
      const count = track.lessons.filter(lesson => doneSet[id + '-' + lesson.n]).length;
      const percent = Math.round(count / track.lessons.length * 100);
      return `
        <div class="sm-track">
          <div class="sm-track-top"><b>${track.roman} · ${esc(track.name)}</b><span>${count} / ${track.lessons.length} · ${percent}%</span></div>
          <span class="sm-bar"><i style="width:${percent}%"></i></span>
        </div>`;
    }).join('');

    const lessonMap = TRACK_ORDER.map(id => {
      const track = TRACK_MAP[id];
      const count = track.lessons.filter(lesson => doneSet[id + '-' + lesson.n]).length;
      const cells = track.lessons.map(lesson => {
        const done = !!doneSet[id + '-' + lesson.n];
        return '<span class="lm-cell' + (done ? ' is-done' : '') + '" title="' +
          esc('第 ' + lesson.n + ' 讲 · ' + lesson.title + (done ? ' · 已完成' : ' · 未完成')) + '">' +
          pad2(lesson.n) + '</span>';
      }).join('');
      return `
        <div class="lm-group">
          <h4><span>${track.roman} · ${esc(track.name)}</span><span>${count} / ${track.lessons.length}</span></h4>
          <div class="lm-cells">${cells}</div>
        </div>`;
    }).join('');

    const recentKeys = Array.isArray(progress.recent) ? progress.recent : [];
    const recentRows = recentKeys.map(key => {
      const found = lessonByKey(key);
      if (!found) return '';
      return '<div class="sm-recent-row"><b>' + esc(found.lesson.title) + '</b><span>' +
        found.track.roman + ' · 第 ' + pad2(found.lesson.n) + ' 讲</span></div>';
    }).filter(Boolean).join('');

    body.innerHTML = `
      <div class="sm-head">
        <span class="sm-avatar">${esc(String(student.name || '学').charAt(0))}</span>
        <div>
          <h2 id="studentModalTitle">${esc(student.name)}</h2>
          <p class="sm-sub">${esc(student.username)} · ${esc(className)} · 最近活跃 ${relTime(student.lastActive)}</p>
        </div>
      </div>
      <div class="sm-stats">
        <div class="sm-stat"><b>${student.doneCount}<i>/ ${student.total}</i></b><span>已完成讲次</span></div>
        <div class="sm-stat"><b>${student.percent}<i>%</i></b><span>课程完成率</span></div>
        <div class="sm-stat"><b>${student.streak}<i>天</i></b><span>连续学习</span></div>
        <div class="sm-stat"><b>${relTime(student.lastActive)}</b><span>最近活跃</span></div>
      </div>
      <div class="sm-tracks">${trackBars}</div>
      <div class="lesson-map">${lessonMap}</div>
      <div class="sm-recent">
        <h4>最近打开</h4>
        ${recentRows || '<p class="sm-empty">这位学生还没有打开过讲次。</p>'}
      </div>`;
  }



  const VIEW_TITLES = {
    home: '码阶 CODE LADDER · 中小学 C++ 在线编程课程',
    courses: '课程总览 · 码阶 CODE LADDER',
    code: '在线编程 · 码阶 CODE LADDER',
    me: '学习档案 · 码阶 CODE LADDER',
    auth: '登录 / 注册 · 码阶 CODE LADDER',
    teacher: '班级学情 · 码阶 CODE LADDER'
  };

  function showView(view) {
    if (!VIEW_TITLES[view]) view = 'home';
    if (state.view === 'code' && view !== 'code') saveDraftNow();
    toggleUserMenu(false);
    closeModal();
    closeStudentModal();
    state.view = view;

    $$('.view').forEach(sec => sec.classList.toggle('is-active', sec.dataset.view === view));
    $$('[data-nav]').forEach(link => {
      const active = link.dataset.nav === view;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = VIEW_TITLES[view];

    if (view === 'home') renderHome();
    if (view === 'courses') renderCourses();
    if (view === 'code') renderCodeView();
    if (view === 'me') renderDashboard();
    if (view === 'auth') renderAuthView();
    if (view === 'teacher') renderTeacherView();

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function navigate(view) {
    if (location.hash === '#/' + view) {
      showView(view);
    } else {
      location.hash = '#/' + view;
    }
  }

  function route() {
    const requested = location.hash.replace(/^#\/?/, '');
    let view = VIEW_TITLES[requested] ? requested : 'home';
    if (view === 'auth' && isLoggedIn()) view = isTeacher() ? 'teacher' : 'me';
    if (view === 'me' && isTeacher()) view = 'teacher';
    if (view === 'teacher' && !isTeacher()) {
      view = 'home';
      if (requested === 'teacher') showToast('请使用教师账号登录后查看班级学情');
    }
    if (view !== requested && VIEW_TITLES[requested]) {
      try { history.replaceState(null, '', '#/' + view); } catch (e) { /* ignore */ }
    }
    showView(view);
  }

  /* ---------------- 滚动显现 ---------------- */

  let revealObserver = null;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      $$('[data-reveal]').forEach(el => el.classList.add('in'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    }
    $$('[data-reveal]:not(.in)').forEach(el => revealObserver.observe(el));
  }

  /* ---------------- 首屏数字 ---------------- */

  let counted = false;
  function countUp() {
    if (counted) return;
    counted = true;
    $$('[data-count]').forEach(el => {
      const target = Number(el.dataset.count) || 0;
      const start = performance.now();
      const duration = 1100;
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------------- 事件绑定 ---------------- */

  function bindEvents() {
    window.addEventListener('hashchange', route);

    document.addEventListener('click', function (e) {
      const target = e.target;

      const userChip = target.closest('#userChip');
      if (userChip) {
        toggleUserMenu();
        return;
      }
      if (target.closest('#logoutBtn')) {
        toggleUserMenu(false);
        handleLogout();
        return;
      }
      const menu = $('#userMenu');
      if (menu && !menu.hidden && !target.closest('.header-right')) toggleUserMenu(false);
      if (target.closest('.user-menu a')) toggleUserMenu(false);

      const studentClose = target.closest('[data-close-student]');
      if (studentClose) { closeStudentModal(); return; }

      const authTab = target.closest('[data-auth-mode]');
      if (authTab) { setAuthMode(authTab.dataset.authMode); return; }

      const roleCard = target.closest('.role-card[data-role]');
      if (roleCard) { setRegisterRole(roleCard.dataset.role); return; }

      const classFilter = target.closest('[data-class-filter]');
      if (classFilter) {
        state.classFilter = classFilter.dataset.classFilter;
        renderClassFilters();
        renderTeacherStats();
        renderTeacherRows();
        return;
      }

      const studentRow = target.closest('[data-student-id]');
      if (studentRow) {
        openStudentModal(studentRow.dataset.studentId);
        return;
      }

      const teacherRetry = target.closest('[data-teacher-retry]');
      if (teacherRetry) {
        loadTeacherData(true);
        return;
      }

      const toggle = target.closest('[data-toggle-lesson]');
      if (toggle) {
        e.preventDefault();
        toggleLesson(toggle.dataset.toggleLesson);
        return;
      }

      const close = target.closest('[data-close-modal]');
      if (close) { closeModal(); return; }

      const open = target.closest('[data-open-lesson]');
      if (open) {
        const parts = open.dataset.openLesson.split('-');
        openLesson(parts[0], Number(parts[1]));
        return;
      }

      const problem = target.closest('[data-problem]');
      if (problem) {
        loadProblem(problem.dataset.problem);
        return;
      }

      const problemStep = target.closest('[data-problem-step]');
      if (problemStep) {
        stepProblem(problemStep.dataset.problemStep === 'prev' ? -1 : 1);
        return;
      }

      const openProblemBtn = target.closest('[data-open-problem]');
      if (openProblemBtn) {
        openProblem(openProblemBtn.dataset.openProblem);
        return;
      }

      const goto = target.closest('[data-goto-track]');
      if (goto) {
        const id = goto.dataset.gotoTrack;
        state.courseFilter = (id === 'adv') ? 'adv' : id;
        navigate('courses');
        return;
      }

      const modeBtn = target.closest('[data-sched-mode]');
      if (modeBtn) {
        state.schedMode = modeBtn.dataset.schedMode;
        $$('.mode-tab').forEach(b => {
          const on = b.dataset.schedMode === state.schedMode;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        renderSchedule();
        return;
      }

      const chip = target.closest('[data-sched-track]');
      if (chip) {
        state.schedTrack = chip.dataset.schedTrack;
        renderModeChips();
        renderSchedule();
        return;
      }

      const filter = target.closest('[data-filter]');
      if (filter) {
        state.courseFilter = filter.dataset.filter;
        renderCourses();
        return;
      }

      const modalNav = target.closest('[data-modal-nav]');
      if (modalNav) {
        if (!state.modalKey) return;
        const parts = state.modalKey.split('-');
        const track = TRACK_MAP[parts[0]];
        const idx = track.lessons.findIndex(l => l.n === Number(parts[1]));
        const nextIdx = modalNav.dataset.modalNav === 'prev' ? idx - 1 : idx + 1;
        if (track.lessons[nextIdx]) openLesson(track.id, track.lessons[nextIdx].n);
        return;
      }

      const card = target.closest('.lesson-card');
      if (card) {
        openLesson(card.dataset.track, Number(card.dataset.n));
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        const sheet = $('.modal.is-open .modal-sheet');
        if (sheet) {
          trapFocus(sheet, e);
          return;
        }
      }
      if (e.key === 'Escape') {
        if ($('#studentModal') && $('#studentModal').classList.contains('is-open')) {
          closeStudentModal();
          return;
        }
        if ($('#lessonModal').classList.contains('is-open')) {
          closeModal();
          return;
        }
        toggleUserMenu(false);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const active = document.activeElement;
        if (active && (active.classList.contains('lesson-card') || active.classList.contains('feature-card') || active.classList.contains('week-row') || active.classList.contains('recent-row'))) {
          e.preventDefault();
          active.click();
        }
      }
      if (state.view === 'code' && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    });

    const search = $('#courseSearch');
    if (search) {
      search.addEventListener('input', function () {
        state.query = this.value;
        renderCourses();
      });
    }

    const searchClear = $('#searchClear');
    if (searchClear) {
      searchClear.addEventListener('click', function () {
        const input = $('#courseSearch');
        if (input) {
          input.value = '';
          input.focus();
        }
        state.query = '';
        renderCourses();
      });
    }

    const emptyReset = $('#courseEmptyReset');
    if (emptyReset) {
      emptyReset.addEventListener('click', function () {
        const input = $('#courseSearch');
        if (input) {
          input.value = '';
          input.focus();
        }
        state.query = '';
        state.courseFilter = 'all';
        renderCourses();
      });
    }

    const loginForm = $('#loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registerForm = $('#registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    const studentSearch = $('#studentSearch');
    if (studentSearch) {
      studentSearch.addEventListener('input', function () {
        state.studentQuery = this.value;
        renderTeacherRows();
      });
    }

    const refreshStudents = $('#refreshStudents');
    if (refreshStudents) {
      refreshStudents.addEventListener('click', function () {
        loadTeacherData(true);
      });
    }

    const codeInput = $('#codeInput');
    if (codeInput) {
      let draftTimer = null;
      codeInput.addEventListener('input', function () {
        updateEditor();
        clearTimeout(draftTimer);
        draftTimer = setTimeout(saveDraftNow, 350);
      });
      codeInput.addEventListener('scroll', syncEditorScroll);
      codeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = codeInput.selectionStart;
          const end = codeInput.selectionEnd;
          const value = codeInput.value;
          codeInput.value = value.slice(0, start) + '    ' + value.slice(end);
          codeInput.selectionStart = codeInput.selectionEnd = start + 4;
          updateEditor();
        }
      });
    }

    const runBtn = $('#runBtn');
    if (runBtn) runBtn.addEventListener('click', runCode);

    const copyBtn = $('#copyCode');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!codeInput) return;
        const text = codeInput.value;
        const done = function () {
          copyBtn.textContent = '已复制';
          showToast('代码已复制到剪贴板');
          setTimeout(function () { copyBtn.textContent = '复制代码'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            codeInput.select();
            document.execCommand('copy');
            done();
          });
        } else {
          codeInput.select();
          document.execCommand('copy');
          done();
        }
      });
    }

    const resetBtn = $('#resetCode');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        const p = currentProblem();
        if (!p || !codeInput) return;
        codeInput.value = p.template;
        delete drafts[p.id];
        persistDrafts();
        updateEditor();
        resetConsole('已恢复为模板代码。按 Ctrl + Enter 运行。');
        showToast('已重置为模板代码');
      });
    }

    const resetProgressBtn = $('#resetProgress');
    if (resetProgressBtn) resetProgressBtn.addEventListener('click', resetProgress);

    $('#lessonModal').addEventListener('mousedown', function (e) {
      if (e.target.classList.contains('modal-backdrop')) closeModal();
    });

    const studentModal = $('#studentModal');
    if (studentModal) {
      studentModal.addEventListener('mousedown', function (e) {
        if (e.target.classList.contains('modal-backdrop')) closeStudentModal();
      });
    }

    window.addEventListener('beforeunload', function () {
      if (state.view === 'code') saveDraftNow();
    });
  }

  /* ---------------- 初始化 ---------------- */

  function init() {
    loadSession();
    bindEvents();
    renderAuthUI();
    refreshHeader();
    route();
    countUp();
    observeReveals();
    if (isLoggedIn() && serverAvailable()) restoreSession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
