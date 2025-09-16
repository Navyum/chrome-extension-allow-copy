# 浏览器扩展 - 允许复制

一个跨浏览器的扩展，用于绕过网页的复制限制，允许用户自由复制网页内容。

## 功能特性

- 🚀 一键开启/关闭复制功能
- 🎯 支持所有网页
- 🌍 多语言支持（中文/英文）
- 💫 现代化UI设计
- 🔧 使用Webpack打包
- 📦 模块化开发
- 🛠️ 开发环境热重载
- 🎨 动态图标切换（开启/关闭状态）
- 🌐 跨浏览器支持（Chrome、Firefox、Edge）

## 支持的浏览器

- ✅ **Google Chrome** (Manifest V3)
- ✅ **Mozilla Firefox** (Manifest V2)
- ✅ **Microsoft Edge** (Manifest V3)

## 快速开始

### 安装依赖

```bash
npm install
```

### 构建所有浏览器版本

```bash
npm run build:all
```

### 构建特定浏览器版本

```bash
# Chrome版本
npm run build:chrome

# Firefox版本
npm run build:firefox

# Edge版本
npm run build:edge
```

### 开发模式

```bash
# 开发Chrome版本
npm run dev:chrome

# 开发Firefox版本
npm run dev:firefox

# 开发Edge版本
npm run dev:edge
```

### 清理构建文件

```bash
npm run clean
```

## 项目结构

```
chrome-extension-allow-copy/
├── src/                    # 源代码目录
│   ├── _locales/          # 国际化文件
│   │   ├── en/            # 英文
│   │   └── zh_CN/         # 中文
│   ├── manifests/         # 浏览器特定的manifest文件
│   │   ├── chrome.json    # Chrome/Edge manifest
│   │   ├── firefox.json   # Firefox manifest
│   │   └── edge.json      # Edge manifest
│   ├── background.js      # 后台脚本
│   ├── content_script.js  # 内容脚本
│   ├── popup.html         # 弹窗HTML
│   ├── popup.js           # 弹窗脚本
│   ├── popup.css          # 弹窗样式
│   ├── inject_script.js   # 注入脚本
│   └── i18n.js            # 国际化脚本
├── icons/                 # 图标文件
│   ├── icon*.png          # 普通状态图标
│   └── icon-fill*.png     # 激活状态图标
├── dist-chrome/           # Chrome构建输出
├── dist-firefox/          # Firefox构建输出
├── dist-edge/             # Edge构建输出
├── webpack.config.js      # Webpack配置（多浏览器支持）
├── .babelrc              # Babel配置
├── .gitignore            # Git忽略文件
└── package.json          # 项目配置
```

## 安装扩展

### Chrome浏览器

1. 运行 `npm run build:chrome` 构建Chrome版本
2. 打开Chrome浏览器
3. 访问 `chrome://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择 `dist-chrome` 目录

### Firefox浏览器

1. 运行 `npm run build:firefox` 构建Firefox版本
2. 打开Firefox浏览器
3. 访问 `about:debugging`
4. 点击"此Firefox"
5. 点击"临时载入附加组件"
6. 选择 `dist-firefox/manifest.json` 文件

### Edge浏览器

1. 运行 `npm run build:edge` 构建Edge版本
2. 打开Edge浏览器
3. 访问 `edge://extensions/`
4. 开启"开发人员模式"
5. 点击"加载解压缩的扩展"
6. 选择 `dist-edge` 目录

## 功能说明

### 复制功能

- **一键复制**：点击扩展图标，在弹窗中开启/关闭复制功能
- **快捷键支持**：
  - `Ctrl+C` / `Cmd+C`：复制选中文本
  - `Ctrl+Shift+C` / `Cmd+Shift+C`：强制复制（即使没有选中文本）
  - `Ctrl+Shift+A` / `Cmd+Shift+A`：复制页面所有文本

### 图标状态

扩展图标会根据功能状态动态变化：
- **开启状态**：显示填充图标 (icon-fill*.png)
- **关闭状态**：显示普通图标 (icon*.png)

### 特殊网站支持

- **飞书文档**：针对 `larkoffice.com` 的特殊文本提取
- **通用支持**：适用于所有网页的复制限制绕过

