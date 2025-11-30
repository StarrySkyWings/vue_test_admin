<template>
    <div class="tops">
        <div class="top-left">
            <span class="left-btn" @click="goHome">首页</span>
        </div>
        <div class="top-center">
            <div class="title">智慧旅游可视化大数据平台</div>
        </div>
        <div class="top-right">
            <span class="right-btn">统计报告</span>
            <span class="time">当前时间：{{ currentTime }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'Top'
})
// 点击首页按钮回到首页
import { useRouter } from 'vue-router';
import moment from 'moment';
import { onBeforeMount, onMounted, ref } from 'vue'
// 获取路由器对象
let $router = useRouter()
// 记录计时器
let timer: number = 0;
// 存储当前时间
const currentTime = ref(moment().format('YYYY年MM月DD日 HH:mm:ss'));
// 按钮的点击回调
const goHome = () => {
    $router.push('/home')
}
onMounted(() => {
    setInterval(() => {
        timer = setInterval(() => {
            currentTime.value = moment().format('YYYY年MM月DD日 HH:mm:ss');
        }, 1000);
    })
})
onBeforeMount(() => {
    clearInterval(timer);
})
</script>

<style scoped lang="scss">
.tops {
    width: 100%;
    height: 40px;
    display: flex;

    .top-left {
        flex: 1.5;
        background: url('../../images/dataScreen-header-left-bg.png') no-repeat;
        background-size: cover;

        .left-btn {
            width: 150px;
            height: 40px;
            float: right;
            background: url('../../images/dataScreen-header-btn-bg-l.png') no-repeat;
            background-size: cover;
            text-align: center;
            color: #29fcff;
            line-height: 40px;
            font-size: 20px;
        }
    }

    .top-center {
        flex: 2;

        .title {
            width: 100%;
            height: 74px;
            background: url('../../images/dataScreen-header-center-bg.png') no-repeat;
            background-size: cover;
            color: #29fcff;
            text-align: center;
            line-height: 74px;
            font-size: 30px;
        }
    }

    .top-right {
        flex: 1.5;
        background-image: url('../../images/dataScreen-header-right-bg.png');
        background-size: cover;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .right-btn {
            width: 150px;
            height: 40px;
            background-image: url('../../images/dataScreen-header-btn-bg-r.png');
            background-size: cover;
            text-align: center;
            color: #29fcff;
            line-height: 40px;
            font-size: 20px;
        }

        .time {
            color: #29fcff;
            font-size: 20px;
            margin-right: 10px;
        }
    }
}
</style>