<template>
  <el-card>
    <el-table v-loading="loading" border style="margin: 10px 0px" :data="skuArr">
      <el-table-column label="序号" type="index" align="center" width="80px"></el-table-column>
      <el-table-column label="名称" width="250px" prop="skuName"></el-table-column>
      <el-table-column label="描述" width="250px" prop="skuDesc"></el-table-column>
      <el-table-column label="默认图片" width="250px">
        <template #="{ row }">
          <img :src="row.skuDefaultImg" alt="" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column label="重量(g)" width="250px" prop="weight"></el-table-column>
      <el-table-column label="价格(元)" width="250px" prop="price"></el-table-column>
      <el-table-column label="操作" width="300px" fixed="right">
        <template #="{ row }">
          <el-button title="状态改变" v-has="'btn.Sku.updown'" :loading="row.load"
            :type="row.isSale === 1 ? 'primary' : 'info'" size="default" :icon="row.isSale === 1 ? 'Bottom' : 'Top'"
            @click="updateSale(row)"></el-button>
          <el-button title="查看" v-has="'btn.Sku.detail'" type="success" size="default" icon="View"
            @click="findSku(row)"></el-button>
          <el-button title="编辑" v-has="'btn.Sku.update'" type="warning" size="default" icon="Edit" @click="updateSku">
          </el-button>
          <el-popconfirm width="180px" :title="`你确定要删除${row.skuName}`" @confirm="removeSku(row.id)">
            <template #reference>
              <el-button v-has="'btn.Sku.remove'" type="danger" size="default" icon="Delete" title="删除"></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 40]"
      :background="true" layout="prev, pager, next, jumper,->,sizes,total" :total="total" @change="getHasSku" />
    <!-- 抽屉组件：展示商品详情 -->
    <el-drawer v-model="drawer" size="40%">
      <!-- 标题部分 -->
      <template #header>
        <h4>商品详情</h4>
      </template>
      <template #default>
        <el-form v-loading="load" label-width="auto">
          <el-form-item label="商品名称">
            <el-text>{{ skuInfo.skuName }}</el-text>
          </el-form-item>
          <el-form-item label="商品描述">
            <el-text>{{ skuInfo.skuDesc }}</el-text>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-text>{{ skuInfo.price }}</el-text>
          </el-form-item>
          <el-form-item label="品牌属性">
            <div v-if="
              skuInfo.skuAttrValueList instanceof Array &&
              skuInfo.skuAttrValueList.length > 0
            ">
              <el-tag type="danger" v-for="item in skuInfo.skuAttrValueList" :key="item.id" style="margin: 5px">
                {{ item.valueName }}
              </el-tag>
            </div>
            <div v-else>
              <el-tag type="info">无属性</el-tag>
            </div>
          </el-form-item>
          <el-form-item label="销售属性">
            <div v-if="
              skuInfo.skuSaleAttrValueList instanceof Array &&
              skuInfo.skuSaleAttrValueList.length > 0
            ">
              <el-tag type="success" v-for="item in skuInfo.skuSaleAttrValueList" style="margin: 5px">
                {{ item.saleAttrValueName }}
              </el-tag>
            </div>
            <div v-else>
              <el-tag type="info">无属性</el-tag>
            </div>
          </el-form-item>
          <el-form-item label="商品图片">
            <el-carousel v-if="
              skuInfo.skuImageList instanceof Array &&
              skuInfo.skuImageList.length > 0
            " type="card" style="width: 100%">
              <el-carousel-item class="banner" v-for="item in skuInfo.skuImageList" :key="item.id">
                <img :src="item.imgUrl" style="width: 80%; height: 80%" />
                <!-- <el-image :src="item.imgUrl" fit="contain"></el-image> -->
              </el-carousel-item>
            </el-carousel>
            <el-empty v-else description="无图片" />
          </el-form-item>
        </el-form>
        <!-- <el-row style="margin: 10px 0px;">
          <el-col :span="6">名称</el-col>
          <el-col :span="18">{{skuInfo.skuName}}</el-col>
        </el-row>
        <el-row style="margin: 10px 0px;">
          <el-col :span="6">描述</el-col>
          <el-col :span="18">{{skuInfo.skuDesc}}</el-col>
        </el-row>
        <el-row style="margin: 10px 0px;">
          <el-col :span="6">价格</el-col>
          <el-col :span="18">{{skuInfo.price}}</el-col>
        </el-row>
        <el-row style="margin: 10px 0px;">
          <el-col :span="6">品牌属性</el-col>
          <el-col :span="18">
            <el-tag type="danger" v-for="item in skuInfo.skuAttrValueList" :key="item.id" style="margin:5px;">
              {{ item.valueName }}
            </el-tag>
          </el-col>
        </el-row>
        <el-row style="margin: 10px 0px;">
          <el-col :span="6">销售属性</el-col>
          <el-col :span="18">
            <el-tag type="success" v-for="item in skuInfo.skuSaleAttrValueList" style="margin:5px;">
              {{ item.saleAttrValueName }}
            </el-tag>
          </el-col>
        </el-row>
        <el-row style="margin: 10px 0px;">
          <el-col :span="6">商品图片</el-col>
          <el-col :span="18">
            <el-carousel :interval="4000" type="card" height="200px">
              <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
                <img :src="item.imgUrl" style="width:100%;height: 100%;">
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row> -->
      </template>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
