<template>
    <!-- 路由组件出口的位置 -->
    <RouterView v-slot="{ Component }">
        <transition name="fade">
            <!-- 渲染layout一级路由组件的子路由 -->
            <component :is="Component" v-if="flag"/>
        </transition>
    </RouterView>
</template>

<script setup lang="ts">
defineOptions({
    name: 'Main'
})
import useLayOutSettingStore from '@/stores/modules/setting';
import { watch,ref, nextTick } from 'vue';
let LayOutSettingStore = useLayOutSettingStore()

// 控制当前组件是否销毁重建
let flag = ref(true)
// 监听仓库内部数据是否发生变化，如果发生变化，说明用户点击过刷新按钮
watch(() => LayOutSettingStore.refresh,() => {
    // 点击刷新按钮:路由组件销毁
    flag.value = false
    nextTick(() => {
        flag.value = true
    })
})
</script>

<style scoped>
.fade-enter-from{
    transform: scale(0);
    opacity: 0;
    
}
.fade-enter-active{
    transition: all .3s;
}
.fade-enter-to{
    transform: scale(1);
    opacity: 1;
}
</style>