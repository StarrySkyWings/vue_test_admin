<template>
  <el-form
    v-loading="load"
    label-width="100px"
    ref="formRef"
    :model="skuParams"
    :rules="rules"
  >
    <el-form-item label="SKU名称" prop="skuName">
      <el-input
        v-model.trim="skuParams.skuName"
        style="width: 240px"
        placeholder="请输入SKU名称"
      ></el-input>
    </el-form-item>
    <el-form-item label="价格(元)">
      <el-input-number
        :min="0"
        :max="99999"
        v-model="skuParams.price"
        style="width: 240px"
        controls-position="right"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="重量(g)">
      <el-input-number
        :min="0"
        :max="99999"
        v-model="skuParams.weight"
        style="width: 240px"
        controls-position="right"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="SKU描述" prop="skuDesc">
      <el-input
        v-model.trim="skuParams.skuDesc"
        type="textarea"
        placeholder="请输入SKU描述"
        style="width: 240px"
      ></el-input>
    </el-form-item>
    <el-form-item label="品牌属性">
      <el-form :inline="true" v-loading="loading" label-width="100px">
        <el-form-item
          v-for="(item, index) in attrArr"
          :key="item.id"
          :label="item.attrName"
        >
          <el-select
            v-model="item.attrIdAndValueId"
            placeholder="请选择"
            style="width: 240px; margin-top: 5px"
          >
            <el-option
              :value="`${item.id}:${attrValue.id}`"
              v-for="(attrValue, index) in item.attrValueList"
              :key="attrValue.id"
              :label="attrValue.valueName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-form :inline="true" v-loading="loading" label-width="100px">
        <el-form-item
          :label="item.saleAttrName"
          v-for="(item, index) in saleAttr"
          :key="item.id"
        >
          <el-select
            v-model="item.saleIdAndValueId"
            placeholder="请选择"
            style="width: 240px"
          >
            <el-option
              :value="`${item.id}:${saleValue.id}`"
              v-for="saleValue in item.spuSaleAttrValueList"
              :key="saleValue.id"
              :label="saleValue.saleAttrValueName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>
    <el-form-item label="图片名称">
      <el-table v-loading="loading" ref="table" border :data="imgArr">
        <el-table-column
          type="index"
          label="序号"
          width="80px"
          align="center"
        ></el-table-column>
        <el-table-column label="图片" align="center">
          <template #="{ row, $index }">
            <!-- <img :src="row.imgUrl" style="width: 100px;height: 100px;"> -->
            <!-- 添加预览功能的图片 -->
            <el-image
              style="width: 100px; height: 100px"
              :src="row.imgUrl"
              :preview-src-list="[row.imgUrl]"
              fit="contain"
              hide-on-click-modal
              :preview-teleported="true"
            >
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
        <el-table-column
          label="名称"
          align="center"
          prop="imgName"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template #="{ row }">
            <el-button
              type="warning"
              size="default"
              :disabled="skuParams.skuDefaultImg == row.imgUrl"
              @click="handlers(row)"
              >设置默认</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="default" @click="save">保存</el-button>
      <el-button type="default" size="default" @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
defineOptions({
  name: "SkuForm",
});
// 引入请求API
import { reqAttr } from "@/api/product/attr";
import type { AttrList, AttrResponseData } from "@/api/product/attr/type";
import {
  reqSpuImageList,
  reqSpuHasSaleAttr,
  reqAddSku,
} from "@/api/product/spu";
import type {
  SaleAttr,
  SaleAttrResponseData,
  SkuData,
  SpuHasImg,
  SpuImage,
} from "@/api/product/spu/type";
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
let loading = ref<boolean>(false);
let load = ref<boolean>(false);

