<template>
  <el-button size="small" icon="Refresh" circle @click="updateRefresh"></el-button>
  <el-button size="small" icon="FullScreen" circle @click="fullScreen"></el-button>
  <el-button size="small" icon="Setting" circle @click="drawer = true"></el-button>
  <img :src="userStore.avatar" style="width: 24px; height: 24px; margin: 0 10px; border-radius: 50%" />
  <!-- 下拉菜单 -->
  <el-dropdown>
    <span class="el-dropdown-link">
      {{ userStore.username }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <!-- 抽屉：设置主题颜色 -->
  <teleport to='body'>
    <el-drawer v-model="drawer" size="25%">
      <template #header>
        <h4>主题设置</h4>
      </template>
      <template #default>
        <!-- 表单元素 -->
        <el-form label-width="auto">
          <el-form-item label="主题颜色">
            <el-color-picker @change="setColor" style="margin-left: 50px" v-model="color" show-alpha
              :predefine="predefineColors" size="large" />
          </el-form-item>
          <el-form-item label="暗黑模式">
            <el-switch @change="changeDark" style="margin-left: 50px" v-model="dark" size="large" inline-prompt
              active-icon="Moon" inactive-icon="Sunny" />
          </el-form-item>
        </el-form>
      </template>
    </el-drawer>
  </teleport>
</template>

<script setup lang="ts">
defineOptions({
  name: "Setting",
});
// 获取骨架的小仓库
import useLayOutSettingStore from "@/stores/modules/setting";
// 获取用户相关的小仓库
import useUserStroe from "@/stores/modules/user";
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
// 获取路由器对象
let $router = useRouter();
// 获取路由对象
let $route = useRoute();
let userStore = useUserStroe();
let LayOutSettingStore = useLayOutSettingStore();
// 控制抽屉的显示
let drawer = ref<boolean>(false)
// 收集开关的数据
let dark = ref<boolean>(false)
// 颜色组件需要的数据、
const color = ref('rgba(255, 69, 0, 0.68)')
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])

// 主题颜色的设置 
const setColor = () => {
  // 通知js修改根节点的样式对象的属性与属性值
  let html = document.documentElement
  // 设置 css 变量
  html.style.setProperty('--el-color-primary', color.value)
}
// switch开关的change事件进行暗黑模式的切换
const changeDark = () => {
  // 获取HTML根节点
  let html = document.documentElement
  // 判断HTML标签是否有类名dark
  dark.value ? html.className = 'dark' : html.className = ''
}
// 刷新按钮点击回调
const updateRefresh = () => {
  LayOutSettingStore.refresh = !LayOutSettingStore.refresh;
};
// 全屏按钮点击的回调
const fullScreen = () => {
  // DOM对象的一个属性：可以用来判断当前是不是全屏模式[全屏:true,不是全屏:false]
  let full = document.fullscreenElement;
  // 切换为全屏模式
  if (!full) {
    // 文档根节点的方法requestFullscreen,实现全屏模式
    document.documentElement.requestFullscreen();
  } else {
    // 变为不是全屏模式 -> 退出全屏模式
    document.exitFullscreen();
  }
};
// 退出登录点击回调
const logout = async () => {
  // 第一件事情：需要向服务器发请求[退出登录接口]
  // 第二件事情：仓库当中关于用户相关的数据清空[token|username|avatar]
  // 第三件事情：跳转到登录页面
  await userStore.userLogout();
  // 跳转到登录页面
  $router.push({ path: "/login", query: { redirect: $route.path } });
};


</script>

<style scoped></style>
