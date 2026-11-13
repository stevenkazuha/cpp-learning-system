/* 码阶 CODE LADDER · 课程数据
   依据《中小学编程培训课程框架设计》编排：基础 15 讲 / 算法入门 18 讲 / 两个进阶各 16 讲 */

const CURRICULUM = {
  basic: [
    {
      n: 1,
      title: '计算机底层工作原理 + 输入输出',
      sub: '从 CPU、内存到第一行 cout',
      tags: ['环境搭建', 'cin / cout', '编译流程'],
      points: [
        '理解 CPU、内存、硬盘各自负责什么，程序如何被编译与执行',
        '掌握 cin / cout 读写整数、浮点数与字符',
        '按题目要求完成输入输出格式，不额外打印提示语'
      ],
      code: {
        title: '第一个程序：读入两个整数并输出和',
        body: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;      // 从键盘读入两个整数
    cout << a + b << endl;
    return 0;
}`
      },
      tasks: ['输出姓名、班级与一句学习目标', '读入两个整数，依次输出和、差、积']
    },
    {
      n: 2,
      title: '运算',
      sub: '算术、取模与类型转换',
      tags: ['算术运算', '取模 %', '类型转换'],
      points: [
        '掌握 + - * / % 与优先级，理解整数除法的截断',
        '用取模完成拆位、判断奇偶与循环取余',
        '认识 int、long long、double 的范围与溢出'
      ],
      code: {
        title: '把秒数换算成时、分、秒',
        body: `int n;
cin >> n;
int h = n / 3600;
int m = n % 3600 / 60;
int s = n % 60;
cout << h << " " << m << " " << s << endl;`
      },
      tasks: ['输入三位数，倒序输出（123 → 321）', '读入秒数，输出 h m s']
    },
    {
      n: 3,
      title: 'if else 分支',
      sub: '让程序学会做选择',
      tags: ['条件判断', '逻辑运算', '嵌套分支'],
      points: [
        '用关系运算符构造条件，理解 && || ! 的短路求值',
        '掌握 else if 链，避免条件区间重叠',
        '用嵌套分支处理多条件组合'
      ],
      code: {
        title: '按分数输出等级 A / B / C / D',
        body: `int score;
cin >> score;
if (score >= 90)      cout << "A" << endl;
else if (score >= 75) cout << "B" << endl;
else if (score >= 60) cout << "C" << endl;
else                  cout << "D" << endl;`
      },
      tasks: ['判断闰年（能被 4 整除且不能被 100 整除，或能被 400 整除）', '读入三个数，输出最大值']
    },
    {
      n: 4,
      title: 'switch 分支',
      sub: '等值多分支的整理术',
      tags: ['多分支', 'break', '字符匹配'],
      points: [
        '用 switch 处理等值多分支，理解 case 穿透',
        '掌握 break 与 default 的位置与作用',
        '比较 switch 与 if 的适用场景'
      ],
      code: {
        title: '用 switch 实现四则运算器',
        body: `int a, b; char op;
cin >> a >> op >> b;
switch (op) {
    case '+': cout << a + b << endl; break;
    case '-': cout << a - b << endl; break;
    case '*': cout << a * b << endl; break;
    case '/': cout << (b != 0 ? a / b : 0) << endl; break;
    default:  cout << "error" << endl;
}`
      },
      tasks: ['输入 1–7，输出对应星期几', '用 switch 写一个带菜单的计算器']
    },
    {
      n: 5,
      title: 'for 循环',
      sub: '重复的事情交给计算机',
      tags: ['计数循环', '累加器', '嵌套循环'],
      points: [
        '掌握 for(初始化; 条件; 步进) 的执行顺序',
        '用累加器与计数器解决求和、计数问题',
        '用嵌套循环打印图形与乘法表'
      ],
      code: {
        title: '求 1 + 2 + … + n',
        body: `int n, sum = 0;
cin >> n;
for (int i = 1; i <= n; i++) {
    sum += i;
}
cout << sum << endl;`
      },
      tasks: ['打印 n 行直角三角形', '求 1..n 中所有偶数的和']
    },
    {
      n: 6,
      title: 'while 和 do while 循环',
      sub: '次数未知时，也能一直做下去',
      tags: ['不定次数循环', '拆位', '循环控制'],
      points: [
        '区分 while 与 do-while 的执行时机',
        '用 while 拆解整数的每一位',
        '用 break / continue 控制循环流程'
      ],
      code: {
        title: '逐位拆分，求数位之和',
        body: `int n, sum = 0;
cin >> n;
while (n > 0) {
    sum += n % 10;
    n /= 10;
}
cout << sum << endl;`
      },
      tasks: ['统计一个整数有多少位', '反复读入整数，直到输入 0 为止']
    },
    {
      n: 7,
      title: '一维数组',
      sub: '把一批数据排队放好',
      tags: ['数组定义', '遍历', '最值'],
      points: [
        '掌握数组下标从 0 开始，警惕越界',
        '用一次遍历求最大值、最小值、总和',
        '用数组保存数据，方便二次处理'
      ],
      code: {
        title: '读入 n 个数，输出最大值',
        body: `int n, a[105];
cin >> n;
for (int i = 0; i < n; i++) cin >> a[i];

int mx = a[0];
for (int i = 1; i < n; i++)
    if (a[i] > mx) mx = a[i];
cout << mx << endl;`
      },
      tasks: ['求平均值与最大值', '把数组逆序输出']
    },
    {
      n: 8,
      title: '二维数组',
      sub: '像表格一样组织数据',
      tags: ['矩阵', '双重循环', '转置'],
      points: [
        '理解行优先存储与 a[i][j] 的含义',
        '用双重循环读入、遍历矩阵',
        '完成矩阵转置与边界处理'
      ],
      code: {
        title: '矩阵转置后输出',
        body: `int n, m, a[55][55];
cin >> n >> m;
for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++) cin >> a[i][j];

for (int j = 0; j < m; j++) {
    for (int i = 0; i < n; i++) cout << a[i][j] << " ";
    cout << endl;
}`
      },
      tasks: ['输出矩阵两条对角线之和', '求每一行的最大值']
    },
    {
      n: 9,
      title: '字符数组',
      sub: '字符、ASCII 与 \\0 结尾的字符串',
      tags: ['char 数组', 'ASCII', 'ctype'],
      points: [
        '理解字符与 ASCII 码的对应关系',
        '用字符数组存储字符串，并以 \\0 结尾',
        '用 isalpha / isdigit / toupper 处理字符'
      ],
      code: {
        title: '统计一行文本中的字母个数',
        body: `char s[256];
cin.getline(s, 256);
int cnt = 0;
for (int i = 0; s[i] != '\\0'; i++)
    if (isalpha(s[i])) cnt++;
cout << cnt << endl;`
      },
      tasks: ['分别统计大写、小写、数字与其他字符', '把字符串中的小写字母全部转成大写']
    },
    {
      n: 10,
      title: '字符串',
      sub: 'std::string，更省心的字符串',
      tags: ['std::string', 'getline', '回文'],
      points: [
        '掌握 string 的定义、拼接、比较与长度',
        '用 getline 读入含空格的整行文本',
        '用 reverse 与双指针判断回文'
      ],
      code: {
        title: '判断一个字符串是不是回文',
        body: `string s;
cin >> s;
string t(s.rbegin(), s.rend());
cout << (s == t ? "YES" : "NO") << endl;`
      },
      tasks: ['统计某个字符在字符串中出现的次数', '把句子中的单词顺序倒过来']
    },
    {
      n: 11,
      title: '结构体',
      sub: '把一组相关信息打包',
      tags: ['struct', '结构体数组', '自定义排序'],
      points: [
        '用 struct 把相关字段组织成一个整体',
        '定义结构体数组并批量读入数据',
        '用 sort + 比较函数完成多关键字排序'
      ],
      code: {
        title: '按成绩从高到低输出名单',
        body: `struct Student {
    string name;
    int score;
};
int n; cin >> n;
vector<Student> v(n);
for (auto &x : v) cin >> x.name >> x.score;

sort(v.begin(), v.end(), [](Student a, Student b) {
    if (a.score != b.score) return a.score > b.score;
    return a.name < b.name;
});
for (auto &x : v) cout << x.name << " " << x.score << endl;`
      },
      tasks: ['按总分从高到低输出学生名单', '给结构体增加平均分字段并重新排序']
    },
    {
      n: 12,
      title: '函数',
      sub: '把代码拆成可复用的零件',
      tags: ['参数与返回值', '作用域', '模块化'],
      points: [
        '把重复逻辑封装成函数，理解形参与实参',
        '区分值传递与引用传递 &',
        '用函数拆分复杂程序，让主函数更清晰'
      ],
      code: {
        title: '写一个判断素数的函数',
        body: `bool isPrime(int x) {
    if (x < 2) return false;
    for (int i = 2; i * i <= x; i++)
        if (x % i == 0) return false;
    return true;
}

int main() {
    int n; cin >> n;
    cout << (isPrime(n) ? "YES" : "NO") << endl;
}`
      },
      tasks: ['写函数求最大公约数', '写函数判断完全数']
    },
    {
      n: 13,
      title: '递归函数',
      sub: '自己调用自己的艺术',
      tags: ['递归三要素', '调用栈', '记忆化'],
      points: [
        '理解边界条件 + 递归式 + 规模缩小三要素',
        '跟踪递归调用栈，避免死递归',
        '用记忆化避免重复计算'
      ],
      code: {
        title: '递归求 n 的阶乘',
        body: `long long fact(int n) {
    if (n <= 1) return 1;        // 边界条件
    return n * fact(n - 1);      // 递归式
}

int main() {
    int n; cin >> n;
    cout << fact(n) << endl;
}`
      },
      tasks: ['递归求斐波那契第 n 项', '递归求最大公约数']
    },
    {
      n: 14,
      title: '综合训练',
      sub: '把学过的零件装成一台机器',
      tags: ['综合应用', '输入输出规范', '调试'],
      points: [
        '把分支、循环、数组、函数组合成完整程序',
        '严格按照题目格式要求读入与输出',
        '用样例与边界数据自查程序'
      ],
      code: {
        title: '班级成绩统计：平均分与最高分',
        body: `int n; cin >> n;
double sum = 0;
int mx = 0;
for (int i = 0; i < n; i++) {
    int x; cin >> x;
    sum += x;
    mx = max(mx, x);
}
cout << fixed << setprecision(1) << sum / n << " " << mx << endl;`
      },
      tasks: ['统计班级最高分、平均分与及格率', '简易通讯录：增加、查找、列出']
    },
    {
      n: 15,
      title: '结课测试',
      sub: '限时测评 + 逐题讲评',
      tags: ['结课测评', '模拟题', '讲评'],
      points: [
        '限时完成 4 道基础题，覆盖输入输出、分支、循环、数组',
        '根据评测反馈定位错误类型：格式、边界、逻辑',
        '根据讲评制定下一阶段学习计划'
      ],
      code: {
        title: '模拟题：统计 1..n 中质数的个数',
        body: `int n, cnt = 0;
cin >> n;
for (int x = 2; x <= n; x++) {
    bool ok = true;
    for (int i = 2; i * i <= x; i++)
        if (x % i == 0) { ok = false; break; }
    if (ok) cnt++;
}
cout << cnt << endl;`
      },
      tasks: ['完成 60 分钟结课模拟卷', '整理错题，并在本机重新调试通过']
    }
  ],

  algo: [
    {
      n: 1,
      title: '排序 1：冒泡和快排',
      sub: '从交换到分治，效率第一次飞跃',
      tags: ['冒泡排序', '快速排序', '时间复杂度'],
      points: [
        '理解冒泡排序的两层循环与交换条件',
        '用 partition 实现快速排序',
        '比较 O(n²) 与 O(n log n) 的真实差距'
      ],
      code: {
        title: '冒泡排序核心代码',
        body: `for (int i = 0; i < n - 1; i++)
    for (int j = 0; j < n - 1 - i; j++)
        if (a[j] > a[j + 1])
            swap(a[j], a[j + 1]);`
      },
      tasks: ['把冒泡改成从大到小', '用快排对 10^5 个随机数排序并计时']
    },
    {
      n: 2,
      title: '排序 2：桶排序 + 归并排序',
      sub: '值域计数与分治合并',
      tags: ['桶排序', '归并排序', '分治'],
      points: [
        '用桶排序处理值域较小的数据',
        '理解归并排序的分治与合并过程',
        '用稳定排序保留相同元素的相对顺序'
      ],
      code: {
        title: '归并排序的合并步骤',
        body: `void merge(int l, int mid, int r) {
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else              tmp[k++] = a[j++];
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r)   tmp[k++] = a[j++];
    for (int p = l; p <= r; p++) a[p] = tmp[p];
}`
      },
      tasks: ['用桶排序统计每个分数的人数', '用归并排序求逆序对数量']
    },
    {
      n: 3,
      title: '二分算法',
      sub: '每次砍掉一半的搜索空间',
      tags: ['二分查找', '二分答案', '边界处理'],
      points: [
        '在有序数组中用二分把查找降到 O(log n)',
        '掌握 left / right 边界更新的两种写法',
        '用二分答案解决“最小值最大”一类问题'
      ],
      code: {
        title: '第一个大于等于 x 的位置',
        body: `int lowerBound(const vector<int>& a, int x) {
    int l = 0, r = a.size();
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (a[mid] < x) l = mid + 1;
        else            r = mid;
    }
    return l;
}`
      },
      tasks: ['实现 upper_bound', '二分猜数字：1–1000 内最少几次猜中']
    },
    {
      n: 4,
      title: '前缀和',
      sub: '一次预处理，区间求和 O(1)',
      tags: ['一维前缀和', '二维前缀和', '区间查询'],
      points: [
        '用 s[i] = s[i-1] + a[i] 完成预处理',
        'O(1) 回答任意区间和',
        '把前缀和扩展到二维矩形求和'
      ],
      code: {
        title: '区间 [l, r] 的和',
        body: `vector<long long> s(n + 1, 0);
