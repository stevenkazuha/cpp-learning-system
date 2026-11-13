/* 码阶 CODE LADDER · 在线判题题库
   每个题目对应一讲课程，模板代码可直接编译运行（大部分留有 TODO） */

const PROBLEMS = [
  {
    id: 'p01',
    title: 'A + B 问题',
    trackId: 'basic',
    lesson: 1,
    difficulty: '入门',
    tags: ['输入输出', '环境验证'],
    external: {
      luogu: { pid: 'P1001', title: 'A+B Problem' },
      nowcoder: { keyword: 'A+B' }
    },
    statement: [
      '读入两个整数 a 和 b，输出它们的和。',
      '这是第 01 讲的例题，用来确认你的编译环境、输入输出格式都正确。'
    ],
    input: '一行两个整数 a、b，保证 |a|、|b| ≤ 10^9。',
    output: '一行一个整数，表示 a + b。',
    samples: [{ in: '1 2', out: '3' }],
    tests: [
      { in: '1 2', out: '3' },
      { in: '100 -37', out: '63' },
      { in: '-5 -8', out: '-13' },
      { in: '0 0', out: '0' },
      { in: '1000000000 1000000000', out: '2000000000' }
    ],
    template: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
    hint: '不要输出“请输入”之类的提示语，判题只比较标准输出。'
  },
  {
    id: 'p02',
    title: '秒数换算',
    trackId: 'basic',
    lesson: 2,
    difficulty: '入门',
    tags: ['取模', '整除'],
    external: {
      luogu: { pid: 'P1425', title: '小鱼的游泳时间' },
      nowcoder: { keyword: '时间换算' }
    },
    statement: [
      '体育课上的计时器只显示一个总秒数，请你把它换算成“时 分 秒”的格式。',
      '例如 3661 秒 = 1 时 1 分 1 秒。'
    ],
    input: '一个整数 n（0 ≤ n < 86400）。',
    output: '一行三个整数 h m s，用空格分隔。',
    samples: [{ in: '3661', out: '1 1 1' }],
    tests: [
      { in: '3661', out: '1 1 1' },
      { in: '59', out: '0 0 59' },
      { in: '7325', out: '2 2 5' },
      { in: '0', out: '0 0 0' },
      { in: '86399', out: '23 59 59' }
    ],
    template: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // TODO: 用 / 和 % 求出时、分、秒
    int h = 0, m = 0, s = 0;
    cout << h << " " << m << " " << s << endl;
    return 0;
}`,
    hint: 'h = n / 3600；剩下的秒数再用 % 3600 取出来继续分。'
  },
  {
    id: 'p03',
    title: '成绩等级',
    trackId: 'basic',
    lesson: 3,
    difficulty: '入门',
    tags: ['if-else', '区间判断'],
    external: {
      luogu: { pid: 'P5710', title: '数的性质' },
      nowcoder: { keyword: '成绩等级' }
    },
    statement: [
      '输入一个 0 到 100 的整数分数，按下面的规则输出等级：',
      '90 分及以上输出 A；75–89 输出 B；60–74 输出 C；60 分以下输出 D。'
    ],
    input: '一个整数 score（0 ≤ score ≤ 100）。',
    output: '一个大写字母：A、B、C 或 D。',
    samples: [{ in: '95', out: 'A' }],
    tests: [
      { in: '95', out: 'A' },
      { in: '75', out: 'B' },
      { in: '59', out: 'D' },
      { in: '90', out: 'A' },
      { in: '60', out: 'C' },
      { in: '0', out: 'D' }
    ],
    template: `#include <iostream>
using namespace std;

int main() {
    int score;
    cin >> score;
    // TODO: 用 if / else if 输出 A、B、C、D
    cout << "D" << endl;
    return 0;
}`,
    hint: '从高分往低分判断，else if 只需要写下限。'
  },
  {
    id: 'p04',
    title: '1 到 n 求和',
    trackId: 'basic',
    lesson: 5,
    difficulty: '入门',
    tags: ['for 循环', '累加器'],
    external: {
      luogu: { pid: 'P5722', title: '数列求和' },
      nowcoder: { keyword: '1到n求和' }
    },
    statement: [
      '读入正整数 n，输出 1 + 2 + … + n 的结果。',
      '注意 n 最大到 10^6，答案需要用 long long 保存。'
    ],
    input: '一个整数 n（1 ≤ n ≤ 10^6）。',
    output: '一个整数，表示 1 到 n 的和。',
    samples: [{ in: '10', out: '55' }],
    tests: [
      { in: '10', out: '55' },
      { in: '100', out: '5050' },
      { in: '1000000', out: '500000500000' },
      { in: '1', out: '1' },
      { in: '999999', out: '499999500000' }
    ],
    template: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long sum = 0;
    // TODO: 用 for 循环把 1..n 累加到 sum
    cout << sum << endl;
    return 0;
}`,
    hint: 'sum 用 long long，n 用 int 就够了。'
  },
  {
    id: 'p05',
    title: '数位之和',
    trackId: 'basic',
    lesson: 6,
    difficulty: '入门',
    tags: ['while 循环', '拆位'],
    external: {
      luogu: { pid: 'P1307', title: '数字反转' },
      nowcoder: { keyword: '数位之和' }
    },
    statement: [
      '读入一个非负整数，求它每一位数字之和。',
      '例如 1234 的答案是 1 + 2 + 3 + 4 = 10。'
    ],
    input: '一个整数 n（0 ≤ n ≤ 10^9）。',
    output: '一个整数，表示各位数字之和。',
    samples: [{ in: '1234', out: '10' }],
    tests: [
      { in: '1234', out: '10' },
      { in: '0', out: '0' },
      { in: '999999999', out: '81' },
      { in: '1000000000', out: '1' },
      { in: '123456789', out: '45' }
    ],
    template: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    // TODO: while (n > 0) 逐位累加
    cout << sum << endl;
    return 0;
}`,
    hint: 'n % 10 取出个位，n / 10 去掉个位。'
  },
  {
    id: 'p06',
    title: '数组最大值',
    trackId: 'basic',
    lesson: 7,
    difficulty: '入门',
    tags: ['一维数组', '遍历'],
    external: {
      luogu: { pid: 'P5724', title: '求极差' },
      nowcoder: { keyword: '数组最大值' }
    },
    statement: [
      '读入 n 个整数，输出其中的最大值。',
      '数据中可能有负数，注意最大值的初始值不要设成 0。'
    ],
    input: '第一行一个整数 n；第二行 n 个整数。',
    output: '一个整数，表示最大值。',
    samples: [{ in: '5\n3 9 2 7 5', out: '9' }],
    tests: [
      { in: '5\n3 9 2 7 5', out: '9' },
      { in: '1\n-4', out: '-4' },
      { in: '4\n-9 -3 -7 -1', out: '-1' },
      { in: '2\n-5 -2', out: '-2' },
      { in: '3\n0 0 0', out: '0' }
    ],
    template: `#include <iostream>
