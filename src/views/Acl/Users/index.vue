<template>
  <div>
    <el-card style="height: 80px">
      <el-form :inline="true" class="form">
        <el-form-item label="用户名:">
          <el-input v-model="keyword" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="default" :disabled="keyword ? false : true" @click="serach">搜索</el-button>
          <el-button type="default" size="default" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 10px">
      <el-button type="primary" size="default" @click="addUser">添加用户</el-button>
      <el-popconfirm width="200px" icon="Delete" title="你确定要批量删除?" @confirm="deleteSelectUser">
        <template #reference>
          <el-button type="danger" size="default" :disabled="selectIdArr.length ? false : true">批量删除</el-button>
        </template>
      </el-popconfirm>
      <!-- table展示用户信息 -->
      <el-table @selection-change="selectChange" v-loading="loading" border style="margin: 10px 0" :data="userArr">
        <el-table-column type="selection" align="center" width="80px"></el-table-column>
        <el-table-column type="index" label="序号" align="center" width="80px"></el-table-column>
        <el-table-column label="id" align="center" width="80px" prop="id" show-overflow-tooltip></el-table-column>
        <el-table-column label="用户名字" align="center" prop="username" show-overflow-tooltip></el-table-column>
        <el-table-column label="用户昵称" align="center" prop="name" show-overflow-tooltip></el-table-column>
        <el-table-column label="用户角色" align="center" prop="roleName" show-overflow-tooltip></el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip></el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" align="center" width="400px">
          <template #="{ row }">
            <el-button title="权限" type="primary" size="default" icon="User" @click="setRole(row)">分配角色</el-button>
            <el-button title="编辑" type="warning" size="default" icon="Edit" @click="updateUser(row)">编辑</el-button>
            <el-popconfirm width="200px" icon="Delete" :title="`你确定要删除${row.username}?`" @confirm="deleteUsers(row.id)">
              <template #reference>
                <el-button title="删除" type="danger" size="default" icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[5, 7, 9, 11]"
        :background="true" layout="prev, pager, next, jumper,->,sizes,total" :total="total" @change="getHasUser" />
    </el-card>
    <!-- 抽屉结构:完成添加新的用户账户|更新已有的账号信息 -->
    <el-drawer v-model="drawer" size="25%">
      <!-- 头部标题:将来文字内容应该是动态的 -->
      <template #header>
        <h4>{{ userParams.id ? '更新用户' : '添加用户' }}</h4>
      </template>
      <!-- 身体部分 -->
      <template #default>
        <el-form ref="formRef" :model="userParams" :rules="rules">
          <el-form-item label="用户姓名" prop="username">
            <el-input placeholder="请填写用户姓名" v-model.trim="userParams.username"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称" prop="name">
            <el-input placeholder="请填写用户昵称" v-model.trim="userParams.name"></el-input>
          </el-form-item>
          <el-form-item label="用户密码" prop="password" v-if="!userParams.id">
            <el-input placeholder="请填写用户密码" v-model.trim="userParams.password" type="password" show-password></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button type="default" size="default" @click="drawer = false">取消</el-button>
          <el-button type="primary" size="default" @click="save">确认</el-button>
        </div>
      </template>
    </el-drawer>
    <!-- 抽屉结构：用于某一个已有账号进行职位分配 -->
    <el-drawer v-model="drawer1" size="25%">
      <template #header>
        <h4>分配角色(职位)</h4>
      </template>
      <template #default>
        <el-form v-loading="load">
          <el-form-item label="用户姓名">
            <el-input v-model="userParams.username" disabled style="width: 300px;"></el-input>
          </el-form-item>
          <el-form-item label="角色列表">
            <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate"
              @change="handleCheckAllChange">全选</el-checkbox>
            <!-- 显示角色的复选框 -->
            <el-checkbox-group v-model="userRole" @change="handleCheckedRoleChange">
              <el-checkbox v-for="role in allRole" :key="role.id" :label="role" :value="role">
                {{ role.roleName }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button type="default" size="default" @click="drawer1 = false">取消</el-button>
          <el-button type="primary" size="default" @click="confirmClick">确认</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Users",
});
import { reqAddOrUpdateUser, reqAllRole, reqRemoveUser, reqSelectUser, reqSetUserRole, reqUserInfo } from "@/api/acl/user";
import type { AllRole, AllRoleResponseData, Records, SetRoleData, User, UserResponseData } from "@/api/acl/user/type";
import { ElMessage } from "element-plus";
import { nextTick, onMounted, reactive, ref } from "vue";
import useLayOutSettingStore from "@/stores/modules/setting";
import useUserStroe from "@/stores/modules/user";
let userStore = useUserStroe()
let currentUserName = ref<string>('')
let loading = ref<boolean>(false);
let load = ref<boolean>(false);
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
// 收集用户信息的响应式数据
let userParams = reactive<User>({
  username: '',
  name: '',
  password: ''
})
// 控制分配角色抽屉显示与隐藏
let drawer1 = ref<boolean>(false);
// 获取form组件实例
let formRef = ref()
// 收集顶部复选框全选数据
let checkAll = ref<boolean>(false)
// 设置顶部全选复选框不确定状态，仅负责样式控制
let isIndeterminate = ref<boolean>(true)
// 存储全部角色的数据
let allRole = ref<AllRole>([])
// 当前用户已有的角色
let userRole = ref<AllRole>([])
// 准备一个数组存储批量删除的用户ID
let selectIdArr = ref<User[]>([])
// 定义响应式数据:收集用户输入进来的关键字
let keyword = ref<string>('')
// 获取模板setting仓库
let settingStore = useLayOutSettingStore()
// 重置按钮
const reset = () => {
  settingStore.refresh = !settingStore.refresh
}
// 搜索按钮的回调 
const serach = () => {
  // 根据关键字获取相应的用户数据
  getHasUser()
  // 清空关键字
  keyword.value = ''
}
//  批量删除按钮的回调 
const deleteSelectUser = async () => {
  // 整理批量删除的参数
  let idsList: any = selectIdArr.value.map(item => {
    return item.id
  })
  try {
    loading.value = true
    // 批量删除的请求
    let result: any = await reqSelectUser(idsList)
    if (result.code == 200) {
      ElMessage({
        type: 'success',
        message: "删除成功"
      })
      loading.value = false
      getHasUser()
    } else {
      ElMessage({
        type: 'error',
        message: "删除失败"
      })
      loading.value = false
    }
  } catch (error) {
    loading.value = false
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  } 
}
// table复选框勾选时触发的事件
const selectChange = (value: any) => {
  selectIdArr.value = value
}
// 删除某一个用户
const deleteUsers = async (userId: number) => {
  try {
    loading.value = true
    let result: any = await reqRemoveUser(userId)
    if (result.code == 200) {
      ElMessage({
        type: 'success',
        message: "删除成功"
      })
      loading.value = false
      getHasUser()
    } else {
      ElMessage({
        type: 'error',
        message: "删除失败"
      })
      loading.value = false
    }
  } catch (error) {
    loading.value = false
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
}
// 确定按钮的回调
const confirmClick = async () => {
  // 收集参数
  let data: SetRoleData = {
    userId: (userParams.id as number),
    roleIdList: userRole.value.map(item => {
      return (item.id as number)
    })
  }
  try {// 关闭抽屉
    drawer1.value = false
    loading.value = true
    // 分配用户角色
    let result: any = await reqSetUserRole(data)
    if (result.code == 200) {
      // 提示信息
      ElMessage({
        type: 'success',
        message: '分配角色成功'
      })
      loading.value = false
      // 获取更新完毕后用户的信息
      getHasUser()
    } else {
      // 提示信息
      ElMessage({
        type: 'success',
        message: '分配角色失败'
      })
    }
  } catch (error) {
    loading.value = false
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
}
// 底部复选框change事件
const handleCheckedRoleChange = (value: string[]) => {
  // 已经勾选的选项长度
  const checkedCount = value.length
  // 顶部复选框的勾选数据
  checkAll.value = checkedCount === allRole.value.length
  // 顶部的复选框不确定的样式
  isIndeterminate.value = checkedCount > 0 && checkedCount < allRole.value.length
}
// 顶部全选复选框的change事件
const handleCheckAllChange = (val: boolean) => {
  // val:true(全选) | false(没有全选)
  userRole.value = val ? allRole.value : []
  // 不确定的样式(确定样式)
  isIndeterminate.value = false
}
// 分配角色按钮的回调
const setRole = async (row: User) => {
  // 抽屉显示出来
  drawer1.value = true
  // 存储已有的用户信息
  Object.assign(userParams, row)
  try {
    load.value = true
    // 获取全部角色的数据与当前用户已有的角色数据
    let result: AllRoleResponseData = await reqAllRole((userParams.id as number))
    if (result.code == 200) {
      // 存储全部的角色
      allRole.value = result.data.allRolesList
      // 存储当前用户已有的角色
      userRole.value = result.data.assignRoles
    }
    load.value = false
  } catch (error) {
    load.value = false
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
}
// 校验用户名字回调函数
const validatorUserName = (rule: any, value: any, callback: any) => {
  // 用户名字|昵称,长度至少5位,最长10位
  if (value.length >= 5 && value.length <= 10) {
    callback();
  } else {
    callback(new Error("用户姓名长度至少5位,最长10位"));
  }
};
const validatorName = (rule: any, value: any, callback: any) => {
  if (value.length >= 2 && value.length <= 10) {
    callback();
  } else {
    callback(new Error("用户昵称长度至少2位,最长10位"));
  }
};
const validatorPassword = (rule: any, value: any, callback: any) => {
  if (value.length >= 6 && value.length <= 15) {
    callback();
  } else {
    callback(new Error("密码长度至少6位,最长15位"));
  }
};
// 表单校验的规则对象
const rules = {
  // 用户名称
  username: [
    { required: true, trigger: "change", validator: validatorUserName }
  ],
  // 用户昵称
  name: [
    { required: true, trigger: "change", validator: validatorName }
  ],
  // 用户密码
  password: [
    { required: true, trigger: "change", validator: validatorPassword }
  ]
}
// 保存按钮的回调
const save = async () => {
  try {  // 点击保存按钮时，需要保证表单全部符合条件再发请求
    await formRef.value.validate()
    // 关闭抽屉
    drawer.value = false
    loading.value = true
    // 保存按钮：添加新的用户|更新已有的用户账号信息
    let result: any = await reqAddOrUpdateUser(userParams)
    // 添加或更新成功
    if (result.code == 200) {
      // 提示信息
      ElMessage({
        type: 'success',
        message: userParams.id ? '更新成功' : '添加成功'
      })
      loading.value = false
      // 获取最新的全部账号信息

      // 浏览器自动刷新一次
      if (userStore.username == currentUserName.value) {
        window.location.reload()
      } else {
        getHasUser()
      }
    } else {
      // 关闭抽屉
      drawer.value = false
      // 提示信息
      ElMessage({
        type: 'error',
        message: userParams.id ? '更新失败' : '添加失败'
      })
    }
  } catch (error) {
    loading.value = false
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
}
// 更新已有用户按钮的回调
// row:已有用户的账号信息
const updateUser = (row: User) => {
  currentUserName.value = (row.username as string)
  // 抽屉显示出来
  drawer.value = true;
  // 存储收集已有的账户信息
  Object.assign(userParams, row)
  nextTick(() => {
    formRef.value.clearValidate('username')
    formRef.value.clearValidate('name')
  })
};
// 添加用户按钮的回调
const addUser = () => {
  // 抽屉显示出来
  drawer.value = true;
  // 清空数据
  Object.assign(userParams, {
    id: 0,
    username: '',
    name: '',
    password: ''
  })
  // 清除上一次的错误校验提示信息
  nextTick(() => {
    formRef.value.resetFields()
  })
};
// 获取全部已有的用户信息
const getHasUser = async () => {
  try {
    loading.value = true;
    let result: UserResponseData = await reqUserInfo(pageNo.value, pageSize.value, keyword.value as string);
    // console.log(result)
    if (result.code == 200) {
      total.value = result.data.total;
      userArr.value = result.data.records;
      loading.value = false;
    }
  } catch (error) {
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
};
// 组件挂载完毕
onMounted(() => {
  getHasUser();
});
// 取消按钮的回调
// const cancel = () => {
//   // 关闭抽屉
//   drawer.value = false
// }
</script>

<style scoped>
.form {
  display: flex;
  justify-content: space-between;
}
</style>