for (int i = 1; i <= n; i++)
    s[i] = s[i - 1] + a[i];

// 查询区间 [l, r]，下标从 1 开始
cout << s[r] - s[l - 1] << endl;`
      },
      tasks: ['多次查询区间和', '求矩阵中任意子矩形的元素和']
    },
    {
      n: 5,
      title: '差分',
      sub: '区间修改的懒人写法',
      tags: ['差分数组', '区间修改', '前缀和还原'],
      points: [
        '用 d[l] += x, d[r+1] -= x 表示一次区间加',
        '用前缀和还原每个位置的真实值',
        '用差分解决多次区间修改问题'
      ],
      code: {
        title: '区间加 x，最后输出整个数组',
        body: `vector<int> d(n + 2, 0);
d[l] += x;
d[r + 1] -= x;

for (int i = 1; i <= n; i++) {
    d[i] += d[i - 1];
    cout << d[i] << " ";
}`
      },
      tasks: ['统计被覆盖次数最多的位置', '多次区间加后输出最终数组']
    },
    {
      n: 6,
      title: '简单数学',
      sub: 'gcd、素数筛与快速幂',
      tags: ['最大公约数', '埃氏筛', '快速幂'],
      points: [
        '用辗转相除法求最大公约数',
        '用埃氏筛预处理素数表',
        '用快速幂计算 a^b mod m'
      ],
      code: {
        title: 'gcd 与埃氏筛',
        body: `int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}

