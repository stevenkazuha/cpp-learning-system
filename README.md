# 码阶 CODE LADDER

中小学 C++ 在线编程课程平台。前端为纯静态页面，账号与进度服务由单文件 Node.js 提供，无需安装任何 npm 依赖。

课程共 4 条线、65 讲：基础编程 15 讲、算法入门 18 讲、算法提升 A 16 讲、算法提升 B 16 讲。内置 14 道在线判题、学习档案、学习足迹热力图、教师班级学情，以及洛谷 / 牛客外站题源入口。

## 功能概览

- 课程阶梯、学期排课与假期集训两种排课视图
- 课程检索、讲次详情、示例代码与课后任务
- 在线判题：C++17，样例与多个测试点逐点比对，支持自定义输入
- 学习档案：完成进度、连续学习、印章、最近学习、12 周学习足迹
- 账号系统：学生 / 教师两种角色，登录后进度同步到服务端
- 教师视图：班级筛选、学生进度、最近活跃、逐讲完成明细
- 外站题源：每道题关联洛谷原题或同类题，牛客按关键词检索，新标签打开
- 移动端适配、键盘操作、弹窗焦点管理

## 目录结构

```text
c++学习系统/
├─ index.html              页面结构与各视图
├─ server.js               静态服务 + 账号/进度 API
├─ start.bat               Windows 一键启动
├─ cleanup-accounts.js     账号清理工具（演练/执行）
├─ assets/
│  ├─ css/style.css        全站视觉样式与响应式
│  └─ js/
│     ├─ data-courses.js   课程、阶梯、精选讲次数据
│     ├─ data-problems.js  判题题库、测试点、外站映射
│     └─ app.js            路由、渲染、判题、账号交互
└─ data/db.json            账号与会话数据
```

## 运行方式

环境要求：安装 Node.js 即可，不需要 `npm install`。

Windows 下双击 `start.bat`，脚本会启动服务并打开浏览器。

也可以手动启动：

```powershell
node server.js
```

然后访问 <http://localhost:3000>。

不要直接用 `file://` 打开 `index.html`，否则账号服务不可用，登录、注册和进度同步都会失败。

可选环境变量：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3000` | 服务端口 |
| `TEACHER_CODE` | `TEACH2026` | 教师注册邀请码 |

PowerShell 示例：

```powershell
$env:PORT = "3000"
$env:TEACHER_CODE = "你的教师邀请码"
node server.js
```

首次启动时账号库为空，没有预置演示账号。请直接在登录页注册学生或教师账号；注册教师需要填写邀请码。邀请码会在服务端启动日志中打印。

## 账号与数据

- 账号、密码哈希、会话和课程进度保存在 `data/db.json`
- 密码使用 `scrypt` 加随机盐哈希，不保存明文
- `server.js` 和 `data/` 目录已禁止静态访问，无法通过浏览器直接下载
- 游客进度与代码草稿保存在浏览器 `localStorage`
- 游客注册学生账号时，本机进度会并入新账号
- 服务端只适合课堂或小规模使用，未实现 HTTPS、限流和生产级数据库

`localStorage` 键名：

| 键 | 用途 |
| --- | --- |
| `codeLadder.progress.v1` | 已完成讲次、学习日期、最近学习 |
| `codeLadder.drafts.v1` | 各题代码草稿 |
| `codeLadder.session.v1` | 登录令牌与用户信息 |

## 课程与题库

课程数据在 `assets/js/data-courses.js`，包含 `TRACKS`、`STAGES`、`FEATURED`。每条课程线包含讲次标题、简介、目标、任务、标签与示例代码。

题库在 `assets/js/data-problems.js`，每道题包含：

- `title`、`difficulty`、`tags`
- `statement`、`input`、`output`、`samples`
- `tests`：本地测试点，每题 4–6 个，覆盖边界与特殊情况
- `template`：带 TODO 的起始代码
- `hint`：提交提示
- `external`：洛谷题号与标题、牛客检索关键词

判题请求发送到 `COMPILER.endpoint`（Judge0 CE，C++17，language id 54）。需要联网；网络不可用时会切换为离线演示并展示参考输出。

外站链接只做跳转，不镜像洛谷或牛客的题目正文和测试数据，第三方内容版权归原平台所有。

## API 一览

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/health` | 公开 | 服务状态与账号数量 |
| `POST` | `/api/register` | 公开 | 注册学生或教师 |
| `POST` | `/api/login` | 公开 | 登录并获取令牌 |
| `GET` | `/api/me` | 登录 | 当前用户与进度 |
| `POST` | `/api/logout` | 登录 | 注销当前会话 |
| `PUT` | `/api/progress` | 登录 | 覆盖保存学习进度 |
| `GET` | `/api/teacher/students` | 教师 | 班级学生列表 |
| `GET` | `/api/teacher/students/:id` | 教师 | 单个学生详情 |

需要登录的接口通过请求头传递令牌：

```http
Authorization: Bearer <token>
```

## 账号清理

`cleanup-accounts.js` 默认只做演练，输出待清理账号和备份，不写库：

```powershell
node cleanup-accounts.js
```

确认后先停止服务，再执行：

```powershell
node cleanup-accounts.js --execute
```

脚本会备份账号数据、生成清单与日志，再清空账号。由于服务不再自动生成演示账号，清理后重新启动会得到空账号库。

## 自定义入口

| 需求 | 修改位置 |
| --- | --- |
| 课程讲次与讲义内容 | `assets/js/data-courses.js` |
| 题目、测试点、模板、外站映射 | `assets/js/data-problems.js` |
| 在线编译器地址与语言 | `assets/js/data-problems.js` 的 `COMPILER` |
| 页面结构与文案 | `index.html` |
| 配色、排版、响应式 | `assets/css/style.css` 的 `:root` 变量与媒体查询 |
| 账号、邀请码、接口逻辑 | `server.js` |

## 已知限制

- 在线判题依赖公开编译服务，结果仅供课堂练习参考，不保证与正式比赛评测一致
- 账号数据为单文件 JSON，不支持高并发与多实例部署
- 外站题源可能随洛谷 / 牛客页面调整而失效，失效时可在 `external` 字段中更新
- 未内置 HTTPS、访问限流、邮箱验证等生产能力

本项目用于教学与课堂演示；洛谷、牛客等第三方平台的题目、题面与测试数据版权归原平台所有。
