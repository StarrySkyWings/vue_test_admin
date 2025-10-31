// 对外暴露配置路由(常量路由)
export const constantRoute = [
  {
    // 登录
    path: "/login",
    name: "login", // 命名路由
    component: () => import("@/views/Login/index.vue"),
    meta: {
      title: "登录", // 菜单标题
      hidden: true, // 代表路由标题在菜单中是否隐藏 true:隐藏 false:不隐藏
      icon: "Promotion", // 菜单文字左侧的图标，支持element-plus全部图标
    },
  },
  {
    // 登录成功以后展示数据的路由
    path: "/",
    name: "layout",
    component: () => import("@/views/Layout/index.vue"),
    meta: {
      title: "",
      hidden: false,
      icon: "Avatar",
    },
    redirect: "/home",
    children: [
      {
        path: "/home",
        component: () => import("@/views/Home/index.vue"),
        meta: {
          title: "首页",
          hidden: false,
          icon: "HomeFilled",
        },
      },
    ],
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404/index.vue"),
    meta: {
      title: "404",
      hidden: true,
      icon: "DocumentDelete",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Any",
    redirect: "/404",
    meta: {
      title: "任意路由",
      hidden: true,
      icon: "Guide",
    },
  },
  {
    path: "/screen",
    name: "Screen",
    component: () => import("@/views/Screen/index.vue"),
    meta: {
      title: "数据大屏",
      icon: "Platform",
    },
  },
  {
    path: "/acl",
    name: "Acl",
    component: () => import("@/views/Layout/index.vue"),
    meta: {
      title: "权限管理",
      icon: "Lock",
    },
    redirect: "/acl/user",
    children: [
      {
        path: "/acl/user",
        name: "User",
        component: () => import("@/views/Acl/Users/index.vue"),
        meta: {
          title: "用户管理",
          icon: "User",
        },
      },
      {
        path: "/acl/role",
        name: "Role",
        component: () => import("@/views/Acl/Roles/index.vue"),
        meta: {
          title: "角色管理",
          icon: "UserFilled",
        },
      },
      {
        path: "/acl/permission",
        name: "Permission",
        component: () => import("@/views/Acl/Permission/index.vue"),
        meta: {
          title: "菜单管理",
          icon: "List",
        },
      },
    ],
  },
  {
    path: "/product",
    name: "Product",
    component: () => import("@/views/Layout/index.vue"),
    meta: {
      title: "商品管理",
      icon: "Goods",
    },
    redirect: "/product/trademark",
    children: [
      {
        path: "/product/trademark",
        name: "Trademark",
        component: () => import("@/views/Product/tradeMark/index.vue"),
        meta: {
          title: "品牌管理",
          icon: "ShoppingCartFull",
        },
      },
      {
        path: "/product/attr",
        name: "Attr",
        component: () => import("@/views/Product/Attr/index.vue"),
        meta: {
          title: "属性管理",
          icon: "HelpFilled",
        },
      },
      {
        path: "/product/spu",
        name: "Spu",
        component: () => import("@/views/Product/Spu/index.vue"),
        meta: {
          title: "SPU管理",
          icon: "Grid",
        },
      },
      {
        path: "sku",
        name: "Sku",
        component: () => import("@/views/Product/Sku/index.vue"),
        meta: {
          title: "SKU管理",
          icon: "Grid",
        },
      },
    ],
  },
];