// 品牌属性
let attrArr = ref<AttrList>([]);
// 销售属性
let saleAttr = ref<SaleAttr[]>([]);
// 照片墙数据
let imgArr = ref<SpuImage[]>([]);
// 收集SKU的参数
let skuParams = reactive<SkuData>({
  // 父组件传递过来的数据
  category3Id: "", //三级分类的ID
  spuId: "", //已有的SPU的ID
  tmId: "", //SPU品牌的ID
  // v-model收集
  skuName: "", //sku名字
  price: 0, //sku价格
  weight: 0, //sku重量
  skuDesc: "", //sku的描述
  skuAttrValueList: [
    //品牌属性的收集
    // {
    //     attrId:'', //品牌属性的ID
    //     valueId:'' //属性值的ID
    // }
  ],
  skuSaleAttrValueList: [
    //销售属性
    // {
    //     saleAttrId:'', // 属性ID
    //     saleAttrValueId:'' // 属性值的ID
    // }
  ],
  skuDefaultImg: "", //sku图片地址
});
// 获取form组件实例
let formRef = ref<any>();
let rules = reactive({
  skuName: [
    { required: true, message: "请输入名称", trigger: "blur" },
    { min: 2, max: 8, message: "长度需要是2到8", trigger: "blur" },
  ],
  skuDesc: [{ required: true, message: "请输入描述", trigger: "blur" }],
});
// 当前子组件的方法对外暴露
const initSkuData = async (
  c1Id: number | string,
  c2Id: number | string,
  spu: any,
) => {
  loading.value = true;
  // 收集数据
  skuParams.category3Id = spu.category3Id;
  skuParams.spuId = spu.id;
  skuParams.tmId = spu.tmId;
  // 获取平台属性
  let result: AttrResponseData = await reqAttr(c1Id, c2Id, spu.category3Id);
  // 获取对应的销售属性
  let result1: SaleAttrResponseData = await reqSpuHasSaleAttr(spu.id);
  // 获取照片墙的数据
  let result2: SpuHasImg = await reqSpuImageList(spu.id);
  // 品牌属性
  attrArr.value = result.data;
  // 销售属性
  saleAttr.value = result1.data;
  // 图片
  imgArr.value = result2.data;
  loading.value = false;
};
// 设置默认图片的方法回调
const handlers = (row: any) => {
  // 点击时,全部复选框不勾选
  // imgArr.value.forEach(item => {
  //     table.value.toggleRowSelection(item,false)
  // })
  // console.log(table.value)
  // 选中的图片才勾选
  // table.value.toggleRowSelection(row,false)
  // 收集图片地址
  skuParams.skuDefaultImg = row.imgUrl;
};

//  保存按钮的方法
const save = async () => {
  try {
    // 验证必填项
    await formRef.value.validate();
    // 整理参数
    // 品牌属性
    skuParams.skuAttrValueList = attrArr.value.reduce(
      (prev: any, next: any) => {
        if (next.attrIdAndValueId) {
          let [attrId, valueId] = next.attrIdAndValueId.split(":");
          // console.log(attrId,valueId)
          prev.push({
            attrId,
            valueId,
          });
          return prev;
        }
      },
      [],
    );
    // 销售属性
    skuParams.skuSaleAttrValueList = saleAttr.value.reduce(
      (prev: any, next: any) => {
        if (next.saleIdAndValueId) {
          let [saleAttrId, saleAttrValueId] = next.saleIdAndValueId.split(":");
          prev.push({
            saleAttrId,
            saleAttrValueId,
          });
        }
        return prev;
      },
      [],
    );
    load.value = true;
    // 添加SKU的请求
    let result: any = await reqAddSku(skuParams);
    if (result.code == 200) {
      ElMessage({
        type: "success",
        message: "添加SKU成功",
      });
      // 通知父组件切换场景为0
      $emit("changeScene", 0);
    } else {
      ElMessage({
        type: "error",
        message: "添加SKU失败",
      });
    }
    load.value = false;
  } catch (error) {
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
};

// 自定义事件的方法
let $emit = defineEmits(["changeScene"]);
// 取消按钮的回调
const cancel = () => {
  $emit("changeScene", 0);
};

const clearValidate = (fields?: string | string[]) => {
  if (formRef.value) {
    formRef.value.clearValidate(fields);
  }
};
defineExpose({ initSkuData, clearValidate });
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
