<template>
  <el-form
    v-loading="load"
    label-width="100px"
    ref="formRef"
    :model="SpuParams"
    :rules="rules"
  >
    <el-form-item label="SPU名称" prop="spuName">
      <el-input
        v-model.trim="SpuParams.spuName"
        style="width: 240px"
        placeholder="请输入SPU名称"
      ></el-input>
    </el-form-item>
    <el-form-item label="SPU品牌" prop="tmId">
      <el-select
        :loading="loading"
        v-model="SpuParams.tmId"
        placeholder="请选择品牌"
        style="width: 240px"
      >
        <el-option
          v-for="item in AllTrademark"
          :key="item.id"
          :label="item.tmName"
          :value="item.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述" prop="description">
      <el-input
        v-model.trim="SpuParams.description"
        placeholder="请输入SPU描述"
        style="width: 240px"
        type="textarea"
      ></el-input>
    </el-form-item>
    <el-form-item label="SPU图片">
      <!-- 
                v-model:fileList -> 展示默认图片 
                action:上传图片的接口地址
            -->
      <el-upload
        v-model:file-list="imgList"
        :headers="headers"
        action="/api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :before-upload="handlerUpload"
      >
        <el-icon>
          <Plus />
        </el-icon>
      </el-upload>
      <el-dialog v-model="dialogVisible">
        <img
          w-full
          :src="dialogImageUrl"
          alt="预览图片"
          style="width: 100%; height: 100%"
        />
      </el-dialog>
    </el-form-item>
    <el-form-item label="SPU销售属性">
      <!-- 展示销售属性的下拉菜单 -->
      <el-select
        v-model="saleAttrIdAndValueName"
        :placeholder="
          unSelectSaleAttr.length
            ? `剩余个${unSelectSaleAttr.length}参数可选`
            : `暂无数据可选`
        "
        style="width: 240px"
      >
        <el-option
          :value="`${item.id}:${item.name}`"
          v-for="item in unSelectSaleAttr"
          :key="item.id"
          :label="item.name"
        ></el-option>
      </el-select>
      <el-button
        @click="addSaleAttr"
        :disabled="saleAttrIdAndValueName ? false : true"
        style="margin-left: 10px"
        type="primary"
        size="default"
        icon="Plus"
        >添加销售属性</el-button
      >
      <!-- table展示销售属性与属性值的地方 -->
      <el-table
        border
        style="margin: 10px 0"
        :data="saleAttr"
        v-loading="loading"
      >
        <el-table-column
          width="80px"
          label="序号"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column
          width="120px"
          label="销售属性名"
          prop="saleAttrName"
        ></el-table-column>
        <el-table-column label="销售属性值">
          <!-- row:即为当前SPU已有的销售属性对象 -->
          <template v-slot="{ row }">
            <el-tag
              style="margin: 5px"
              @close="row.spuSaleAttrValueList.splice(index, 1)"
              v-for="(item, index) in row.spuSaleAttrValueList"
              :key="item.id"
              closable
            >
              {{ item.saleAttrValueName }}
            </el-tag>
            <el-input
              :ref="(vc: any) => (row.inputArr = vc)"
              @blur="toLook(row)"
              v-model="row.saleAttrValue"
              v-if="row.flag == true"
              style="width: 100px; margin: 5px"
            ></el-input>
            <el-button
              v-else
              @click="toEdit(row)"
              style="margin: 5px"
              size="small"
            >
              + 新标签
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ $index }">
            <el-button
              type="danger"
              size="small"
              icon="Delete"
              @click="saleAttr.splice($index, 1)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button
        :disabled="saleAttr.length > 0 ? false : true"
        type="primary"
        size="default"
        @click="save"
        >保存</el-button
      >
      <el-button type="default" size="default" @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import {
  reqAddOrUpdateSpu,
  reqAllSaleAttr,
  reqAllTradeMark,
  reqSpuHasSaleAttr,
  reqSpuImageList,
} from "@/api/product/spu";
import type {
  AllTradeMark,
  HasSaleAttr,
  HasSaleAttrResponseData,
  SaleAttr,
  SaleAttrResponseData,
  SaleAttrValue,
  SpuData,
  SpuHasImg,
  SpuImage,
  Trademark,
} from "@/api/product/spu/type";
import { ElMessage } from "element-plus";
import { computed, ref, nextTick, reactive } from "vue";
import useUserStroe from "@/stores/modules/user";
let userStore = useUserStroe();
let headers = { Token: userStore.token };
let loading = ref<boolean>(false);
let load = ref<boolean>(false);
defineOptions({
  name: "SpuForm",
});
let formRef = ref();
let rules = reactive({
  spuName: [
    { required: true, message: "请输入SKU名称", trigger: "blur" },
    { min: 2, max: 8, message: "长度应该是2到8", trigger: "change" },
  ],
  tmId: [{ required: true, message: "请选择SPU品牌", trigger: "change" }],
  description: [{ required: true, message: "请输入SPU描述", trigger: "blur" }],
});
let $emit = defineEmits(["changeScene"]);
// 点击取消按钮:通知父组件切换场景值为0,展示已有SPU的数据
const cancel = () => {
  $emit("changeScene", 0);
};
// 存储已有的SPU数据
let AllTrademark = ref<Trademark[]>([]);
// 商品图片
let imgList = ref<SpuImage[]>([]);
// 已有的SPU销售属性
let saleAttr = ref<SaleAttr[]>([]);
// 全部的销售属性
let allSaleAttr = ref<HasSaleAttr[]>([]);
// 存储已有的SPU对象
let SpuParams = ref<SpuData>({
  category3Id: "", //收集三级分类的ID
  spuName: "", //SPU的名字
  description: "", //SPU的描述
  tmId: "", //品牌的ID
  spuImageList: [],
  spuSaleAttrList: [],
});
// 控制对话框的显示与隐藏
let dialogVisible = ref<boolean>(false);
// 存储预览图片地址
let dialogImageUrl = ref<string>("");
// 收集还未选择的销售属性ID与属性值名称
let saleAttrIdAndValueName = ref<string>("");
// 计算出当前SPU还未拥有的销售属性
let unSelectSaleAttr = computed(() => {
  // 全部销售属性：颜色、版本、尺码
  // 已有的销售属性：颜色、版本
  let unSelectArr = allSaleAttr.value.filter((item) => {
    return saleAttr.value.every((item1) => {
      return item.name != item1.saleAttrName;
    });
  });
  return unSelectArr;
});

