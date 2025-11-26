<template>
  <div>
    <el-card style="height: 80px">
      <el-form :inline="true" class="form">
        <el-form-item label="用户名:">
          <el-input placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="default">搜索</el-button>
          <el-button type="default" size="default">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 10px">
      <el-button type="primary" size="default" @click="addUser">添加</el-button>
      <el-button type="danger" size="default" :disabled="true"
        >批量删除</el-button
      >
      <!-- table展示用户信息 -->
      <el-table
        v-loading="loading"
        border
        style="margin: 10px 0"
        :data="userArr"
      >
        <el-table-column
          type="selection"
          align="center"
          width="80px"
        ></el-table-column>
        <el-table-column
          type="index"
          label="序号"
          align="center"
          width="80px"
        ></el-table-column>
        <el-table-column
          label="id"
          align="center"
          width="80px"
          prop="id"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="用户名字"
          align="center"
          prop="username"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="用户昵称"
          align="center"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="用户角色"
          align="center"
          prop="roleName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="更新时间"
          align="center"
          prop="updateTime"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="操作" align="center" width="400px">
          <template #="{ row }">
            <el-button title="权限" type="primary" size="default" icon="User"
              >分配角色</el-button
            >
            <el-button
              title="编辑"
              type="warning"
              size="default"
              icon="Edit"
              @click="updateUser(row)"
              >编辑</el-button
            >
            <el-button title="删除" type="danger" size="default" icon="Delete"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[5, 7, 9, 11]"
        :background="true"
        layout="prev, pager, next, jumper,->,sizes,total"
        :total="total"
        @change="getHasUser"
      />
    </el-card>
    <!-- 抽屉结构:完成添加新的用户账户|更新已有的账号信息 -->
    <el-drawer v-model="drawer">
      <!-- 头部标题:将来文字内容应该是动态的 -->
      <template #header>
        <h4>添加用户</h4>
      </template>
      <!-- 身体部分 -->
      <template #default>
        <el-form>
          <el-form-item label="用户姓名">
            <el-input placeholder="请填写用户姓名"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称">
            <el-input placeholder="请填写用户昵称"></el-input>
          </el-form-item>
          <el-form-item label="用户密码">
            <el-input
              placeholder="请填写用户密码"
              type="password"
              show-password
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button>取消</el-button>
          <el-button type="primary">确认</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Users",
});
import { reqUserInfo } from "@/api/acl/user";
import type { Records, User, UserResponseData } from "@/api/acl/user/type";
import { onMounted, ref } from "vue";
let loading = ref<boolean>(false);
// 默认页码
let pageNo = ref<number>(1);
// 一页展示几条数据
let pageSize = ref<number>(5);
// 用户的总个数
let total = ref<number>(0);
// 存储全部用户的数组
let userArr = ref<Records>([]);
// 定义响应式数据控制抽屉的显示与隐藏
let drawer = ref<boolean>(false);

// 更新已有用户按钮的回调
// row:已有用户的账号信息
const updateUser = (row: User) => {
  // 抽屉显示出来
  drawer.value = true;
};
// 添加用户按钮的回调
const addUser = () => {
  // 抽屉显示出来
  drawer.value = true;
};
// 获取全部已有的用户信息
const getHasUser = async () => {
  loading.value = true;
  let result: UserResponseData = await reqUserInfo(
    pageNo.value,
    pageSize.value,
  );
  if (result.code == 200) {
    total.value = result.data.total;
    userArr.value = result.data.records;
  }
  loading.value = false;
};
// 组件挂载完毕
onMounted(() => {
  getHasUser();
});
</script>

<style scoped>
.form {
  display: flex;
  justify-content: space-between;
}
</style>
