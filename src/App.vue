<script setup>
import { onMounted, reactive, ref, inject } from 'vue';
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

import TeamSide from './components/TeamSide.vue';

const socket = inject('socket');


let step = ref(1);

const info = reactive({
  name: '',
  color: '0xffffff',
  // users: Array(10).fill({name: '123'}),
  users: []
});

socket.on('join_fail', () => {
  console.log('join_fail');
});

socket.on('join_success', (data) => {
  console.log('join_success');
  step.value += 1;

  console.log(data);
  // 直接赋值会失去响应式，
  info.users = data;
});

socket.on('userJoin', (users) => {
  info.users = users;
});

socket.on('userLeave', (name) => {
  info.users = info.users.filter(u => u.name !== name);
});

socket.on('userReady', (name) => {
  console.log(name);
  info.users = info.users.map(u => {
    if(u.name === name) {
      u.state = true;
    }
  });
});

socket.on('userCancelReady', (name) => {
  console.log(name);
  info.users = info.users.map(u => {
    if(u.name === name) {
      u.state = false;
    }
  });
});

function openDialog() {
  if(info.name !== '') {
    socket.emit('join', info);
  }else{
    console.log('openDialog');
    const dialog = document.getElementById('dialog');
    dialog.show();
  }
}


function submit() {
  const name = document.getElementById('name')
  info.name = name.value;
  name.value = '';
  info.color = changeColor();
  socket.emit('join', info);
  // console.log(info);
}

function changeColor() {
  const corePalette = CorePalette.contentOf(Math.random() * 0xffffff);
  const keyColor = corePalette.a1.keyColor.argb.toString(16);
  const colorHex = `#${keyColor}`;
  const box = document.getElementById('box');
  box.style.backgroundColor = colorHex;
  return colorHex;
}


onMounted(() => {
  const dialog = document.getElementById('dialog');
  dialog.addEventListener('closed', () => {
    if (dialog.returnValue === 'ok'){
      console.log('ok');
    }
  });
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
    Page 2
    <TeamSide :arr="info.users" :selfName="info.name" :selfColor="info.color" />
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
</style>
