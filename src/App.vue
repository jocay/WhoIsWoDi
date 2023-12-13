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

socket.on('userJoin', (user,index) => {
  info.users[index] = user;
  console.log(info.users);
});

socket.on('userLeave', (name) => {
  info.users = info.users.filter(u => u.name !== name);
});

socket.on('userReady', (name) => {
  info.users.forEach(u => {
    if(u.name === name) {
      u.state = true;
    }
  });
});

socket.on('userCancelReady', (name) => {
  info.users.forEach(u => {
    if(u.name === name) {
      u.state = false;
    }
  });
});

function openDialog() {
  if(info.name !== '') {
    socket.emit('join', info);
  }else{
    const dialog = document.getElementById('dialog');
    dialog.show();
  }
}

function ready() {
    info.state = !info.state;
    const user = info.users[info.index];
    user.state = info.state;
    if(info.state) {
        socket.emit('ready');
    }else{
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
            <div v-for="u in info.users.slice(0, 5)" :style="`background-color: ${u.state ? u.color : '#fff'};`" class="user">
                {{ u.name }}
            </div>
        </div>

        <div class="right" style="float: right;">
            <div class="user"> 红方 </div>
            <div v-for="u in info.users.slice(5, 10)" class="user">
                {{ u.name }}
            </div>
        </div>
    </div>
    <md-filled-button @click="ready">{{ info.state ? "取消准备" : "准备" }}</md-filled-button>
  </div>
  
  <md-dialog id="dialog" type="alert">
    <div slot="headline">
      起个名字吧
    </div>
    <form slot="content" id="form" method="dialog">
      <md-outlined-text-field id="name" label="名字" ></md-outlined-text-field>
    </form>
    <div slot="actions">
      <md-outlined-button form="form" @click="submit" value="ok">好了</md-outlined-button>
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
