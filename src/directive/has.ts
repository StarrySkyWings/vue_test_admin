import pinia from "@/stores";
import useUserStroe from "@/stores/modules/user";
// 获取对应的用户仓库
let userStore = useUserStroe(pinia);
export const isHasButton = (app: any) => {
  // 全局自定义指令：实现按钮的权限
  app.directive("has", {
    // 代表使用这个全局自定义指令的DOM|组件挂载完毕时会执行一次
    mounted(el: any, options: any) {
      //自定义指令右侧的数值:如果在用户信息buttons数组当中没有,删除该按钮
      if (!userStore.buttons.includes(options.value)) {
        // el.disabled = true; // 设置禁用
        el.remove();
      }
    },
  });
};
