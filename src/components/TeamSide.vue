<script setup>
import { ref, onMounted, inject } from 'vue'

const prop = defineProps({
    arr: Array,
    selfName: String,
    selfColor: String,
})

const socket = inject('socket');



const selfState = ref(false);

function ready() {
    selfState.value = !selfState.value;
    if(selfState.value) {
        socket.emit('ready');
    }else{
        socket.emit('cancelReady');
    }
    // console.log(prop.arr);
}

onMounted(() => {
    console.log('TeamSide');
    // console.log(prop.arr);
})
</script>

<template>
    <div class="team">
        <div class="left" style="float: left;">
            <div class="user"> 蓝方 </div>
            <div v-for="u in arr.slice(0, 5)" :style="`background-color: ${(u.color && !u.state) ? '#fff' : u.color};`" class="user">
                {{ u.name }}
            </div>
        </div>

        <div class="right" style="float: right;">
            <div class="user"> 红方 </div>
            <div v-for="u in arr.slice(5, 10)" class="user">
                {{ u.name }}
            </div>
        </div>
    </div>
    <md-filled-button id="ready" @click="ready">{{ selfState ? "取消准备" : "准备" }}</md-filled-button>
</template>

<style scoped>
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
