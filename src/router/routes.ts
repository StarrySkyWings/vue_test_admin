// 对外暴露配置路由(常量路由)
export const constantRoute = [
  {
    // 登录
    path: "/login",
    name: "login", // 命名路由
    component: () => import("@/views/Login/index.vue"),
  },
  {
    // 登录成功以后展示数据的路由
    path: "/",
    name: "layout",
    component: () => import("@/views/Home/index.vue"),
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404/index.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Any",
    redirect: "/404",
  },
];
