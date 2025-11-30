<template>
  <div>
    <el-card>
      <!-- <div class="box">
        <img :src="userStore.avatar" alt="" class="avatar">
        <div class="bottom">
          <h3 class="title">{{ getTime() }}好,{{ userStore.username }}</h3>
          <p class="subtitle">甄选运营平台</p>
        </div>
      </div> -->
      <div class="welcome">
        <el-avatar
          :size="100"
          :src="
            userStore.avatar ||
            'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
          "
        ></el-avatar>
        <div class="welcome-right">
          <el-text style="font-size: var(--el-font-size-extra-large)" tag="b"
            >欢迎回来～{{ userStore.username }}</el-text
          >
          <el-text tag="b" size="large">甄选运营平台</el-text>
        </div>
      </div>
    </el-card>
    <div class="welcome-img">
      <svg-icon name="welcome" width="50vw" height="50vh"></svg-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Home",
});
// 引入用户相关的仓库,获取当前用户的头像、昵称
import useUserStroe from "@/stores/modules/user";
// import { getTime } from '@/utils/time';
// 获取存储用户信息的仓库对象
let userStore = useUserStroe();
</script>

<style scoped lang="scss">
// .box {
//   display: flex;

//   .avatar {
//     width: 100px;
//     height: 100px;
//     border-radius: 50%;
//   }

//   .bottom {
//     margin-left: 20px;

//     .title {
//       font-size: 30px;
//       font-weight: 900;
//       margin-bottom: 30px;
//     }

//     .subtitle {
//       font-style: italic;
//       color: bisque
//     }
//   }
// }
// .svg{
//   display: flex;
//   justify-content: center;
// }
.welcome {
  display: flex;

  .welcome-right {
    margin-left: var(--el-card-padding);
    display: flex;
    flex-flow: column;
    justify-content: space-evenly;
    align-items: flex-start;
  }
}

.welcome-img {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
</style>
