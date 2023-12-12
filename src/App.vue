<script setup>
import HelloWorld from './components/HelloWorld.vue'
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/dialog/dialog.js';
import '@material/web/textfield/outlined-text-field.js';
import { onMounted } from 'vue';

import { Hct } from "@material/material-color-utilities";

// Simple demonstration of HCT.
// const color = Hct.fromInt(0xff4285f4);
// console.log(`Hue: ${color.hue}`);
// console.log(`Chrome: ${color.chroma}`);
// console.log(`Tone: ${color.tone}`);

function openDialog() {
  console.log('openDialog');
  const dialog = document.getElementById('dialog');
  dialog.show();
}

function closeDialog() {
  console.log('closeDialog');
  const dialog = document.getElementById('dialog');
  dialog.close();
}

function submit() {
  console.log('submit');
  const form = document.getElementById('form-id');
  // Math.random() * 0xffffff
  form.submit();
}

function changeColor() {
  console.log('changeColor');
  const box = document.getElementById('box');
  const color = Hct.fromInt(Math.random() * 0xffffff);
  console.log(color);
  // const c = Math.random() * 0xffffff;
  const c = `#${color.hex}`;
  box.style.backgroundColor = c;
  console.log(box);
}


onMounted(() => {
  const openButton = document.getElementById('open');
  const closeButton = document.getElementById('close');
  const changeButton = document.getElementById('change');
  openButton.addEventListener('click', openDialog);
  closeButton.addEventListener('click', closeDialog);
  changeButton.addEventListener('click', changeColor);
});
</script>

<template>
  <div id="main">
    <div id="box">
    Box1
  </div>
  <md-outlined-button id="open">openDialog</md-outlined-button>
  <md-filled-button id="close">closeDialog</md-filled-button>
  <md-filled-button id="change">changeColor</md-filled-button>
  </div>
  
  <md-dialog id="dialog" type="alert">
    <div slot="headline">
      Dialog title
    </div>
    <form slot="content" id="form-id" method="dialog">
      <md-outlined-text-field label="Name" ></md-outlined-text-field>
    </form>
    <div slot="actions">
      <md-outlined-button form="form-id" @click="submit">Ok</md-outlined-button>
    </div>
  </md-dialog>
</template>

<style scoped>
#main {
  width: 30vw;
  height: 30vw;
  background-color: #db7c7c;
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
