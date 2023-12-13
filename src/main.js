import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import io from 'socket.io-client';
const socket = io('http://localhost:3000');

const app = createApp(App);

// 提供 socket 实例
app.provide('socket', socket);

app.mount('#app');