defineOptions({
  name: "Sku",
});
import type {
  SkuResponseData,
  SkuData,
  SkuInfoData,
} from "@/api/product/sku/type";
// 引入请求
import {
  reqCancelSale,
  reqRemoveSku,
  reqSaleSku,
  reqSkuInfo,
  reqSkuList,
} from "@/api/product/sku";
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
let loading = ref<boolean>(false);
let load = ref<boolean>(false);
// 分页器当前页码
let pageNo = ref<number>(1);
// 每一页展示几条数据
let pageSize = ref<number>(10);
let total = ref<number>(0);
let skuArr = ref<SkuData[]>([]);
// 控制抽屉显示与隐藏的字段
let drawer = ref<boolean>(false);
let skuInfo = ref<any>({});

// 删除某一个已有的商品
const removeSku = async (id: number) => {
  loading.value = true;
  // 删除某一个已有商品的请求
  let result: any = await reqRemoveSku(id);
  if (result.code == 200) {
    // 提示信息
    ElMessage({
      type: "success",
      message: "删除成功",
    });
    loading.value = false;
    // 获取已有的全部商品
    getHasSku();
  } else {
    // 提示信息
    ElMessage({
      type: "error",
      message: "删除失败",
    });
    loading.value = false;
  }
};
// 查看商品详情按钮的回调
const findSku = async (row: SkuData) => {
  // 抽屉展示出来
  drawer.value = true;
  // 获取已有商品详情数据
  load.value = true;
  let result: SkuInfoData = await reqSkuInfo(row.id as number);
  if (result.code == 200) {
    // 存储已有的SKU
    skuInfo.value = result.data;
  }
  load.value = false;
};
// 更新已有的SKU
const updateSku = () => {
  ElMessage({
    type: "success",
    message: "更新中.....",
  });
};
// 商品的上架与下架的操作
const updateSale = async (row: SkuData) => {
  row.load = true;
  // 如果当前商品的isSale==1,说明当前商品是上架的状态 -> 更新为下架
  // 否则else情况与上面情况相反
  if (row.isSale == 1) {
    // 下架操作
    await reqCancelSale(row.id as number);
    // 提示信息
    ElMessage({
      type: "success",
      message: "下架成功",
    });
    row.load = false;
    // 发请求获取当前更新完毕的全部已有的SKU
    getHasSku();
  } else {
    // 上架操作
    await reqSaleSku(row.id as number);
    // 提示信息
    ElMessage({
      type: "success",
      message: "上架成功",
    });
    row.load = false;
    // 发请求获取当前更新完毕的全部已有的SKU
    getHasSku();
  }
};
const getHasSku = async () => {
  loading.value = true;
  let result: SkuResponseData = await reqSkuList(pageNo.value, pageSize.value);
  if (result.code == 200) {
    total.value = result.data.total;
    skuArr.value = result.data.records;
  }
  loading.value = false;
};
// 组件挂载完毕
onMounted(() => {
  getHasSku();
});
</script>

<style scoped>
.el-tag {
  margin-right: 5px;
}

.banner:nth-child(2n) {
  background-color: #99a9bf;
}

.banner:nth-child(2n + 1) {
  background-color: #d3dce6;
}

.banner {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