// 子组件书写一个方法
const initHasSpuData = async (spu: SpuData) => {
  loading.value = true;
  // 存储已有的SPU对象，将来在模板下展示
  SpuParams.value = spu;
  // spu:即为父组件传递过来的已有SPU对象[不完整]
  // 获取全部品牌的数据
  let result: AllTradeMark = await reqAllTradeMark();
  // 获取某一个品牌旗下全部售卖商品的图片
  let result1: SpuHasImg = await reqSpuImageList(spu.id as number);
  // 获取已有的SPU销售属性的数据
  let result2: SaleAttrResponseData = await reqSpuHasSaleAttr(spu.id as number);
  // 获取整个项目全部SPU的销售属性
  let result3: HasSaleAttrResponseData = await reqAllSaleAttr();

  // 存储全部品牌的数据
  AllTrademark.value = result.data;

  // SPU对应商品图片
  imgList.value = result1.data.map((item) => {
    return {
      name: item.imgName,
      url: item.imgUrl,
    };
  });
  // 存储已有的SPU销售属性
  saleAttr.value = result2.data;
  // 存储全部的销售属性
  allSaleAttr.value = result3.data;
  loading.value = false;
};
// 照片墙点击预览按钮时触发的钩子
const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url;
  // 对话框弹出
  dialogVisible.value = true;
};
// 照片墙删除文件的钩子
// const handleRemove = () => {}
// 照片墙上传成功之前的钩子：约束文件的大小与类型
const handlerUpload = (file: any) => {
  if (
    file.type == "image/png" ||
    file.type == "image/jpeg" ||
    file.type == "image/gif"
  ) {
    if (file.size / 1024 / 1024 < 3) {
      return true;
    } else {
      ElMessage({
        type: "error",
        message: "上传文件大小必须小于3M",
      });
      return false;
    }
  } else {
    ElMessage({
      type: "error",
      message: "上传文件格式需要为PNG、JPG、GIF",
    });
    return false;
  }
};
// 添加销售属性的方法
const addSaleAttr = () => {
  /* 
        baseSaleAttrId: number;
        spuSaleAttrValueList:[]
        saleAttrName: string;
    */
  const [baseSaleAttrId, saleAttrName] =
    saleAttrIdAndValueName.value.split(":");
  // 确保分割后的值存在
  if (!baseSaleAttrId || !saleAttrName) return;

  // 准备一个新的销售属性对象：将来带给服务器即可
  let newSaleAttr: SaleAttr = {
    baseSaleAttrId: Number(baseSaleAttrId),
    saleAttrName,
    spuSaleAttrValueList: [],
  };
  // 追加到数组当中
  saleAttr.value.push(newSaleAttr);
  // 清空收集的数组
  saleAttrIdAndValueName.value = "";
};
// 属性值按钮的点击事件
const toEdit = (row: SaleAttr) => {
  // 点击按钮时，input组件就出来了 -> 编辑模式
  row.flag = true;
  row.saleAttrValue = "";

  nextTick(() => {
    row.inputArr?.focus();
  });
};
// 表单元素失去焦点的事件回调
const toLook = (row: SaleAttr) => {
  // 整理收集的属性ID与属性值的名字
  const { baseSaleAttrId, saleAttrValue } = row;
  // 整理成服务器需要的属性值形式
  let newSaleAttrValue: SaleAttrValue = {
    baseSaleAttrId,
    saleAttrValueName: saleAttrValue as string,
  };

  // 非法情况判断
  if ((saleAttrValue as string).trim() == "") {
    ElMessage({
      type: "warning",
      message: "属性值不能为空!",
    });
    // return
    row.flag = false;
    return;
  }
  // 判断属性值是否在数组中存在
  let repeat = row.spuSaleAttrValueList.find((item) => {
    return item.saleAttrValueName == saleAttrValue;
  });
  if (repeat) {
    ElMessage({
      type: "warning",
      message: "属性值重复!",
    });
    return;
  }

  // 追加新的属性值对象
  row.spuSaleAttrValueList.push(newSaleAttrValue);

  // 切换为查看模式
  row.flag = false;
};
// 保存按钮的回调
const save = async () => {
  try {
    // 验证必填项
    await formRef.value.validate();

    // 整理参数
    // 1.照片墙的数组
    SpuParams.value.spuImageList = imgList.value.map((item: any) => {
      return {
        imgName: item.name, //图片的名字
        imgUrl: (item.response && item.response.data) || item.url,
      };
    });
    // 2.整理销售属性的数据
    SpuParams.value.spuSaleAttrList = saleAttr.value;
    // 发请求：添加SPU|更新已有的SPU
    load.value = true;
    let result = await reqAddOrUpdateSpu(SpuParams.value);
    if (result.code == 200) {
      // 成功
      ElMessage({
        type: "success",
        message: SpuParams.value.id ? "更新成功" : "添加成功",
      });
      // 通知父组件切换场景为0
      $emit("changeScene", 0);
    } else {
      // 失败
      ElMessage({
        type: "error",
        message: SpuParams.value.id ? "更新失败" : "添加失败",
      });
    }
    load.value = false;
  } catch (error) {
    // 简单处理：只对明确的网络错误进行提示
    // 表单校验错误由 Element Plus 自动处理，不需要额外提示
    // console.error('操作失败:', error)
  }
};

// 添加一个新的SPU初始化请求方法
const initAddSpu = async (c3Id: number | string) => {
  loading.value = true;
  // 清空数据
  SpuParams.value = {
    category3Id: "", //收集三级分类的ID
    spuName: "", //SPU的名字
    description: "", //SPU的描述
    tmId: "", //品牌的ID
    spuImageList: [],
    spuSaleAttrList: [],
  };
  // 清空照片
  imgList.value = [];
  saleAttr.value = [];
  saleAttrIdAndValueName.value = "";
  // 存储三级分类的ID
  SpuParams.value.category3Id = c3Id;
  // 获取全部品牌的数据
  let result: AllTradeMark = await reqAllTradeMark();
  // 获取整个项目全部SPU的销售属性
  let result1: HasSaleAttrResponseData = await reqAllSaleAttr();
  // 存储数据
  AllTrademark.value = result.data;
  allSaleAttr.value = result1.data;
  loading.value = false;
};

const resetFields = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};
// 对外暴露
defineExpose({ initHasSpuData, initAddSpu, resetFields });
</script>

<style scoped></style>