using namespace std;

int main() {
    int n, a[105];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    int mx = a[0];
    // TODO: 遍历数组，更新最大值
    cout << mx << endl;
    return 0;
}`,
    hint: '最大值初始化成 a[0] 最稳妥。'
  },
  {
    id: 'p07',
    title: '回文判断',
    trackId: 'basic',
    lesson: 10,
    difficulty: '基础',
    tags: ['string', '双指针'],
    external: {
      luogu: { pid: 'P1217', title: '回文质数' },
      nowcoder: { keyword: '回文串' }
    },
    statement: [
      '回文串是指正着读和倒着读完全相同的字符串，比如 level、noon。',
      '读入一个不含空格的字符串，判断它是不是回文串。'
    ],
    input: '一个仅含小写字母的字符串，长度不超过 1000。',
    output: '是回文串输出 YES，否则输出 NO。',
    samples: [{ in: 'level', out: 'YES' }],
    tests: [
      { in: 'level', out: 'YES' },
      { in: 'abc', out: 'NO' },
      { in: 'a', out: 'YES' },
      { in: 'noon', out: 'YES' },
      { in: 'abba', out: 'YES' },
      { in: 'abcba', out: 'YES' }
    ],
    template: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    // TODO: 用双指针或 reverse 判断回文
    cout << "NO" << endl;
    return 0;
}`,
    hint: '双指针：i 从头走，j 从尾走，遇到不同就说明不是回文。'
  },
  {
    id: 'p08',
    title: '成绩排序',
    trackId: 'basic',
    lesson: 11,
    difficulty: '基础',
    tags: ['struct', 'sort', '自定义比较'],
    external: {
      luogu: { pid: 'P1093', title: '奖学金' },
      nowcoder: { keyword: '成绩排序' }
    },
    statement: [
      '读入 n 名学生的姓名和成绩，按成绩从高到低排序输出。',
      '成绩相同时，按姓名字典序从小到大排列。'
    ],
    input: '第一行一个整数 n；接下来 n 行，每行一个姓名和一个整数成绩。',
    output: 'n 行，每行“姓名 成绩”。',
    samples: [{ in: '3\nTom 88\nAmy 95\nBob 88', out: 'Amy 95\nBob 88\nTom 88' }],
    tests: [
      { in: '3\nTom 88\nAmy 95\nBob 88', out: 'Amy 95\nBob 88\nTom 88' },
      { in: '2\nZoe 100\nAmy 100', out: 'Amy 100\nZoe 100' },
      { in: '1\nAmy 60', out: 'Amy 60' },
      { in: '3\nBob 90\nAmy 90\nZoe 90', out: 'Amy 90\nBob 90\nZoe 90' }
    ],
    template: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    int n;
    cin >> n;
    vector<Student> v(n);
    for (auto &x : v) cin >> x.name >> x.score;

    // TODO: 用 sort + 比较函数排序
    for (auto &x : v) cout << x.name << " " << x.score << endl;
    return 0;
}`,
    hint: '比较函数：成绩不同时按成绩降序，否则按姓名升序。'
  },
  {
    id: 'p09',
    title: '冒泡排序',
    trackId: 'algo',
    lesson: 1,
    difficulty: '基础',
    tags: ['冒泡排序', '排序'],
    external: {
      luogu: { pid: 'P1116', title: '车厢重组' },
      nowcoder: { keyword: '冒泡排序' }
    },
    statement: [
      '读入 n 个整数，用冒泡排序把它们从小到大排好并输出。',
      '这道题的重点不是结果，而是把两层循环的边界写对。'
    ],
    input: '第一行一个整数 n；第二行 n 个整数。',
    output: '一行 n 个整数，从小到大排列，用空格分隔。',
    samples: [{ in: '5\n5 2 9 1 7', out: '1 2 5 7 9' }],
    tests: [
      { in: '5\n5 2 9 1 7', out: '1 2 5 7 9' },
      { in: '3\n-1 0 -5', out: '-5 -1 0' },
      { in: '1\n42', out: '42' },
      { in: '4\n4 4 2 2', out: '2 2 4 4' }
    ],
    template: `#include <iostream>
