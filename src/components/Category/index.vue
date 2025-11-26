<template>
  <el-card>
    <el-form :inline="true">
      <el-form-item label="一级分类">
        <el-select
          :loading="categoryStore.loading"
          v-model="categoryStore.c1Id"
          style="width: 220px"
          @change="handler"
          :disabled="scene == 0 ? false : true"
        >
          <!-- option:label即为显示文字 value属性即为select下拉菜单收集的数据-->
          <el-option
            v-for="(c1, index) in categoryStore.c1Arr"
            :key="c1.id"
            :label="c1.name"
            :value="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <!-- <el-select v-model="categoryStore.c2Id" style="width: 220px" @change="handler1"
                    :disabled="scene == 0 ? false : true || !categoryStore.c1Id"> -->
        <el-select
          :loading="categoryStore.loading"
          v-model="categoryStore.c2Id"
          style="width: 220px"
          @change="handler1"
          :disabled="scene != 0 || !categoryStore.c1Id"
        >
          <el-option
            v-for="(c2, index) in categoryStore.c2Arr"
            :key="c2.id"
            :label="c2.name"
            :value="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <!-- <el-select v-model="categoryStore.c3Id" style="width: 220px" :disabled="scene == 0 ? false : true || !categoryStore.c2Id"> -->
        <el-select
          :loading="categoryStore.loading"
          v-model="categoryStore.c3Id"
          style="width: 220px"
          :disabled="scene != 0 || !categoryStore.c2Id"
        >
          <el-option
            v-for="(c3, index) in categoryStore.c3Arr"
            :key="c3.id"
            :label="c3.name"
            :value="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
defineOptions({
  name: "Category",
});
// 引入生命周期函数钩子
import { onMounted } from "vue";
// 引入分类相关的仓库
import useCategoryStore from "@/stores/modules/category";
let categoryStore = useCategoryStore();

// 通知仓库获取一级分类的方法
const getC1 = () => {
  // 通知分类仓库发请求获取一级分类的数据
  categoryStore.getC1();
};

// 此方法即为一级分类下拉菜单的change事件(选中值时会触发,保证一级分类ID有了)
const handler = () => {
  // 需要将二级、三级分类的数据清空
  categoryStore.c2Id = "";
  categoryStore.c3Arr = [];
  categoryStore.c3Id = "";
  // 通知仓库获取二级分类的数据
  categoryStore.getC2();
};

// 此方法即为二级分类下拉菜单的change事件(选中值时会触发,保证二级分类ID有了)
const handler1 = () => {
  // 需要将三级分类的数据清空
  categoryStore.c3Id = "";
  // 通知仓库获取二级分类的数据
  categoryStore.getC3();
};

// 分类全局组件挂载完毕，通知仓库发请求获取一级分类的数据
onMounted(() => {
  // 获取一级分类的数据
  getC1();
});

// 接收父组件传递过来的scene
defineProps(["scene"]);
</script>

<style scoped></style>
