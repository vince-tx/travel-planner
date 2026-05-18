# 旅行规划 (Travel Planner)

中文旅行规划 PWA 应用，支持行程管理、打包清单和预算追踪。

## 技术栈

- **框架**: React 18.2 (JSX，无 TypeScript)
- **构建**: Vite 5.0 + @vitejs/plugin-react + vite-plugin-pwa
- **数据库**: localStorage（JSON 序列化），非 sql.js
- **样式**: 纯 CSS（每组件一个文件），无预处理器
- **状态管理**: React useState/useEffect，无外部状态库
- **路由**: 无路由库，通过 App.jsx 中的 selectedTripId 状态切换页面

## 常用命令

```bash
npm run dev      # 启动开发服务器（热重载）
npm run build    # 生产构建到 dist/
npm run preview  # 本地预览生产构建
npx vite --host  # 启动开发服务器并开放局域网访问（手机同 WiFi 下可访问）
```

## 项目结构

```
src/
  main.jsx              # 入口
  App.jsx               # 根组件，DB 初始化，页面路由
  components/
    Header.jsx          # 行程页顶部栏
    TabBar.jsx          # 标签切换（行程/清单/预算）
    FAB.jsx             # 浮动操作按钮（展开菜单）
    Modal.jsx           # 底部弹出模态框（桌面端居中）
    Sidebar.jsx         # 侧边栏行程导航
    ItineraryList.jsx   # 行程项按日期分组展示
    Checklist.jsx       # 打包清单（带分类和进度条）
    Budget.jsx          # 预算追踪（分类预算+支出记录）
  db/
    database.js         # localStorage 数据库单例
    trips.js            # 旅行 CRUD
    itineraries.js      # 行程项 CRUD
    checklists.js       # 清单项 CRUD
    budgets.js          # 预算分类与支出 CRUD
  pages/
    TripList.jsx        # 首页：旅行列表，创建新旅行
    TripPage.jsx        # 详情页：三标签布局
public/
  manifest.json         # PWA manifest
  sw.js                 # Service Worker 离线缓存
  icons/                # PWA 图标
```

## 架构要点

- **数据层**: 所有数据通过 `src/db/` 下的模块操作 localStorage，每个模块提供 CRUD 函数，组件通过调用函数刷新数据
- **ID 生成**: 使用 `Date.now()`，快速连续创建可能碰撞
- **级联删除**: `deleteTrip` 会同时删除关联的行程、清单和预算数据
- **PWA**: 配置为 standalone 模式，支持离线缓存
- **移动优先**: CSS 使用 768px 断点，桌面端 max-width: 900px
- **UI 语言**: 界面全部为简体中文

## 注意事项

- `sql.js` 和 `sql-wasm.wasm` 是遗留文件，当前未使用，数据库已改为 localStorage
- Vite 配置中的 COOP/COEP 头是为 sql.js SharedArrayBuffer 保留的，如确认不再使用 sql.js 可移除
- PWA manifest 在 `public/manifest.json` 和 `vite.config.js` 中重复定义，构建时以 vite-plugin-pwa 的内联配置为准