## 开发指南

### 主要脚本说明

- **background.js**: 后台脚本，处理扩展的安装、存储初始化和图标切换
- **content_script.js**: 内容脚本，注入到网页中，实现复制功能的核心逻辑
- **popup.js**: 弹窗脚本，处理用户界面的交互和图标更新消息发送
- **inject_script.js**: 注入脚本，用于绕过网页的复制限制
- **i18n.js**: 国际化脚本，处理多语言支持

### 浏览器兼容性处理

项目通过以下方式实现跨浏览器兼容：

#### **Manifest版本差异**
- **Chrome/Edge**: 使用Manifest V3 (`manifest_version: 3`)
- **Firefox**: 使用Manifest V2 (`manifest_version: 2`)

#### **API差异处理**
- **图标设置**: 自动检测浏览器类型，使用对应的API
  - Chrome/Edge: `chrome.action.setIcon()`
  - Firefox: `chrome.browserAction.setIcon()`
- **脚本注入**: 根据浏览器类型选择不同的注入方法
  - Chrome/Edge: `chrome.scripting.executeScript()`
  - Firefox: `chrome.tabs.executeScript()`

#### **权限差异**
- **Chrome/Edge**: 需要 `scripting` 权限
- **Firefox**: 需要 `tabs` 权限和 `<all_urls>` 权限

### Webpack配置

项目使用Webpack 5进行模块打包，支持多浏览器构建：

- **环境自动检测**: 根据`--mode`参数自动切换开发/生产模式
- **浏览器特定构建**: 通过`--env browser`参数构建不同浏览器版本
- **开发模式特性**:
  - 文件变化监听 (`--watch`)
  - Source map支持
  - CSS热注入
  - 快速构建
- **生产模式特性**:
  - 代码压缩优化
  - CSS文件提取
  - 资源优化
- **多入口点**: 每个脚本文件都是独立的入口点
- **代码分割**: 自动处理模块依赖关系

## 技术栈

- **Webpack 5** - 模块打包器
- **Babel** - JavaScript编译器
- **CSS3** - 样式设计
- **Chrome Extension API** - 扩展开发
- **WebExtensions API** - 跨浏览器扩展API
- **ES6+** - 现代JavaScript语法

## 构建命令

```bash
# 安装依赖
npm install

# 构建所有浏览器版本
npm run build:all

# 构建特定浏览器版本
npm run build:chrome
npm run build:firefox
npm run build:edge

# 开发模式（监听文件变化）
npm run dev:chrome
npm run dev:firefox
npm run dev:edge

# 清理构建文件
npm run clean
```

## 故障排除

### 常见问题

1. **localizeHtmlPage is not defined**
   - 确保运行了对应的构建命令
   - 检查i18n.js是否正确导入

2. **扩展无法加载**
   - 检查manifest.json语法
   - 确保所有文件都已构建
   - 确认使用了正确的浏览器版本

3. **功能不工作**
   - 检查浏览器控制台错误
   - 确保扩展权限正确
   - 验证浏览器兼容性

4. **图标不切换**
   - 确保图标文件存在于对应目录
   - 检查background.js是否正确加载

5. **Firefox版本问题**
   - 确保使用Firefox开发者版本或ESR版本
   - 检查manifest V2配置是否正确

6. **Edge版本问题**
   - 确保使用Edge 88+版本
   - 检查manifest V3配置是否正确

### 浏览器特定问题

#### **Chrome**
- 需要Chrome 88+版本
- 确保启用了Manifest V3支持

#### **Firefox**
- 需要Firefox 78+版本
- 可能需要启用`xpinstall.signatures.required`为false（仅开发环境）

#### **Edge**
- 需要Edge 88+版本
- 确保启用了扩展开发者模式

## 贡献

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

### 代码规范

- 使用ES6+语法
- 遵循现有的代码风格
- 添加适当的注释
- 确保跨浏览器兼容性

## 许可证

MIT License

## 更新日志

### v1.0.0
- ✅ 初始版本发布
- ✅ 支持Chrome、Firefox、Edge浏览器
- ✅ 跨浏览器兼容性处理
- ✅ 动态图标切换功能
- ✅ 多语言支持
- ✅ 现代化UI设计
