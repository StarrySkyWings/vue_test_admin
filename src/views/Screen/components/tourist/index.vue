<template>
    <div class="center-tourist">
        <div class="tourist-top">
            <p class="title">实时游客统计</p>
            <p class="bg"></p>
            <p class="right">
                可预约总量
                <span>999900</span>
                人
            </p>
        </div>
        <div class="number">
            <span v-for="(item, idx) in people + '人'" :key="idx">
                {{ item }}
            </span>
        </div>
        <!-- 装echarts展示图形图标的节点 -->
        <div class="charts" ref="theCharts"></div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'Tourist'
})
import * as echarts from 'echarts';
// 水球图拓展插件
import 'echarts-liquidfill';
import { onMounted, ref } from 'vue';
let people = ref<number>(262144);
// 获取节点
let theCharts = ref()
onMounted(() => {
    // 获取echarts类的实例
    let mycharts = echarts.init(theCharts.value)
    // 设置实例的配置项
    mycharts.setOption({
        // 标题组件
        // title: {
        //     text: '水球图'
        // },
        // x|y轴组件
        // xAxis:{},
        // yAxis:{},
        // 系列：决定你展示什么样的图形图标
        series: [
            {
                type: 'liquidFill',
                data: [0.25, 0.25, 0.25], // 多少个数字水球里就有几道波浪，数值是波浪的平均位置
                radius: '85%',
            },
            // {
            //     type:'bar',
            //     data:[10,20,30,40]
            // }
        ],
        // 布局组件
        // grid:{
        //     left:0,
        //     right:0,
        //     top:0,
        //     bottom:0
        // }
    })


})
</script>

<style scoped lang="scss">
.center-tourist {
    background-image: url('../../images/dataScreen-main-lb.png');
    background-size: 100% 100%;
    margin-top: 10px;

    .tourist-top {
        padding: 18px;

        .title {
            color: white;
            font-size: 20px;
        }

        .bg {
            width: 68px;
            height: 7px;
            background-image: url('../../images/dataScreen-title.png');
            background-size: 100% 100%;
            margin-top: 10px;
        }

        .right {
            float: right;
            color: #fff;
            font-size: 20px;

            span {
                color: yellowgreen;
            }
        }
    }

    .tourist-top::after {
        content: '';
        display: block;
        clear: both;
    }

    .number {
        display: flex;
        // margin-top: 20px;
        padding: 10px;

        span {
            flex: 1;
            height: 55px;
            background-image: url('../../images/total.png');
            background-size: 100% 100%;
            text-align: center;
            line-height: 55px;
            font-size: 40px;
            color: #29fcff;
            font-weight: bold;
            margin: 0 2px;
        }
    }

    .charts {
        width: 100%;
        height: 200px;
        // background-color: orange;
    }
}
</style>