const users = [
    // 随机生成10个人
    { id: 1, name: 'John' },
    { id: 2, name: 'Pete' },
    { id: 3, name: 'Mary' },
    { id: 4, name: 'Bad' },
    { id: 5, name: 'Ada' },
    { id: 6, name: 'John' },
    { id: 7, name: 'Pete' },
    { id: 8, name: 'Mary' },
    { id: 9, name: 'Bad' },
    0
];


const events = [
    // 随机生成10个事件
    { id:1, event: 'sing a song' },
    { id:2, event: 'sing a song' },
    { id:3, event: 'sing a song' },
    { id:4, event: 'sing a song' },
    { id:5, event: 'sing a song' },
    { id:6, event: 'sing a song' },
    { id:7, event: 'sing a song' },
    { id:8, event: 'sing a song' },
    { id:9, event: 'sing a song' },
    { id:10, event: 'sing a song' },
]


function assigningRoles() {
    // 从0-5中选一个，5-10中选一个
    const buleWoDi = users[Math.floor(Math.floor(Math.random() * 5))];
    const redWoDi = users[Math.floor(Math.random() * 5) + 5];

    // 从events中选一个
    buleWoDi.event = events[Math.floor(Math.random() * events.length)];
    redWoDi.event = events[Math.floor(Math.random() * events.length)];
    buleWoDi.wolf = true;
    redWoDi.wolf = true;

    console.log(buleWoDi, redWoDi);
}

function test() {
    // 从0-5中选一个，5-10中选一个,过滤掉0
    const buleWoDi = users.filter(u => u !== 0)[Math.floor(Math.floor(Math.random() * 5))];
    console.log(buleWoDi);
}
test();