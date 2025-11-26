import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
// 引入svg需要用到插件
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
// mock插件提供方法
import { viteMockServe } from "vite-plugin-mock";
import path from "path";
// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 获取各种环境下的对应变量
  let env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
      viteMockServe({
        enable: command === "serve",
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // scss全局变量一个配置
    css: {
      preprocessorOptions: {
        scss: {
          // javascriptEnabled: true,
          additionalData: '@use "@/styles/variable.scss" as *;',
        },
      },
    },
    // 代理跨域
    server: {
      proxy: {
        [env.VITE_APP_BASE_API]: {
          // 获取数据的服务器地址设置
          target: env.VITE_SERVE,
          // 需要代理跨域
          changeOrigin: true,
          // 路径重写
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
