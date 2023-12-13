const express = require('express');
const http = require('http');
// const cors = require('cors');
const socketIo = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173", // 允许来自前端服务器的请求
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



// 创建一个长度为10的数组，数组元素为0
const users = Array(10).fill(0);
let userCount = 0;
let readyCount = 0;
const sockets = new Map();
const gameState = {

};

function userAdd(user) {
    for (let i = 0; i < users.length; i++) {
        if (users[i] === 0) {
            users[i] = user;
            return i;
        }
    }
    return -1;
}

function switchPos(fromIndex, toIndex) {
    const user = users[fromIndex];
    const toUser = users[toIndex];
    users[toIndex] = user;
    users[fromIndex] = toUser;
}



io.on('connection', (socket) => {

    // 用户加入房间
    socket.on('join', ({ name, color = 0xffffff }) => {

        if (name && !users.some(user => user?.name == name)) {
            const user = { id: socket.id, name, color, state: false, switching: false, switchIndex: -1 };
            const index = userAdd(user);
            if (index === -1) {
                io.to(socket.id).emit('join_fail', { msg: '加入房间失败，房间已满。' });
                socket.disconnect();
                return;
            }
            socket.index = index;
            sockets.set(name, socket);
            socket.join("root");
            io.to(socket.id).emit('join_success', { users, index: socket.index });
            socket.to("root").emit('userJoin', user, index);
            userCount++;
            console.log(`user ${name} join`);
        } else {
            socket.emit('join_fail', { msg: "加入房间失败，名字已存在。" });
            socket.disconnect();
        }
    });

    // 用户请求交换位置
    socket.on('switchPos', (index) => {
        // 当前位置无人，直接交换位置
        const fromIndex = socket.index;
        const user = users[fromIndex];
        users[index] = user;
        users[fromIndex] = 0;
        socket.index = index;
        socket.to("root").emit('switchPos', { fromIndex, toIndex: index });
        console.log(`user ${users[socket.index].name} switch to ${index}`);
    });

    socket.on('switchReq', (toIndex) => {
        if(users[toIndex]?.switching) {
            socket.emit('switchFail', { msg: "交换位置失败，对方正在交换位置。" });
        }else{
            const user = users[toIndex];

            user.switching = true;
            user.switchIndex = socket.index;

            users[socket.index].switching = true;
            users[socket.index].switchIndex = toIndex;

            sockets.get(user.name).emit('switchReq',{ fromIndex: socket.index });
        }
    });

    socket.on('switchRsp', (obj) => {
        const { res } = obj;
        if(!res) {
            const fromIndex = users[socket.index].switchIndex;
            const user = users[fromIndex];
            users[fromIndex].switching = false;
            users[fromIndex].switchIndex = -1;

            users[socket.index].switching = false;
            users[socket.index].switchIndex = -1;

            sockets.get(user.name).emit('switchFail', { msg: "交换位置失败，对方拒接交换。" });
        }
        if(res) {
            const fromIndex = users[socket.index].switchIndex;
            const toIndex = socket.index;
            const user = users[fromIndex];
            users[fromIndex] = users[toIndex];
            users[fromIndex].switching = false;
            users[fromIndex].switchIndex = -1;

            users[toIndex] = user;
            users[toIndex].switching = false;
            users[toIndex].switchIndex = -1;
            socket.index = fromIndex;
            sockets.get(user.name).index = toIndex;
            socket.to("root").emit('switchPos', { fromIndex, toIndex });
            console.log(users);
            console.log(`user ${fromIndex} switch to ${toIndex}`);

        }

    });

    // 用户准备
    socket.on('ready', () => {
        console.log(`user ${users[socket.index].name} ready`);
        users[socket.index].state = true;
        socket.to("root").emit('userReady', users[socket.index].name);
        readyCount++;
        if (readyCount === userCount && userCount === 10) {
            // 所有用户都准备好了，开始游戏
            console.log("start game");
            socket.to("root").emit('startGame');
        }
    });

    // 用户取消准备
    socket.on('cancelReady', () => {
        console.log(`user ${users[socket.index].name} cancel ready`);
        users[socket.index].state = false;
        socket.to("root").emit('userCancelReady', users[socket.index].name);
        readyCount--;
    });


    // 用户断开连接
    socket.on('disconnect', () => {
        const userIndex = users.findIndex(user => user?.id === socket.id);
        if (userIndex !== -1) {
            const user = users[userIndex];
            users[userIndex] = 0; // 将该位置置为0
            sockets.delete(user.name); // 从 sockets 映射中删除
            socket.to("root").emit('userLeave', user.name);
            userCount--;
            if (user.state) readyCount--;
            console.log(`User ${user.name} (ID: ${user.id}) left`);
        }
    });

    socket

});