vector<bool> isPrime(n + 1, true);
for (int i = 2; i * i <= n; i++)
    if (isPrime[i])
        for (int j = i * i; j <= n; j += i)
            isPrime[j] = false;`
      },
      tasks: ['求 lcm 并防止中间结果溢出', '输出 1..n 中的所有素数']
    },
    {
      n: 7,
      title: '枚举约简',
      sub: '先会暴力，再学会少算一点',
      tags: ['枚举', '因数', '剪枝'],
      points: [
        '先写出暴力枚举，再找范围中的冗余',
        '利用 i * i <= n 把约数枚举降到 O(√n)',
        '用必要条件提前剪枝'
      ],
      code: {
        title: 'O(√n) 枚举 n 的约数',
        body: `for (int i = 1; i * i <= n; i++) {
    if (n % i == 0) {
        cout << i << " ";
        if (i != n / i) cout << n / i << " ";
    }
}`
      },
      tasks: ['求 n 的约数个数', '判断完全数（所有真因子之和等于自身）']
    },
    {
      n: 8,
      title: '位运算',
      sub: '直接和二进制打交道',
      tags: ['与或异或', '移位', 'lowbit'],
      points: [
        '掌握 & | ^ ~ << >> 的含义',
        '用 x & 1 判奇偶，用异或找出唯一出现一次的数',
        '用 lowbit 与内置函数处理二进制'
      ],
      code: {
        title: 'lowbit 与统计 1 的个数',
        body: `int lowbit(int x) {
    return x & -x;         // 取出最低位的 1
}

