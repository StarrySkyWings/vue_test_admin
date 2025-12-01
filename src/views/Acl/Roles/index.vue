<template>
  <div>
    <el-card style="height: 80px">
      <el-form :inline="true" class="form">
        <el-form-item label="角色名称:">
          <el-input v-model="keyword" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="default"
            :disabled="keyword ? false : true"
            @click="serach"
            >搜索</el-button
          >
          <el-button type="default" size="default" @click="reset"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 10px">
      <el-button
        v-has="'btn.Role.add'"
        type="primary"
        size="default"
        icon="Plus"
        @click="addRole"
        >添加角色</el-button
      >
      <el-table
        v-loading="loading"
        border
        :data="allRole"
        style="margin: 10px 0"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="80px"
        ></el-table-column>
        <el-table-column
          label="id"
          align="center"
          prop="id"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="角色名称"
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
            <!-- row:已有的角色对象 -->
            <el-button
              type="primary"
              size="default"
              icon="User"
              @click="setPermission(row)"
              v-has="'btn.Role.assgin'"
              >分配权限</el-button
            >
            <el-button
              type="warning"
              size="default"
              icon="Edit"
              @click="updateRole(row)"
              v-has="'btn.Role.update'"
              >编辑</el-button
            >
            <el-popconfirm
              width="200px"
              icon="Delete"
              :title="`你确定要删除${row.roleName}?`"
              @confirm="removeRole(row.id)"
            >
              <template #reference>
                <el-button
                  title="删除"
                  type="danger"
                  size="default"
                  icon="Delete"
                  v-has="'btn.Role.remove'"
                  >删除</el-button
                >
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 40]"
        :background="true"
        layout="prev, pager, next, jumper,->,sizes,total"
        :total="total"
        @change="getHasRole"
      />
    </el-card>
    <!-- 添加角色与更新已有角色的结构 -->
    <el-dialog
      v-model="dialogVisible"
      :title="roleParams.id ? '更新角色' : '添加角色'"
      destroy-on-close
    >
      <el-form ref="formRef" :model="roleParams" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            placeholder="请输入角色名称"
            v-model.trim="roleParams.roleName"
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
            >确定</el-button
          >
        </div>
      </template>
    </el-dialog>
    <!-- 抽屉组件:分配角色的菜单权限与按钮的权限 -->
    <el-drawer v-model="drawer" size="25%" destroy-on-close>
      <template #header>
        <h4>分配权限</h4>
      </template>
      <template #default>
        <!-- 树形控件 -->
        <el-tree
          ref="tree"
          v-loading="load"
          style="max-width: 600px"
          :data="menuArr"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="selectArr"
          :props="defaultProps"
        />
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawer = false">取消</el-button>
          <el-button type="primary" @click="confirm">确认</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Roles",
});
import {
  reqAddOrUpdateRole,
  reqAllMenuList,
  reqAllRoleList,
  reqRemoveRole,
  reqSetPermisstion,
} from "@/api/acl/role";
import type {
  MenuList,
  MenuResponseData,
  Records,
  RoleData,
  RoleResponseData,
} from "@/api/acl/role/type";
import useLayOutSettingStore from "@/stores/modules/setting";
import { ElMessage } from "element-plus";
import { nextTick, onMounted, reactive, ref } from "vue";
import useUserStroe from "@/stores/modules/user";
let userStore = useUserStroe();
let currentRole = ref<string>("");
let loading = ref<boolean>(false);
let load = ref<boolean>(false);
// 当前页码
let pageNo = ref<number>(1);
// 一页展示几条数据
let pageSize = ref<number>(10);
// 角色的总个数
let total = ref<number>(0);
// 搜索角色的关键字
let keyword = ref<string>("");
// 获取模板setting仓库
let settingStore = useLayOutSettingStore();
// 存储已有的全部角色
let allRole = ref<Records>([]);
// 控制对话框的显示与隐藏
let dialogVisible = ref<boolean>(false);
// 收集新增角色的数据
let roleParams = reactive<RoleData>({
  roleName: "",
});
// 获取form组件实例
let formRef = ref<any>();
// 控制抽屉显示与隐藏
let drawer = ref<boolean>(false);
// 树形控件的配置数据
const defaultProps = {
  children: "children",
  label: "name",
};
// 获取树形控件的实例
let tree = ref<any>();

