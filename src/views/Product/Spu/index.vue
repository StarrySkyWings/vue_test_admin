<template>
  <div>
    <!-- 三级分类 -->
    <Category :scene="scene"></Category>
    <el-card style="margin: 10px 0">
      <!-- v-if或v-show:都可以实现显示与隐藏 -->
      <div v-show="scene == 0">
        <el-button @click="addSpu" type="primary" size="default" icon="Plus"
          :disabled="categoryStore.c3Id ? false : true">添加SPU</el-button>
        <!-- 展示已有的SPU数据 -->
        <el-table v-loading="loading" border style="margin: 10px 0" :data="records">
          <el-table-column width="80px" label="序号" type="index" align="center"></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"></el-table-column>
          <el-table-column label="SPU描述" prop="description"></el-table-column>
          <el-table-column label="操作">
            <template #="{ row, $index }">
              <el-button type="primary" size="default" icon="Plus" title="添加SKU" @click="addSku(row)"></el-button>
              <el-button type="success" size="default" icon="View" title="查看SKU列表" @click="findSku(row)"></el-button>
              <el-button type="warning" size="default" icon="Edit" title="修改SPU" @click="updateSpu(row)"></el-button>
              <el-popconfirm icon="Delete" :title="`你确定要删除${row.spuName}?`" width="180px" @confirm="deleteSpu(row)">
                <template #reference>
                  <el-button type="danger" size="default" icon="Delete" title="删除SPU"></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[3, 5, 7, 9]"
          :background="true" layout="prev, pager, next, jumper,->,sizes,total" :total="total" @change="getHasSpu" />
      </div>
      <!-- 添加SPU|修改SPU子组件 -->
      <SpuForm ref="spu" v-show="scene == 1" @changeScene="changeScene"></SpuForm>
      <!-- 添加SKU的子组件 -->
      <SkuForm ref="sku" v-show="scene == 2" @changeScene="changeScene"></SkuForm>
      <!-- dialog对话框：展示已有的SKU数据 -->
      <el-dialog v-model="show" title="SKU列表">
        <el-table border :data="skuArr" v-loading="load">
          <el-table-column label="SKU名称" prop="skuName"></el-table-column>
          <el-table-column label="SKU价格" prop="price"></el-table-column>
          <el-table-column label="SKU重量" prop="weight"></el-table-column>
          <el-table-column label="SKU图片">
            <template #="{ row }">
              <!-- <img :src="row.skuDefaultImg" style="width: 100px;height: 100px;"> -->
              <!-- 添加预览功能的图片 -->
              <el-image style="width: 100px; height: 100px" :src="row.skuDefaultImg"
                :preview-src-list="[row.skuDefaultImg]" fit="contain" hide-on-click-modal :preview-teleported="true">
                <template #error>
                  <div class="image-slot">
                    <el-icon>
                      <Picture />
                    </el-icon>
                    <div>加载失败</div>
                  </div>
                </template>
                <template #placeholder>
                  <div class="image-slot">
                    <el-icon class="is-loading">
                      <Loading />
                    </el-icon>
                    <div>加载中...</div>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Spu",
});
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
// 引入分类的仓库
import useCategoryStore from "@/stores/modules/category";
import { reqHasSpu, reqRemoveSpu, reqSkuList } from "@/api/product/spu";
import type {
  HasSpuResponseData,
  Records,
  SkuData,
  SkuInfoData,
  SpuData,
} from "@/api/product/spu/type";
// 引入子组件
import SpuForm from "./components/SpuForm.vue";
import SkuForm from "./components/SkuForm.vue";
import { ElMessage } from "element-plus";
let loading = ref<boolean>(false);
let load = ref<boolean>(false);
let categoryStore = useCategoryStore();
// 场景的数据
let scene = ref<number>(0); //0:显示已有SPU  1:添加或修改已有SPU  2:添加SKU的结构
// 分页器默认页码
let pageNo = ref<number>(1);
// 每一页展示几条数据
let pageSize = ref<number>(3);
// 存储已有SPU的数据
let records = ref<Records>([]);
// 存储已有SPU的总个数
let total = ref<number>(0);
// 获取子组件实例SpuForm
let spu = ref<any>();
// 获取子组件实例SkuForm
let sku = ref<any>();
// 存储全部的SKU数据
let skuArr = ref<SkuData[]>([]);
let show = ref<boolean>(false);
// 监听三级分类ID变化
watch(
  () => categoryStore.c3Id,
  () => {
    // 务必保证有三级分类ID
    if (!categoryStore.c3Id) return;
    getHasSpu();
  },
);
// 此方法执行：可以获取某一个三级分类下全部的已有SPU
const getHasSpu = async () => {
  loading.value = true;
  let result: HasSpuResponseData = await reqHasSpu(
    pageNo.value,
    pageSize.value,
    categoryStore.c3Id,
  );
  // console.log(result)
  if (result.code == 200) {
    records.value = result.data.records;
    total.value = result.data.total;
  }
  loading.value = false;
};
// 添加新的SPU按钮的回调
const addSpu = () => {
  // 切换为场景1：添加或修改已有SPU结构 -> SpuForm
  scene.value = 1;
  // 点击添加SPU按钮，调用子组件的方法初始化数据
  spu.value.initAddSpu(categoryStore.c3Id);

  nextTick(() => {
    spu.value.resetFields();
  });
};
// 子组件SpuForm绑定自定义事件，让子组件通知父组件切换场景为0
const changeScene = (num: number) => {
  // 子组件SpuForm点击取消变为场景0:展示已有的SPU
  scene.value = num;
  // 再次获取全部已有的SPU
  getHasSpu();
};
// 修改已有的SPU按钮的回调
const updateSpu = (row: SpuData) => {
  // 切换为场景1：添加或修改已有SPU结构 -> SpuForm
  scene.value = 1;
  // 调用子组件实例方法获取完整已有的SPU数据
  spu.value.initHasSpuData(row);
};

// 添加SKU按钮的回调
const addSku = (row: SpuData) => {
  // 点击添加SKU按钮切换场景为2
  scene.value = 2;
  // 调用子组件的方法初始化添加SKU数据
  sku.value.initSkuData(categoryStore.c1Id, categoryStore.c2Id, row);
  nextTick(() => {
    sku.value.clearValidate(["skuName", "skuDesc"]);
  });
};

const findSku = async (row: SpuData) => {
  // 对话框显示出来
  show.value = true;
  load.value = true;
  let result: SkuInfoData = await reqSkuList(row.id as number);
  // console.log(result)
  if (result.code == 200) {
    skuArr.value = result.data;
    load.value = false;
  }
};

// 删除已有的SPU按钮回调
const deleteSpu = async (row: SpuData) => {
  loading.value = true;
  let result: any = await reqRemoveSpu(row.id as number);
  if (result.code == 200) {
    ElMessage({
      type: "success",
      message: "删除成功",
    });
    loading.value = false;
    // 获取剩余的SPU数据
    getHasSpu();
  } else {
    ElMessage({
      type: "error",
      message: "删除失败",
    });
    loading.value = false;
  }
};

// 路由组件销毁时，把仓库分类相应的数据清空
onBeforeUnmount(() => {
  // 清空仓库的数据
  categoryStore.$reset();
});
</script>

<style scoped>
/* 图片加载状态样式 */
.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.image-slot .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}
</style>