int x; cin >> x;
cout << __builtin_popcount(x) << endl;  // 二进制中 1 的个数`
      },
      tasks: ['统计二进制中 1 的个数', '找出数组中唯一出现一次的数']
    },
    {
      n: 9,
      title: '枚举排列',
      sub: '把 n 个元素的所有顺序走一遍',
      tags: ['next_permutation', 'DFS 排列', '去重'],
      points: [
        '用 next_permutation 枚举全排列',
        '手写 DFS 生成排列并处理重复元素',
        '理解 n! 的增长速度与适用范围'
      ],
      code: {
        title: '输出 1..n 的全部排列',
        body: `sort(a.begin(), a.end());
do {
    for (int x : a) cout << x << " ";
    cout << endl;
} while (next_permutation(a.begin(), a.end()));`
      },
      tasks: ['输出 1..n 的全部排列', '输出 n 个数中选 k 个的排列']
    },
    {
      n: 10,
      title: '枚举子集',
      sub: '用一个整数表示一种选择',
      tags: ['二进制枚举', '子集', '状态'],
      points: [
        '用一个整数的二进制表示一个子集',
        '枚举 0..2^n - 1 并检查每一位',
        '用子集枚举解决“选与不选”的问题'
      ],
      code: {
        title: '二进制枚举全部子集',
        body: `for (int s = 0; s < (1 << n); s++) {
    cout << "{ ";
    for (int i = 0; i < n; i++)
        if (s >> i & 1) cout << a[i] << " ";
    cout << "}" << endl;
}`
      },
      tasks: ['输出集合的全部子集', '求所有子集的元素之和']
    },
    {
      n: 11,
      title: '贪心',
      sub: '每一步都选眼前最好的',
      tags: ['局部最优', '区间调度', '反例'],
      points: [
        '理解贪心成立的条件：局部最优推出全局最优',
        '用“结束时间最早”策略解决区间调度',
        '学会举反例验证贪心是否成立'
      ],
      code: {
        title: '区间调度：最多能参加几个活动',
        body: `sort(v.begin(), v.end(), [](auto a, auto b) {
    return a.second < b.second;
});

int cnt = 0, last = -1;
for (auto p : v) {
    if (p.first >= last) {
        cnt++;
        last = p.second;
    }
}
cout << cnt << endl;`
      },
      tasks: ['用最少硬币凑出金额，并构造反例', '合并重叠区间并输出结果']
    },
    {
      n: 12,
      title: '队列和栈',
      sub: '后进先出与先进先出',
      tags: ['stack', 'queue', '括号匹配'],
      points: [
        '掌握 push / pop / top / front 基本操作',
        '用栈解决括号匹配与表达式求值',
        '用队列实现 BFS 与滑动窗口'
      ],
      code: {
        title: '括号匹配',
        body: `stack<char> st;
bool ok = true;
for (char c : s) {
    if (c == '(') st.push(c);
    else if (c == ')') {
        if (st.empty()) { ok = false; break; }
        st.pop();
    }
}
if (!st.empty()) ok = false;`
      },
      tasks: ['判断括号序列是否合法', '用两个栈实现一个队列']
    },
    {
      n: 13,
      title: 'DFS',
      sub: '一条路走到黑，再回头',
      tags: ['深度优先', '回溯', '连通块'],
      points: [
        '用递归实现 DFS，明确访问标记',
        '用方向数组遍历四连通网格',
        '用回溯恢复现场，搜索所有方案'
      ],
      code: {
        title: '网格连通块统计',
        body: `void dfs(int x, int y) {
    vis[x][y] = 1;
    for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (nx < 0 || ny < 0 || nx >= n || ny >= m) continue;
        if (!vis[nx][ny] && g[nx][ny] == '.') dfs(nx, ny);
    }
}`
      },
      tasks: ['统计网格中岛屿的数量', '输出迷宫的全部可行路径']
    },
    {
      n: 14,
      title: 'BFS',
      sub: '一层一层扩展，第一次到达即最短',
      tags: ['广度优先', '最短路', '队列'],
      points: [
        '用队列按层扩展，第一次到达即最短',
        '在网格中求起点到终点的最少步数',
        '比较 DFS 与 BFS 的适用场景'
      ],
      code: {
        title: '网格最短路',
        body: `queue<pair<int,int>> q;
q.push({sx, sy});
dist[sx][sy] = 0;

while (!q.empty()) {
    auto [x, y] = q.front(); q.pop();
    for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (in(nx, ny) && dist[nx][ny] == -1) {
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
}`
      },
      tasks: ['求迷宫最少步数', '多源 BFS：求每个格子到最近出口的距离']
    },
    {
      n: 15,
      title: '动态规划入门：背包问题',
      sub: '把大问题拆成小状态',
      tags: ['01 背包', '状态定义', '转移方程'],
      points: [
        '用 dp[i][j] 表示前 i 件物品、容量 j 的最优值',
        '理解倒序枚举容量，避免一件物品被重复选',
        '把二维 DP 压缩成一维'
      ],
      code: {
        title: '01 背包的一维写法',
        body: `for (int i = 1; i <= n; i++)
    for (int j = W; j >= w[i]; j--)
        dp[j] = max(dp[j], dp[j - w[i]] + v[i]);

cout << dp[W] << endl;`
      },
      tasks: ['实现完全背包', '输出最优方案选择了哪些物品']
    },
    {
      n: 16,
      title: '线性动态规划',
      sub: '在序列上做决策',
      tags: ['LIS', '数字三角形', '状态转移'],
      points: [
        '用 dp[i] 表示以 i 结尾的最优解',
        '在数字三角形中自底向上转移',
        '用前缀最大值优化转移'
      ],
      code: {
        title: '最长上升子序列 O(n²)',
        body: `for (int i = 1; i <= n; i++) {
    dp[i] = 1;
    for (int j = 1; j < i; j++)
        if (a[j] < a[i])
            dp[i] = max(dp[i], dp[j] + 1);
}
cout << *max_element(dp + 1, dp + n + 1) << endl;`
      },
      tasks: ['求最长下降子序列', '求最大子段和']
    },
    {
      n: 17,
      title: '数论入门',
      sub: '质因数、同余与模运算',
      tags: ['质因数分解', '同余', '模运算'],
      points: [
        '用试除法完成质因数分解',
        '理解同余与 (a * b) % m 的性质',
        '用唯一分解定理解决约数问题'
      ],
      code: {
        title: '分解质因数',
        body: `int n; cin >> n;
for (int i = 2; i * i <= n; i++) {
    while (n % i == 0) {
        cout << i << " ";
        n /= i;
    }
}
if (n > 1) cout << n;
cout << endl;`
      },
      tasks: ['求 n 的正约数个数', '求 1..n 中与 m 互质的数的个数']
    },
    {
      n: 18,
      title: '结课测试',
      sub: '算法综合测评与讲评',
      tags: ['结课测评', '算法综合', '讲评'],
      points: [
        '限时完成 4 道算法题：排序、二分、DFS、DP',
        '根据数据范围选择算法与复杂度',
        '按讲评整理模板与易错点'
      ],
      code: {
        title: '综合题：排序后求区间和',
        body: `sort(a + 1, a + n + 1);
for (int i = 1; i <= n; i++)
    s[i] = s[i - 1] + a[i];

int l, r; cin >> l >> r;
cout << s[r] - s[l - 1] << endl;`
      },
      tasks: ['完成 90 分钟算法模拟卷', '整理个人模板库：排序、二分、DFS、DP']
    }
  ],

  adva: [
    {
      n: 1,
      title: '复杂度分析与常数优化',
      sub: '先算清楚，再动手写',
      tags: ['时间复杂度', '空间复杂度', '常数优化'],
      points: [
        '数清循环次数，写出 O(n)、O(n log n)、O(n²)',
        '根据 n 的范围反推可接受的复杂度',
        '用关闭同步流等常数优化提速'
      ],
      code: {
        title: '输入输出加速',
        body: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // 之后再用 cin / cout，速度接近 scanf / printf
}`
      },
      tasks: ['估算 1e5 次排序与 1e9 次循环的耗时', '给三段代码标注复杂度']
    },
    {
      n: 2,
      title: 'STL 容器进阶',
      sub: 'vector / map / set / 优先队列',
      tags: ['STL', 'priority_queue', '迭代器'],
      points: [
        '掌握 vector、map、set 的常用接口与复杂度',
        '用 priority_queue 维护动态最值',
        '用 pair 与迭代器简化代码'
      ],
      code: {
        title: '小根堆',
        body: `priority_queue<int, vector<int>, greater<int>> pq;
pq.push(5);
pq.push(2);
cout << pq.top() << endl;   // 2
pq.pop();`
      },
      tasks: ['用 map 统计单词出现次数', '用优先队列合并 k 个有序数组']
    },
    {
      n: 3,
      title: '并查集',
      sub: '判断“是不是一伙的”',
      tags: ['并查集', '路径压缩', '连通性'],
      points: [
        '用 fa[x] 表示父节点，根节点代表集合',
        '路径压缩把查询均摊降到近似 O(1)',
        '按秩合并避免树退化成链'
      ],
      code: {
        title: '并查集模板',
        body: `int fa[N];
int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}
void merge(int a, int b) {
    fa[find(a)] = find(b);
}`
      },
      tasks: ['统计朋友圈的个数', '用并查集判断无向图是否有环']
    },
    {
      n: 4,
      title: '树状数组',
      sub: '单点修改 + 前缀查询',
      tags: ['树状数组', 'lowbit', '前缀和'],
      points: [
        '用 lowbit 划分区间，树状数组维护前缀信息',
        '单点修改与前缀查询都是 O(log n)',
        '用差分树状数组支持区间修改'
      ],
      code: {
        title: '树状数组模板',
        body: `int t[N];
void add(int i, int v) {
    for (; i <= n; i += i & -i) t[i] += v;
}
int sum(int i) {
    int s = 0;
    for (; i > 0; i -= i & -i) s += t[i];
    return s;
}`
      },
      tasks: ['用树状数组求逆序对', '实现单点修改与区间查询']
    },
    {
      n: 5,
      title: '线段树入门',
      sub: '区间操作的通用结构',
      tags: ['线段树', '分治', '懒标记'],
      points: [
        '用完全二叉树维护区间信息',
        '掌握 build / update / query 三个基本操作',
        '理解懒标记的意义，为区间修改做准备'
      ],
      code: {
        title: '建树与区间求和',
        body: `void build(int p, int l, int r) {
    if (l == r) { tree[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}`
      },
      tasks: ['实现单点修改 + 区间查询', '给线段树加上懒标记']
    },
    {
      n: 6,
      title: '单调栈与单调队列',
      sub: '把无用的元素及时弹掉',
      tags: ['单调栈', '单调队列', '滑动窗口'],
      points: [
        '用单调栈求每个数左边第一个更大的数',
        '用单调队列维护滑动窗口最值',
        '理解均摊 O(n) 的成因'
      ],
      code: {
        title: '下一个更大元素',
        body: `stack<int> st;
for (int i = 1; i <= n; i++) {
    while (!st.empty() && a[st.top()] <= a[i]) st.pop();
    ans[i] = st.empty() ? 0 : st.top();
    st.push(i);
}`
      },
      tasks: ['求滑动窗口最大值', '接雨水：用单调栈计算积水量']
    },
    {
      n: 7,
      title: '哈希与字符串哈希',
      sub: '用整数指纹表示一整段字符串',
      tags: ['哈希', '字符串哈希', '冲突'],
      points: [
        '用进制哈希把字符串映射成整数',
        '通过前缀哈希 O(1) 判断子串是否相等',
        '了解哈希冲突与双哈希策略'
      ],
      code: {
        title: '字符串前缀哈希',
        body: `const unsigned long long B = 131;
h[0] = 0;
for (int i = 1; i <= n; i++)
    h[i] = h[i - 1] * B + s[i];

// 子串 [l, r] 的哈希
unsigned long long get(int l, int r) {
    return h[r] - h[l - 1] * p[r - l + 1];
}`
      },
      tasks: ['判断两个子串是否相同', '用哈希统计不同子串的个数']
    },
    {
      n: 8,
      title: 'KMP 字符串匹配',
      sub: '让失配不再从头开始',
      tags: ['KMP', 'next 数组', '字符串匹配'],
      points: [
        '理解 next 数组：最长相同前后缀',
        '在失配时跳转而不是回溯文本指针',
        '用 KMP 解决循环节与重复子串问题'
      ],
      code: {
        title: '求 next 数组',
        body: `vector<int> getNext(const string& p) {
    vector<int> nxt(p.size(), 0);
    for (int i = 1, j = 0; i < (int)p.size(); i++) {
        while (j && p[i] != p[j]) j = nxt[j - 1];
        if (p[i] == p[j]) j++;
        nxt[i] = j;
    }
    return nxt;
}`
      },
      tasks: ['输出模式串在主串中所有出现位置', '求字符串的最小循环节']
    },
    {
      n: 9,
      title: 'Trie 字典树',
      sub: '共享前缀的高效存储',
      tags: ['字典树', '前缀查询', '字符串'],
      points: [
        '用树形结构共享字符串公共前缀',
        '用 cnt 数组记录单词结尾与前缀数量',
        '在 Trie 上完成插入、查询与删除'
      ],
      code: {
        title: '字典树插入',
        body: `int trie[N][26], cnt[N], tot;
void insert(const string& s) {
    int p = 0;
    for (char c : s) {
        int u = c - 'a';
        if (!trie[p][u]) trie[p][u] = ++tot;
        p = trie[p][u];
    }
    cnt[p]++;
}`
      },
      tasks: ['查询某个前缀出现了多少次', '实现 01-Trie 求最大异或对']
    },
    {
      n: 10,
      title: '图论基础与存图',
      sub: '点、边与邻接表',
      tags: ['图的表示', '邻接表', '度'],
      points: [
        '区分有向图、无向图与带权图',
        '用邻接表存储稀疏图',
        '统计度数并判断握手定理'
      ],
      code: {
        title: '邻接表存图',
        body: `vector<int> g[N];
int n, m; cin >> n >> m;
for (int i = 1; i <= m; i++) {
    int u, v; cin >> u >> v;
    g[u].push_back(v);
    g[v].push_back(u);   // 无向图
}`
      },
      tasks: ['输出每个点的度数', '用邻接矩阵存稠密图并比较差异']
    },
    {
      n: 11,
      title: '拓扑排序',
      sub: '给有依赖的任务排队',
      tags: ['拓扑排序', '入度', 'DAG'],
      points: [
        '统计入度，用队列不断取出入度为 0 的点',
        '判断有向图是否存在环',
        '用拓扑序完成依赖关系排序'
      ],
      code: {
        title: 'Kahn 算法',
        body: `queue<int> q;
for (int i = 1; i <= n; i++)
    if (indeg[i] == 0) q.push(i);

while (!q.empty()) {
    int u = q.front(); q.pop();
    cout << u << " ";
    for (int v : g[u])
        if (--indeg[v] == 0) q.push(v);
}`
      },
      tasks: ['判断课程安排是否可行', '输出字典序最小的拓扑序']
    },
    {
      n: 12,
      title: '最短路：Dijkstra',
      sub: '优先队列优化的单源最短路',
      tags: ['Dijkstra', '优先队列', '非负边权'],
      points: [
        '用 dist 数组维护当前最短距离',
        '用优先队列每次取出最小未确定的点',
        '理解为什么不能处理负权边'
      ],
      code: {
        title: '堆优化 Dijkstra',
        body: `priority_queue<pair<int,int>,
    vector<pair<int,int>>, greater<>> pq;
dist[s] = 0;
pq.push({0, s});

while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;
    for (auto [v, w] : g[u])
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
}`
      },
      tasks: ['求单源最短路并输出路径', '比较 n 较小时的朴素 Dijkstra']
    },
    {
      n: 13,
      title: '最短路：Floyd 与 SPFA',
      sub: '多源最短路与负权边',
      tags: ['Floyd', 'SPFA', '负环'],
      points: [
        '用三重循环求任意两点最短路',
        '理解 Floyd 的区间 DP 本质',
        '用 SPFA 处理负权边并判断负环'
      ],
      code: {
        title: 'Floyd 核心三重循环',
        body: `for (int k = 1; k <= n; k++)
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            if (dis[i][k] + dis[k][j] < dis[i][j])
                dis[i][j] = dis[i][k] + dis[k][j];`
      },
      tasks: ['求任意两点间最短路', '判断图中是否存在负环']
    },
    {
      n: 14,
      title: '最小生成树',
      sub: '用最小的代价连通所有点',
      tags: ['Kruskal', '并查集', 'MST'],
      points: [
        '按边权排序，用并查集避免成环',
        '理解 Kruskal 的贪心正确性',
        '比较 Prim 与 Kruskal 的适用场景'
      ],
      code: {
        title: 'Kruskal',
        body: `sort(e.begin(), e.end(), [](Edge a, Edge b) {
    return a.w < b.w;
});
for (auto &edge : e) {
    if (find(edge.u) != find(edge.v)) {
        merge(edge.u, edge.v);
        ans += edge.w;
    }
}`
      },
      tasks: ['求最小生成树的总边权', '判断图是否连通']
    },
    {
      n: 15,
      title: '树的基础与直径',
      sub: '没有环的连通图',
      tags: ['树的遍历', '树的直径', 'DFS'],
      points: [
        '用 DFS 遍历树并记录父节点',
        '两次 DFS 求树的直径',
        '理解树的重心与子树大小'
      ],
      code: {
        title: '两次 DFS 求直径',
        body: `void dfs(int u, int fa, int d) {
    if (d > best) { best = d; far = u; }
    for (int v : g[u])
        if (v != fa) dfs(v, u, d + 1);
}
// 从 1 出发找到最远点 A，再从 A 出发得到直径`
      },
      tasks: ['求树的直径', '求每个点的子树大小']
    },
    {
      n: 16,
      title: '综合测评与讲评',
      sub: '数据结构与图论综合',
      tags: ['综合测评', '模拟赛', '讲评'],
      points: [
        '限时完成 4 道综合题：并查集、树状数组、最短路、树',
        '按数据范围选择合适的数据结构',
        '整理模板，形成自己的代码库'
      ],
      code: {
        title: '快速读入模板',
        body: `inline int read() {
    int x = 0, f = 1; char c = getchar();
    while (!isdigit(c)) { if (c == '-') f = -1; c = getchar(); }
    while (isdigit(c)) { x = x * 10 + c - '0'; c = getchar(); }
    return x * f;
}`
      },
      tasks: ['完成 120 分钟模拟赛', '复盘每道题的数据范围与复杂度选择']
    }
  ],

  advb: [
    {
      n: 1,
      title: '递推与记忆化搜索',
      sub: '把算过的答案记下来',
      tags: ['记忆化', '递推', '搜索'],
      points: [
        '用 memo 数组保存已计算的状态',
        '把递归搜索改写成递推',
        '分析状态数与转移代价'
      ],
      code: {
        title: '记忆化求斐波那契',
        body: `long long memo[N];
long long f(int n) {
    if (n <= 2) return 1;
    if (memo[n]) return memo[n];
    return memo[n] = f(n - 1) + f(n - 2);
}`
      },
      tasks: ['用记忆化写数字三角形', '把记忆化搜索改写成递推']
    },
    {
      n: 2,
      title: '背包问题进阶',
      sub: '完全、多重与分组背包',
      tags: ['完全背包', '多重背包', '分组背包'],
      points: [
        '完全背包正序枚举容量',
        '用二进制拆分优化多重背包',
        '分组背包每组最多选一件'
      ],
      code: {
        title: '完全背包',
        body: `for (int i = 1; i <= n; i++)
    for (int j = w[i]; j <= W; j++)
        dp[j] = max(dp[j], dp[j - w[i]] + v[i]);`
      },
      tasks: ['实现多重背包的二进制拆分', '实现分组背包']
    },
    {
      n: 3,
      title: '区间动态规划',
      sub: '在区间上合并答案',
      tags: ['区间 DP', '合并石子', '断点枚举'],
      points: [
        '定义 dp[i][j] 表示区间 [i, j] 的最优解',
        '按区间长度从小到大枚举',
        '枚举断点完成转移'
      ],
      code: {
        title: '石子合并',
        body: `for (int len = 2; len <= n; len++)
    for (int i = 1; i + len - 1 <= n; i++) {
        int j = i + len - 1;
        dp[i][j] = INF;
        for (int k = i; k < j; k++)
            dp[i][j] = min(dp[i][j],
                dp[i][k] + dp[k + 1][j] + sum[j] - sum[i - 1]);
    }`
      },
      tasks: ['实现环形石子合并', '括号匹配计数']
    },
    {
      n: 4,
      title: '树形动态规划',
      sub: '在树上做决策',
      tags: ['树形 DP', '子树', '选与不选'],
      points: [
        '在 DFS 回溯时合并子树答案',
        '用 dp[u][0/1] 表示不选 / 选当前点',
        '注意父子节点的约束关系'
      ],
      code: {
        title: '没有上司的舞会',
        body: `void dfs(int u, int fa) {
    dp[u][1] = happy[u];
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        dp[u][1] += dp[v][0];
        dp[u][0] += max(dp[v][0], dp[v][1]);
    }
}`
      },
      tasks: ['求树的最大独立集', '求树上任意两点间距离之和']
    },
    {
      n: 5,
      title: '状态压缩动态规划',
      sub: '用一个整数表示一整排状态',
      tags: ['状压 DP', '二进制状态', '子集'],
      points: [
        '把集合状态压缩为二进制整数',
        '预处理合法状态减少枚举量',
        '在状态之间做转移'
      ],
      code: {
        title: '状压 DP 的枚举框架',
        body: `for (int s = 0; s < (1 << n); s++)
    for (int i = 0; i < n; i++) {
        if (!(s >> i & 1)) continue;
        int t = s ^ (1 << i);
        dp[s] = max(dp[s], dp[t] + val[i]);
    }`
      },
      tasks: ['实现旅行商问题（n ≤ 10）', '统计合法棋盘摆放方案数']
    },
    {
      n: 6,
      title: '动态规划优化入门',
      sub: '滚动数组、前缀和与单调队列',
      tags: ['滚动数组', '前缀和优化', '单调队列'],
      points: [
        '用滚动数组压缩空间',
        '用前缀和把转移降到 O(1)',
        '用单调队列优化带窗口限制的转移'
      ],
      code: {
        title: '滚动数组',
        body: `int dp[2][N];
for (int i = 1; i <= n; i++) {
    int cur = i & 1, pre = cur ^ 1;
    for (int j = 0; j <= W; j++) {
        dp[cur][j] = dp[pre][j];
        if (j >= w[i])
            dp[cur][j] = max(dp[cur][j],
                dp[pre][j - w[i]] + v[i]);
    }
}`
      },
      tasks: ['用前缀和优化分组求和', '用单调队列优化滑动窗口 DP']
    },
    {
      n: 7,
      title: '容斥原理',
      sub: '先全算上，再减掉重复的',
      tags: ['容斥', '集合', '计数'],
      points: [
        '理解两个与三个集合的容斥公式',
        '用二进制枚举实现一般容斥',
        '处理“至少”“至多”类计数问题'
      ],
      code: {
        title: '三集合容斥',
        body: `long long ans = A + B + C
             - AB - AC - BC
             + ABC;`
      },
      tasks: ['统计 1..n 中不能被 2、3、5 整除的数的个数', '用容斥求错排数']
    },
    {
      n: 8,
      title: '组合数学基础',
      sub: '排列、组合与杨辉三角',
      tags: ['排列组合', '杨辉三角', '计数'],
      points: [
        '区分排列 A(n, m) 与组合 C(n, m)',
        '用杨辉三角递推组合数',
        '用加法原理与乘法原理拆分问题'
      ],
      code: {
        title: '杨辉三角求组合数',
        body: `long long C[N][N];
for (int i = 0; i <= n; i++) {
    C[i][0] = C[i][i] = 1;
    for (int j = 1; j < i; j++)
        C[i][j] = C[i - 1][j - 1] + C[i - 1][j];
}`
      },
      tasks: ['求 C(n, m) 并对 1e9+7 取模', '统计网格路径条数']
    },
    {
      n: 9,
      title: '快速幂与矩阵快速幂',
      sub: '把幂运算降到 log 级',
      tags: ['快速幂', '矩阵乘法', '递推加速'],
      points: [
        '用二进制拆分思想实现快速幂',
        '掌握矩阵乘法的写法',
        '用矩阵快速幂加速线性递推'
      ],
      code: {
        title: '快速幂模板',
        body: `long long qpow(long long a, long long b, long long mod) {
    long long r = 1;
    while (b) {
        if (b & 1) r = r * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return r;
}`
      },
      tasks: ['用矩阵快速幂求斐波那契第 n 项', '求 a^b mod p']
    },
    {
      n: 10,
      title: '线性筛与数论函数',
      sub: 'O(n) 筛出所有素数',
      tags: ['线性筛', '欧拉函数', '约数'],
      points: [
        '每个合数只被最小质因子筛掉一次',
        '在线性筛上顺带求欧拉函数',
        '用约数个数公式解决计数问题'
      ],
      code: {
        title: '线性筛',
        body: `for (int i = 2; i <= n; i++) {
    if (!vis[i]) prime[++tot] = i;
    for (int j = 1; j <= tot && i * prime[j] <= n; j++) {
        vis[i * prime[j]] = 1;
        if (i % prime[j] == 0) break;
    }
}`
      },
      tasks: ['筛出 1..n 的所有素数并输出第 k 个', '求单个数的欧拉函数']
    },
    {
      n: 11,
      title: '扩展欧几里得',
      sub: '解不定方程与线性同余',
      tags: ['exgcd', '不定方程', '同余'],
      points: [
        '在 gcd 的过程中同时求出 x、y',
        '用 exgcd 求 ax + by = gcd(a, b) 的一组解',
        '用 exgcd 求最小正整数解'
      ],
      code: {
        title: '扩展欧几里得模板',
        body: `long long exgcd(long long a, long long b,
                  long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}`
      },
      tasks: ['求解 ax + by = c 的一组整数解', '求同余方程的最小正整数解']
    },
    {
      n: 12,
      title: '逆元与组合数取模',
      sub: '在模意义下做除法',
      tags: ['乘法逆元', '费马小定理', '组合数'],
      points: [
        '用费马小定理求模素数的逆元',
        '预处理阶乘与阶乘逆元',
        'O(1) 回答组合数取模'
      ],
      code: {
        title: '预处理阶乘逆元',
        body: `fac[0] = 1;
for (int i = 1; i <= n; i++)
    fac[i] = fac[i - 1] * i % mod;

invfac[n] = qpow(fac[n], mod - 2, mod);
for (int i = n; i >= 1; i--)
    invfac[i - 1] = invfac[i] * i % mod;`
      },
      tasks: ['求 C(n, m) mod 1e9+7', '求卡特兰数第 n 项']
    },
    {
      n: 13,
      title: '概率与期望',
      sub: '用期望的线性性拆问题',
      tags: ['期望', '线性性', '概率'],
      points: [
        '理解期望的定义与线性性',
        '把复杂期望拆成若干简单事件之和',
        '用 DP 求期望步数'
      ],
      code: {
        title: '期望的线性性',
        body: `double E = 0;
for (int i = 1; i <= n; i++)
    E += p[i];        // 每个事件贡献的期望直接相加
cout << fixed << setprecision(6) << E;`
      },
      tasks: ['求掷骰子点数的期望', '求随机游走首次到达目标的期望步数']
    },
    {
      n: 14,
      title: '博弈论入门：Nim',
      sub: '异或和决定胜负',
      tags: ['Nim', 'SG 函数', '异或'],
      points: [
        '理解必胜态与必败态的递推',
        '用异或和判断 Nim 游戏胜负',
        '用 SG 函数处理组合游戏'
      ],
      code: {
        title: 'Nim 游戏判定',
        body: `int x = 0;
for (int i = 1; i <= n; i++) {
    int a; cin >> a;
    x ^= a;
}
cout << (x ? "先手必胜" : "后手必胜") << endl;`
      },
      tasks: ['判断给定局面的胜负', '用 SG 函数解决取石子变体']
    },
    {
      n: 15,
      title: '计算几何入门',
      sub: '叉积、面积与位置关系',
      tags: ['叉积', '面积', '凸包'],
      points: [
        '用叉积判断三点方向与线段相交',
        '用叉积计算多边形面积',
        '用 Andrew 算法求凸包'
      ],
      code: {
        title: '叉积判断方向',
        body: `long long cross(P a, P b, P c) {
    return (b.x - a.x) * (c.y - a.y)
         - (b.y - a.y) * (c.x - a.x);
}
// > 0 逆时针，< 0 顺时针，= 0 共线`
      },
      tasks: ['求多边形面积', '判断点是否在三角形内部']
    },
    {
      n: 16,
      title: '综合测评与讲评',
      sub: '动态规划与数学综合',
      tags: ['综合测评', '模拟赛', '讲评'],
      points: [
        '限时完成 4 道综合题：DP、组合、数论、博弈',
        '形成个人模板库与检查清单',
        '制定下一阶段的竞赛训练计划'
      ],
      code: {
        title: '对拍：验证正解与暴力',
        body: `while (true) {
    system("gen.exe > in.txt");
    system("brute.exe < in.txt > out1.txt");
    system("solve.exe < in.txt > out2.txt");
    if (system("fc out1.txt out2.txt")) break;
}`
      },
      tasks: ['完成 120 分钟综合测评', '整理个人模板库与易错清单']
    }
  ]
};

