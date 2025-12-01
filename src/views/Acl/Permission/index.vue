<template>
  <div>
    <el-table
      v-loading="loading"
      :data="permissionArr"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
    >
      <el-table-column label="名称" prop="name"></el-table-column>
      <el-table-column label="权限值" prop="code"></el-table-column>
      <el-table-column label="修改时间" prop="updateTime"></el-table-column>
      <el-table-column label="操作">
        <template #="{ row }">
          <!-- row:即为已有的菜单对象|按钮的对象数据 -->
          <!-- <el-button type="primary" size="default" :disabled="row.level == 4 ? true:false">{{ row.level == 3 ? '添加功能' : '添加菜单' }}</el-button> -->
          <el-button
            @click="addPermission(row)"
            type="primary"
            size="default"
            v-if="row.level !== 4"
            v-has="'btn.Permission.add'"
            >{{ getButtonText(row.level) }}</el-button
          >
          <el-button
            @click="updatePermission(row)"
            type="warning"
            size="default"
            v-if="row.level !== 1"
            v-has="'btn.Permission.update'"
            >编辑</el-button
          >
          <el-popconfirm
            width="200px"
            icon="Delete"
            :title="`你确定要删除${row.name}?`"
            @confirm="removeMenu(row)"
          >
            <template #reference>
              <el-button v-has="'btn.Permission.remove'" type="danger" size="default" v-if="row.level !== 1"
                >删除</el-button
              >
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框组件：添加或更新已有菜单的数据结构 -->
    <el-dialog
      v-model="dialogVisible"
      :title="menuData.id ? '更新' : '添加'"
      width="500"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="menuData"
        :rules="rules"
        label-width="auto"
      >
        <!-- 表单组件：收集新增与已有的菜单数据 -->
        <el-form-item label="名称" prop="name">
          <el-input
            v-model.trim="menuData.name"
            placeholder="请输入名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="权限值" prop="code">
          <el-input
            v-model.trim="menuData.code"
            placeholder="请输入权限值"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="default"
            size="default"
            @click="dialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" size="default" @click="save"
            >确认</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "PermissionMenu",
});
// 引入获取菜单请求API
import {
  reqAddOrUpdateMenu,
  reqAllPermisstion,
  reqRemoveMenu,
} from "@/api/acl/menu";
// 引入ts类型
import type {
  MenuParams,
  Permission,
  PermissionList,
  PermissionResponseData,
} from "@/api/acl/menu/type";
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import useUserStroe from "@/stores/modules/user";
let userStore = useUserStroe();
let loading = ref<boolean>(false);
let currentRoutes = ref<string>("");
// 存储菜单的数据
let permissionArr = ref<PermissionList>([]);
// 控制对话框的显示与隐藏
let dialogVisible = ref<boolean>(false);
// 携带的参数
let menuData = reactive<MenuParams>({
  code: "",
  level: 0,
  name: "",
  pid: 0,
});
// 获取form组件实例
let formRef = ref();
// 表单校验规则
const codePattern = /^[a-zA-Z]{2,8}$/;
const validatorName = (rule: any, value: any, callback: any) => {
  if (value.length >= 2 && value.length <= 10) {
    callback();
  } else {
    callback(new Error("名称长度至少2位,最长10位"));
  }
};
const validatorCode = (rule: any, value: any, callback: any) => {
  if (codePattern.test(value)) {
    callback();
  } else {
    callback(new Error("只能包含英文,且长度至少2位,最长8位"));
  }
};
const rules = {
  name: [{ required: true, trigger: "change", validator: validatorName }],
  code: [{ required: true, trigger: "change", validator: validatorCode }],
};

// 删除按钮的回调
const removeMenu = async (row: Permission) => {
  currentRoutes.value = row.code as string;
  try {
    loading.value = true;
    let result: any = await reqRemoveMenu(row.id as number);
    if (result.code == 200) {
      ElMessage({
        type: "success",
        message: "删除成功",
      });
      loading.value = false;
      if (userStore.routes.includes(currentRoutes.value)) {
        window.location.reload();
      } else {
        // 再次获取全部最新的菜单数据
        getHasPermission();
      }
      // getHasPermission()
    } else {
      ElMessage({
        type: "error",
        message: "删除失败",
      });
      loading.value = false;
    }
  } catch (error) {
    loading.value = false;
    // console.log(error)
  }
};
// 确定按钮的回调
const save = async () => {
  try {
    // 表单校验结果,结果通过再发请求、结果不通过不发请求
    await formRef.value.validate();
    // 对话框隐藏
    dialogVisible.value = false;
    loading.value = true;
    // 发请求：新增子菜单|更新某一个已有的菜单数据
    currentRoutes.value = menuData.code;
    let result: any = await reqAddOrUpdateMenu(menuData);
    if (result.code == 200) {
      // 提示信息
      ElMessage({
        type: "success",
        message: menuData.id ? "更新成功" : "添加成功",
      });
      loading.value = false;
      // 浏览器自动刷新一次
      if (userStore.routes.includes(currentRoutes.value)) {
        window.location.reload();
      } else {
        // 再次获取全部最新的菜单数据
        getHasPermission();
      }
    }
  } catch (error) {
    loading.value = false;
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
};
// 编辑已有菜单
const updatePermission = (row: Permission) => {
  currentRoutes.value = row.code as string;
  // console.log(row)
  // 对话框显示出来
  dialogVisible.value = true;
  // 点击修改按钮：收集已有的菜单数据进行更新
  Object.assign(menuData, row);
};
// 添加菜单按钮的回调
const addPermission = (row: Permission) => {
  // console.log(row)
  // 对话框显示出来
  dialogVisible.value = true;
  Object.assign(menuData, {
    id: 0,
    code: "",
    level: 0,
    name: "",
    pid: 0,
  });
  // 收集新增菜单的level数值
  menuData.level = row.level + 1;
  // 给谁新增子菜单
  menuData.pid = row.id as number;
  // nextTick(() => {
  //   formRef.value.resetFields();
  // });
};
// 获取菜单数据的方法
const getHasPermission = async () => {
  try {
    loading.value = true;
    let result: PermissionResponseData = await reqAllPermisstion();
    if (result.code == 200) {
      permissionArr.value = result.data;
    }
    loading.value = false;
  } catch (error) {
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  } finally {
    loading.value = false;
  }
};
// 组件挂载完毕
onMounted(() => {
  getHasPermission();
});
// 根据level获取按钮文字
const getButtonText = (level: number): string => {
  switch (level) {
    case 1:
      return "添加菜单";
    case 2:
      return "添加模块";
    case 3:
      return "添加功能";
    default:
      return "";
  }
};
</script>

<style scoped></style>
