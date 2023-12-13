<script setup>
import { ref, onMounted, inject } from 'vue'

const prop = defineProps({
    arr: Array,
    selfName: String,
    selfColor: String,
})

const socket = inject('socket');



const selfState = ref(false);



onMounted(() => {
    console.log('TeamSide');
    // console.log(prop.arr);
})
</script>

<template>
    
</template>

<style scoped>

</style>
