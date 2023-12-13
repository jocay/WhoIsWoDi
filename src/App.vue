<script setup>
import { onMounted, reactive, ref, inject, watch } from 'vue';
import { CorePalette } from "@material/material-color-utilities";

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/dialog/dialog.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/suggestion-chip.js';


const socket = inject('socket');


let step = ref(1);

const info = reactive({
  switchUser: null,
  switchIndex: null,
  name: '',
  color: '0xffffff',
  state: false,
  index: 0,
  users: []
});

socket.on('join_fail', () => {
  console.log('join_fail');
});

socket.on('join_success', (data) => {
  console.log('join_success');
  step.value += 1;

  info.users = data.users;
  info.index = data.index;
});

socket.on('userJoin', (user, index) => {
  info.users[index] = user;
  console.log(info.users);
});

socket.on('userLeave', (name) => {
  const users = info.users;
  for (let i = 0; i < users.length; i++) {
    if (users[i].name === name) {
      users[i] = 0;
      break;
    }
  }
});

socket.on('userReady', (name) => {
  info.users.forEach(u => {
    if (u.name === name) {
      u.state = true;
    }
  });
});

socket.on('userCancelReady', (name) => {
  info.users.forEach(u => {
    if (u.name === name) {
      u.state = false;
    }
  });
});

socket.on('switchReq', (obj) => {
  const { fromIndex } = obj;
  info.switchUser = info.users[fromIndex];
  info.switchIndex = fromIndex;
  const dialog = document.getElementById('switch');
  
  dialog.show();
});

socket.on('switchFail', () => {
  console.log('switchFail');
  const dialog = document.getElementById('switch');
  dialog.close();
});

socket.on('switchPos', (obj) => {
  const { fromIndex, toIndex } = obj;
  switchTo(fromIndex, toIndex);
});

socket.on('startGame', () => {
  step.value = 3;
  console.log('start');
});

socket.on('assignRole', (user) => {
  info.assigned = user.assigned;
  info.wolf = user.wolf;
  info.event = user.event;
  info.identity = user.identity;
  console.log('assignRole', user);
});

function openDialog() {
  if (info.name !== '') {
    socket.emit('join', info);
  } else {
    const dialog = document.getElementById('dialog');
    dialog.show();
  }
}

function ready() {
  info.state = !info.state;
  const user = info.users[info.index];
  user.state = info.state;
  if (info.state) {
    socket.emit('ready');
  } else {
    socket.emit('cancelReady');
  }
}


function submit() {
  const name = document.getElementById('name');
  info.name = name.value;
  name.value = '';
  info.color = changeColor();
  socket.emit('join', info);
}

function changeColor() {
  const corePalette = CorePalette.contentOf(Math.random() * 0xffffff);
  const keyColor = corePalette.a1.keyColor.argb.toString(16);
  return `#${keyColor}`;
}

function switchTo(fromIndex, toIndex) {
  console.log('switch',fromIndex, toIndex);
  const selfIndex = info.index;
  if (fromIndex === selfIndex) {
    info.index = toIndex;
    console.log(info.index);
  }
  if (toIndex === selfIndex) {
    info.index = fromIndex;
    console.log(info.index);
  }
  const fromUser = info.users[fromIndex];
  const toUser = info.users[toIndex];
  info.users[fromIndex] = toUser;
  info.users[toIndex] = fromUser;
}

function switchPos(index) {
  console.log(info.index, index)
  if (info.users[index] === 0) {
    switchTo(info.index, index);
    socket.emit('switchPos', index);
  } else if( index !== info.index) {
    console.log('switchReq', index);
    socket.emit('switchReq', index);
  }
}

function userSwitch(res) {
  const index = info.switchIndex;
  if(res){
    switchTo(info.switchIndex, info.index);
  }
  document.getElementById('switch').close();
  socket.emit('switchRsp', {res});
}

onMounted(() => {
});
</script>

<template>
  <div id="main-1" v-if="step === 1">
    <div id="box">
      {{ info.name === "" ? "" : `欢迎加入 - ${info.name}` }}
    </div>
    <md-filled-button id="opeb" @click="openDialog">加入游戏！</md-filled-button>
  </div>

  <div id="main-2" v-else-if="step === 2">
    <div class="team">
      <div class="left" style="float: left;">
        <div class="user"> 蓝方 </div>
        <div @click="switchPos(index)" v-for="(u, index) in info.users.slice(0, 5)" :key="u.id"
          :style="`background-color: ${u.state ? u.color : '#fff'};`" class="user">
          {{ u.name }}
        </div>
      </div>

      <div class="right" style="float: right;">
        <div class="user"> 红方 </div>
        <div @click="switchPos(index + 5)" v-for="(u, index) in info.users.slice(5, 10)" :key="u.id"
          :style="`background-color: ${u.state ? u.color : '#fff'};`" class="user">
          {{ u.name }}
        </div>
      </div>
    </div>
    <md-filled-button @click="ready">{{ info.state ? "取消准备" : "准备" }}</md-filled-button>
  </div>

  <div id="main-3" v-else-if="step === 3">
    <h2>你的身份是:</h2>
    <h1> {{ info.index < 5 ? "蓝方" : "红方" }} </h1>
    <div> {{ info.assigned ? `${info.wolf ? '卧底' : '平民'}` : '---' }} </div>
  </div>

  <md-dialog id="dialog" type="alert">
    <div slot="headline">
      起个名字吧
    </div>
    <form slot="content" id="form" method="dialog">
      <md-outlined-text-field id="name" label="名字"></md-outlined-text-field>
    </form>
    <div slot="actions">
      <md-outlined-button form="form" @click="submit" value="ok">好了</md-outlined-button>
    </div>
  </md-dialog>

  <md-dialog id="switch" type="alert">
    <div slot="headline">
      {{ `${info.switchUser?.name}请求与您交换位置，是否允许？` }}
    </div>
    
    <div slot="actions">
      <md-outlined-button  value="no" @click="userSwitch(false)">哒咩哟</md-outlined-button>
      <md-filled-button value="ok" @click="userSwitch(true)">勉强同意</md-filled-button>
    </div>
  </md-dialog>


</template>

<style scoped>
#main-1 {
  width: 80vw;
  height: 80vw;
  background-color: #db7c7c;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#main-2 {
  width: 100vw;
  height: 100vh;
  /* background-color: #db7c7c; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#box {
  width: 100px;
  height: 100px;
  /* background-color: #db7c7c; */
}

.team {
  width: 100%;
  height: 100%;
  padding-top: 10vh;
}

.user {
  width: 40vw;
  height: 90px;
  border: 1px solid black;
  display: flex;
  /* flex-direction: column; */
  justify-content: center;
  align-items: center;

  /* background-color: #db7c7c; */
}
</style>