using namespace std;

int main() {
    int n, a[1005];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    // TODO: 冒泡排序（两层循环 + swap）

    for (int i = 0; i < n; i++) cout << a[i] << " ";
    cout << endl;
    return 0;
}`,
    hint: '外层循环 n-1 次，内层到 n-1-i，相邻逆序就交换。'
  },
  {
    id: 'p10',
    title: '二分查找',
    trackId: 'algo',
    lesson: 3,
    difficulty: '基础',
    tags: ['二分', '下标'],
    external: {
      luogu: { pid: 'P2249', title: '查找' },
      nowcoder: { keyword: '二分查找' }
    },
    statement: [
      '给定一个从小到大排好序的数组，回答 q 次询问：数字 x 第一次出现的位置在哪里？',
      '下标从 0 开始；如果 x 不存在，输出 -1。'
    ],
    input: '第一行 n 和 q；第二行 n 个升序整数；第三行 q 个询问整数。',
    output: '每个询问输出一行，表示第一次出现的下标或 -1。',
    samples: [{ in: '5 3\n1 3 5 7 9\n5 1 8', out: '2\n0\n-1' }],
    tests: [
      { in: '5 3\n1 3 5 7 9\n5 1 8', out: '2\n0\n-1' },
      { in: '4 2\n2 2 2 2\n2 3', out: '0\n-1' },
      { in: '1 1\n5\n5', out: '0' },
      { in: '3 1\n1 2 3\n4', out: '-1' }
    ],
    template: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    for (int i = 0; i < q; i++) {
        int x;
        cin >> x;
        // TODO: 二分查找 x 第一次出现的位置
        cout << -1 << endl;
    }
    return 0;
}`,
    hint: '找左边界：a[mid] < x 时 l = mid + 1，否则 r = mid。'
  },
  {
    id: 'p11',
    title: '区间和查询',
    trackId: 'algo',
    lesson: 4,
    difficulty: '基础',
    tags: ['前缀和', 'O(1) 查询'],
    external: {
      luogu: { pid: 'P1115', title: '最大子段和' },
      nowcoder: { keyword: '前缀和' }
    },
    statement: [
      '给定 n 个整数和 q 次询问，每次询问区间 [l, r] 内所有数的和。',
      '直接用循环累加会超时，请用前缀和把每次询问降到 O(1)。'
    ],
    input: '第一行 n 和 q；第二行 n 个整数；接下来 q 行，每行 l、r（下标从 1 开始）。',
    output: '每个询问输出一行，表示区间和。',
    samples: [{ in: '5 2\n1 2 3 4 5\n1 3\n2 5', out: '6\n14' }],
    tests: [
      { in: '5 2\n1 2 3 4 5\n1 3\n2 5', out: '6\n14' },
      { in: '1 1\n7\n1 1', out: '7' },
      { in: '2 1\n2000000000 2000000000\n1 2', out: '4000000000' },
      { in: '3 2\n-5 10 -2\n1 3\n2 2', out: '3\n10' }
    ],
    template: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, q;
    cin >> n >> q;
    vector<long long> s(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        // TODO: 预处理前缀和
        s[i] = x;
    }
    for (int i = 0; i < q; i++) {
        int l, r;
        cin >> l >> r;
        // TODO: 输出 s[r] - s[l-1]
        cout << 0 << endl;
    }
    return 0;
}`,
    hint: 's[i] = s[i-1] + a[i]，注意用 long long。'
  },
  {
    id: 'p12',
    title: '迷宫最短路',
    trackId: 'algo',
    lesson: 14,
    difficulty: '进阶',
    tags: ['BFS', '网格', '最短路'],
    external: {
      luogu: { pid: 'P1443', title: '马的遍历' },
      nowcoder: { keyword: '迷宫最短路' }
    },
    statement: [
      '一个 n × m 的迷宫，S 是起点，E 是终点，. 可以通行，# 是墙。',
      '每一步可以上下左右移动一格，求从 S 到 E 的最少步数；走不到输出 -1。'
    ],
    input: '第一行 n 和 m；接下来 n 行，每行 m 个字符（S、E、.、#）。',
    output: '一个整数，表示最少步数，或 -1。',
    samples: [
      { in: '3 5\nS.#..\n.##..\n...E.', out: '5' }
    ],
    tests: [
      { in: '3 5\nS.#..\n.##..\n...E.', out: '5' },
      { in: '1 2\nSE', out: '1' },
      { in: '2 2\nS#\n#E', out: '-1' },
      { in: '2 3\nS..\n..E', out: '3' }
    ],
    template: `#include <iostream>