const TRACKS = [
  {
    id: 'basic',
    roman: 'Ⅰ',
    name: '基础编程培训',
    short: '基础',
    en: 'FOUNDATION',
    audience: '小学四年级 — 初一 · 零基础',
    semester: '学期 15 讲 · 每周 1 讲',
    camp: '假期 7 天集训 · 上下午各一个点',
    campDays: 7,
    summary: '从计算机底层原理讲起，把输入输出、分支、循环、数组、函数、递归逐一打通，最后用一次结课测评收口。',
    highlights: ['语法与输入输出', '分支与循环', '数组与字符串', '函数与递归'],
    lessons: CURRICULUM.basic
  },
  {
    id: 'algo',
    roman: 'Ⅱ',
    name: '算法入门培训',
    short: '算法入门',
    en: 'ALGORITHM ENTRY',
    audience: '完成基础班 · 或通过入学测评',
    semester: '学期 18 讲 · 每周 1 讲',
    camp: '假期 10 天集训 · 上下午各一个点',
    campDays: 10,
    summary: '排序、二分、前缀和、贪心、搜索、动态规划一次走完，建立“看到题能想到方法”的算法直觉。',
    highlights: ['排序与二分', '前缀和与差分', 'DFS / BFS', '背包与线性 DP'],
    lessons: CURRICULUM.algo
  },
  {
    id: 'adva',
    roman: 'Ⅲ-A',
    name: '算法提升 A · 数据结构与图论',
    short: '提升 A',
    en: 'ADVANCED · DATA STRUCTURE',
    audience: '掌握基础算法 · 目标竞赛',
    semester: '学期 16 讲 · 每周 1 讲',
    camp: '假期 8 天集训（可选）',
    campDays: 8,
    summary: '并查集、树状数组、线段树、字符串算法与图论最短路，把工具箱从“会写”升级到“会用”。',
    highlights: ['并查集 / 树状数组', '线段树与单调结构', 'KMP / Trie', '最短路与生成树'],
    lessons: CURRICULUM.adva
  },
  {
    id: 'advb',
    roman: 'Ⅲ-B',
    name: '算法提升 B · 动态规划与数学',
    short: '提升 B',
    en: 'ADVANCED · DP & MATH',
    audience: '掌握基础算法 · 目标竞赛',
    semester: '学期 16 讲 · 每周 1 讲',
    camp: '假期 8 天集训（可选）',
    campDays: 8,
    summary: '从区间、树形、状压 DP 到容斥、组合、数论与博弈，补齐竞赛中最常考的一整块数学底盘。',
    highlights: ['区间 / 树形 DP', '状压与 DP 优化', '组合数学与容斥', '数论与博弈'],
    lessons: CURRICULUM.advb
  }
];

