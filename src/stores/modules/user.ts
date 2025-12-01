// 创建用户相关的小仓库
import { defineStore } from "pinia";
// 引入接口
import { reqLogin, reqUserInfo, reqLogout } from "@/api/user";
// 引入数据类型
import type {
  loginFormData,
  loginResponseData,
  userInfoReponseData,
} from "@/api/user/type";
import type { UserState } from "./types/type";
// 引入操作本地存储的工具方法
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from "@/utils/token";
// 引入路由(常量路由)
import { constantRoute, asyncRoute, anyRoute } from "@/router/routes";
import router from "@/router";
// 引入深拷贝方法
import cloneDeep from "lodash/cloneDeep";

// 用于过滤当前用户需要展示的异步路由
function filterAsyncRoute(asyncRoute: any, routes: any) {
  return asyncRoute.filter((item: any) => {
    if (routes.includes(item.name)) {
      if (item.children && item.children.length > 0) {
        item.children = filterAsyncRoute(item.children, routes);
      }
      return true;
    }
  });
}

// 动态添加路由的方法
function addRoutes(routes: any[]) {
  routes.forEach((route: any) => {
    // 检查路由是否已经存在
    if (!router.hasRoute(route.name)) {
      router.addRoute(route);

      // 如果路由有子路由，递归添加
      if (route.children && route.children.length > 0) {
        // 注意：这里不需要再添加子路由，因为父路由添加时会包含子路由
        // 但需要确保子路由的路径是相对于父路由的
        route.children.forEach((child: any) => {
          if (child.path && !child.path.startsWith("/")) {
            // 确保子路由路径是相对的
            child.path = child.path.replace(/^\//, "");
          }
        });
      }
    }
  });
}

// 创建用户小仓库
let useUserStroe = defineStore("User", {
  // 小仓库存储数据地方
  state: (): UserState => {
    return {
      token: GET_TOKEN(), // 用户唯一标识token
      menuRoutes: constantRoute, // 仓库存储生成菜单需要数组(路由)
      username: "",
      avatar: "",
      roles: [],
      routes: [],
      buttons: [],
    };
  },
  // 异步|逻辑的地方
  actions: {
    // 用户登录的方法
    async userLogin(data: loginFormData) {
      // 登录请求
      let result: loginResponseData = await reqLogin(data);
      // 登录请求：成功200 -> token
      // 登录请求：失败201 -> 登录失败错误的信息
      if (result.code == 200) {
        // pinia仓库存储一下token
        // 由于pinia|vuex存储数据其实是利用js对象
        this.token = result.data as string;
        // 本地存储持久化存储一份
        SET_TOKEN(result.data as string);
        // 能保证当前async函数返回一个成功的promise
        return "ok";
      } else {
        return Promise.reject(new Error(result.data));
      }
    },
    // 获取用户信息方法
    async userInfo() {
      // 获取用户信息进行存储仓库当中[用户头像、名字]
      let result: userInfoReponseData = await reqUserInfo();
      // 如果获取用户信息成功，存储一下用户信息
      if (result.code == 200) {
        this.username = result.data.name;
        this.avatar = result.data.avatar;
        this.roles = result.data.roles;
        this.routes = result.data.routes;
        this.buttons = result.data.buttons
        // 计算当前用户需要展示的异步路由
        let userAsyncRoutes = filterAsyncRoute(
          cloneDeep(asyncRoute),
          result.data.routes
        );
        // 菜单的数据
        // this.menuRoutes = [...constantRoute,...userAsyncRoutes,anyRoute]
        // // 目前路由器管理的只有常量路由：用户计算完毕后异步路由、任意路由动态追加
        // let res = [...userAsyncRoutes,anyRoute]
        // res.forEach((route:any) => {
        // 	router.addRoute(route);
        // });
        // 菜单的数据
        this.menuRoutes = [...constantRoute, ...userAsyncRoutes];

        // 动态添加路由 - 先清空所有动态路由，再重新添加
        // 移除之前添加的动态路由（除了常量路由）
        this.menuRoutes.forEach((route) => {
          if (
            route.name &&
            !constantRoute.some((cr) => cr.name === route.name)
          ) {
            router.removeRoute(route.name);
          }
        });

        // 添加异步路由
        addRoutes(userAsyncRoutes);

        // 最后添加任意路由（404路由）
        router.addRoute(anyRoute);
        return "ok";
      } else {
        return Promise.reject(new Error(result.message));
      }
    },
    // 退出登录
    async userLogout() {
      let result: any = await reqLogout();
      if (result.code == 200) {
        // 目前没有mock接口：退出登录接口（通知服务器本次用户唯一标识失效）
        this.token = "";
        this.username = "";
        this.avatar = "";
        REMOVE_TOKEN();

        // 重置路由
        this.resetRoutes();
        return "ok";
      } else {
        return Promise.reject(new Error(result.message));
      }
    },
    // 重置路由
    resetRoutes() {
      // 移除所有动态添加的路由
      this.menuRoutes.forEach((route) => {
        if (route.name && !constantRoute.some((cr) => cr.name === route.name)) {
          router.removeRoute(route.name);
        }
      });

      // 重新设置菜单路由
      this.menuRoutes = [...constantRoute];

      // 重新添加任意路由
      router.addRoute(anyRoute);
    },
  },
  // getters: {},
});
// 对外暴露获取小仓库方法
export default useUserStroe;