#include <queue>
#include <cstring>
using namespace std;

int n, m;
char g[505][505];
int dist[505][505];
int dx[4] = {-1, 1, 0, 0};
int dy[4] = {0, 0, -1, 1};

int main() {
    cin >> n >> m;
    int sx, sy, ex, ey;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) {
            cin >> g[i][j];
            if (g[i][j] == 'S') { sx = i; sy = j; }
            if (g[i][j] == 'E') { ex = i; ey = j; }
        }

    memset(dist, -1, sizeof(dist));
    // TODO: 用 BFS 求最少步数，输出 dist[ex][ey]

    cout << -1 << endl;
    return 0;
}`,
    hint: '第一次访问到某个格子时，dist 就是起点到它的最短距离。'
  },
  {
    id: 'p13',
    title: '01 背包',
    trackId: 'algo',
    lesson: 15,
    difficulty: '进阶',
    tags: ['背包', '动态规划'],
    external: {
      luogu: { pid: 'P1048', title: '采药' },
      nowcoder: { keyword: '01背包' }
    },
    statement: [
      '有 n 件物品，第 i 件重量 w[i]、价值 v[i]，背包容量为 W，每件最多选一次。',
      '求能装下的最大总价值。'
    ],
    input: '第一行 n 和 W；接下来 n 行，每行 w[i] 和 v[i]。',
    output: '一个整数，表示最大总价值。',
    samples: [{ in: '3 5\n2 3\n3 4\n4 5', out: '7' }],
    tests: [
      { in: '3 5\n2 3\n3 4\n4 5', out: '7' },
      { in: '1 10\n5 9', out: '9' },
      { in: '2 3\n5 10\n4 8', out: '0' },
      { in: '1 5\n5 7', out: '7' }
    ],
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, W;
    cin >> n >> W;
    vector<int> w(n + 1), v(n + 1);
    for (int i = 1; i <= n; i++) cin >> w[i] >> v[i];

    vector<int> dp(W + 1, 0);
    // TODO: 倒序枚举容量，完成 01 背包转移

    cout << dp[W] << endl;
    return 0;
}`,
    hint: '容量必须从 W 倒着枚举到 w[i]，否则一件物品会被重复选。'
  },
  {
    id: 'p14',
    title: '括号匹配',
    trackId: 'algo',
    lesson: 12,
    difficulty: '基础',
    tags: ['栈', '括号序列'],
    external: {
      luogu: { pid: 'P1739', title: '表达式括号匹配' },
      nowcoder: { keyword: '括号匹配' }
    },
    statement: [
      '给定一个只包含小括号的字符串，判断括号是否一一匹配。',
      '例如 (()()) 合法，(()) 合法，(() 不合法。'
    ],
    input: '一行一个括号字符串，长度不超过 10^5。',
    output: '合法输出 YES，否则输出 NO。',
    samples: [{ in: '(()())', out: 'YES' }],
    tests: [
      { in: '(()())', out: 'YES' },
      { in: '(()', out: 'NO' },
      { in: ')', out: 'NO' },
      { in: '()()', out: 'YES' },
      { in: '((()))', out: 'YES' },
      { in: ')(', out: 'NO' }
    ],
    template: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    stack<char> st;
    bool ok = true;

    // TODO: 扫描字符串，用栈判断括号是否匹配

    cout << (ok ? "YES" : "NO") << endl;
    return 0;
}`,
    hint: '遇到左括号入栈；遇到右括号时栈不能为空，最后栈也必须为空。'
  }
];

const COMPILER = {
  endpoint: 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
  languageId: 54,
  name: 'Judge0 CE · C++17'
};