const STAGES = [
  {
    id: 'basic',
    roman: 'Ⅰ',
    en: 'STAGE ONE',
    name: '基础编程培训',
    trackIds: ['basic'],
    lectures: 15,
    summary: '零基础起步。先把“程序是怎么跑起来的”讲清楚，再在 15 讲里把 C++ 语法骨架搭完整。',
    meta: [
      { k: '学期', v: '15 讲 · 每周 1 讲' },
      { k: '集训', v: '7 天 · 上下午各一个点' },
      { k: '测评', v: '结课测试 + 讲评' }
    ]
  },
  {
    id: 'algo',
    roman: 'Ⅱ',
    en: 'STAGE TWO',
    name: '算法入门培训',
    trackIds: ['algo'],
    lectures: 18,
    summary: '从会写语法到会想方法。排序、二分、搜索、动态规划依次推进，18 讲形成完整的入门算法地图。',
    meta: [
      { k: '学期', v: '18 讲 · 每周 1 讲' },
      { k: '集训', v: '10 天 · 上下午各一个点' },
      { k: '测评', v: '结课测试 + 讲评' }
    ]
  },
  {
    id: 'adv',
    roman: 'Ⅲ',
    en: 'STAGE THREE',
    name: '算法提升',
    trackIds: ['adva', 'advb'],
    lectures: 32,
    summary: '两条进阶线并行开放，每条 16 讲。数据结构与图论、动态规划与数学，按竞赛方向自由组合。',
    meta: [
      { k: '进阶', v: '2 条线 · 各 16 讲' },
      { k: '学期', v: '每周 1 讲' },
      { k: '集训', v: '8 天集训（可选）' }
    ]
  }
];

const FEATURED = [
  { trackId: 'basic', n: 1 },
  { trackId: 'algo', n: 14 },
  { trackId: 'adva', n: 4 }
];