// 删除已有的角色
const removeRole = async (id: number) => {
  try {
    loading.value = true;
    let result: any = await reqRemoveRole(id);
    if (result.code == 200) {
      ElMessage({
        type: "success",
        message: "删除角色成功",
      });
      loading.value = false;
      getHasRole();
    } else {
      ElMessage({
        type: "error",
        message: "删除角色失败",
      });
      loading.value = false;
    }
  } catch (error) {
    loading.value = false;
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
};
// 抽屉确定按钮的回调
const confirm = async () => {
  // 抽屉隐藏出来
  drawer.value = false;
  // 角色id
  const roleId = roleParams.id as number;
  // 选中节点的id
  let arr = tree.value.getCheckedKeys();
  // 半选的id
  let arr1 = tree.value.getHalfCheckedKeys();
  let permissionId = arr.concat(arr1);
  try {
    loading.value = true;
    // 下发权限
    let result: any = await reqSetPermisstion(roleId, permissionId);
    if (result.code == 200) {
      // 提示信息
      ElMessage({
        type: "success",
        message: "分配权限成功",
      });
      loading.value = false;
      // 浏览器自动刷新一次
      if (userStore.roles.includes(currentRole.value)) {
        window.location.reload();
      } else {
        getHasRole();
      }
    } else {
      ElMessage({
        type: "error",
        message: "分配权限失败",
      });
      loading.value = false;
    }
  } catch (error) {
    console.log(error);
    loading.value = false;
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
    // console.log(error)
  }
};
// 存储用户权限的数据
let menuArr = ref<MenuList>([]);
// 准备一个数组：数组用于存储勾选的节点ID(四级)
let selectArr = ref<number[]>([]);
// 递归过滤id数组
const filterSelectArr = (allData: any, initArr: any) => {
  allData.forEach((item: any) => {
    // if(item.select && item.level == 4){
    //   initArr.push(item.id)
    // }
    // if(item.children && item.children.length > 0){
    //   filterSelectArr(item.children,initArr)
    // }
    if (item.select) {
      if (item.children instanceof Array && item.children.length > 0) {
        initArr.push(...filterSelectArr(item.children, []));
      } else {
        initArr.push(item.id);
      }
    }
  });
  return initArr;
};
// 分配权限按钮的回调
const setPermission = async (row: RoleData) => {
  currentRole.value = row.roleName;
  // 抽屉显示出来
  drawer.value = true;
  // 收集当前要分配权限的角色数据
  Object.assign(roleParams, row);
  try {
    // 根据角色获取权限的数据
    load.value = true;
    let result: MenuResponseData = await reqAllMenuList(
      roleParams.id as number,
    );
    if (result.code == 200) {
      menuArr.value = result.data;
      selectArr.value = filterSelectArr(menuArr.value, []);
    }
    load.value = false;
  } catch (error) {
    // console.error('操作失败:', error)
    load.value = false;
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
  }
};
// 确定按钮的回调
const save = async () => {
  try {
    // 表单校验结果,结果通过再发请求、结果不通过不发请求
    await formRef.value.validate();
    // 对话框关闭
    dialogVisible.value = false;
    loading.value = true;
    // 添加角色|更新角色的请求
    let result: any = await reqAddOrUpdateRole(roleParams);
    if (result.code == 200) {
      // 提示信息
      ElMessage({
        type: "success",
        message: roleParams.id ? "更新角色成功" : "添加角色成功",
      });
      loading.value = false;
      // 再次获取全部的已有角色
      getHasRole();
    } else {
      ElMessage({
        type: "error",
        message: roleParams.id ? "更新角色失败" : "添加角色失败",
      });
      loading.value = false;
    }
  } catch (error) {
    // console.log(error)
    loading.value = false;
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
};
// 自定义校验规则的回调
const validatorRoleName = (rule: any, value: any, callback: any) => {
  if (value.length >= 2 && value.length <= 10) {
    callback();
  } else {
    callback(new Error("角色长度至少2位,最长10位"));
  }
};
// 角色校验规则
const rules = {
  roleName: [
    { required: true, trigger: "change", validator: validatorRoleName },
  ],
};
// 更新已有角色按钮的回调
const updateRole = (row: RoleData) => {
  // 对话框显示出来
  dialogVisible.value = true;
  Object.assign(roleParams, row);
};
// 添加角色按钮的回调
const addRole = () => {
  // 对话框显示出来
  dialogVisible.value = true;
  // 清空数据
  Object.assign(roleParams, {
    roleName: "",
    id: 0,
  });
  // 清空上一次表单校验结果
  // nextTick(() => {
  //   formRef.value.resetFields()
  // });
};
// 重置按钮
const reset = () => {
  settingStore.refresh = !settingStore.refresh;
};
// 搜索按钮的回调
const serach = () => {
  // 根据关键字获取相应的用户数据
  getHasRole();
  // 清空关键字
  keyword.value = "";
};
// 获取全部角色信息的方法
const getHasRole = async () => {
  try {
    loading.value = true;
    let result: RoleResponseData = await reqAllRoleList(
      pageNo.value,
      pageSize.value,
      keyword.value,
    );
    if (result.code == 200) {
      total.value = result.data.total;
      allRole.value = result.data.records;
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
  getHasRole();
});
</script>

<style scoped>
.form {
  display: flex;
  justify-content: space-between;
}
</style>
