# Browser Image OCR

[English](./README.md) | [简体中文](./README.zh-CN.md)

Browser Image OCR 是一个本地 Edge/Chrome 浏览器扩展，支持你在网页图片上右键，并通过支持视觉输入的模型接口进行高精度 OCR。

仓库地址：`https://github.com/xiaobeike/browser-image-ocr`

## 功能特点

- 右键任意网页图片，快速发起 OCR
- 支持 OpenAI-compatible 接口和各类中转服务
- 支持多种 provider，包括 OpenAI-compatible 服务和 Anthropic Claude 原生接口
- 在适用场景下支持 `Chat Completions` 和 `Responses` 两类接口
- 支持图片 URL 直传，也支持自动转换成 Base64
- 能从 OCR 结果中辅助提取链接

## Provider 兼容性

现在插件会按 provider 区分兼容方式，而不再只是依赖模型名。

插件能否使用，取决于两件事：

1. 模型本身是否支持视觉输入
2. 服务端是否兼容你当前选择的 provider 请求格式

当前支持的 provider：

- `OpenAI / 通用 OpenAI-compatible`
  适用于 OpenAI 官方接口，以及大多数支持 OpenAI 风格 `chat/completions` 或 `responses` 图片请求的中转服务
- `Gemini（OpenAI 兼容网关）`
  适用于通过 OpenAI-compatible 网关暴露出来的 Gemini 服务
- `Anthropic Claude（原生 Messages API）`
  适用于 Claude 原生 `messages` 接口

常见情况举例：

- OpenAI 官方支持视觉的模型：通常可用
- OpenRouter 或其他以 OpenAI 风格暴露视觉接口的中转服务：通常可用
- Claude 原生 API：现在可以通过 Anthropic provider 使用
- Gemini 原生 API、DashScope 原生 API 或其他非 OpenAI 原生接口：如果不是通过兼容网关暴露，通常还需要继续增加 provider 适配

## 安装

1. 打开 `edge://extensions` 或 `chrome://extensions`
2. 开启开发者模式
3. 点击 `加载解压缩的扩展`
4. 选择包含 `manifest.json` 的这个文件夹

## 升级

### 本地解压加载安装

如果你是通过 `加载解压缩的扩展` 安装，这个插件不会自动升级。

升级方式：

1. 拉取或替换本地项目文件到最新版本
2. 打开 `edge://extensions` 或 `chrome://extensions`
3. 找到 `Browser Image OCR`
4. 点击 `刷新`

### 商店安装

如果以后发布到 Chrome Web Store 或 Edge Add-ons，用户通过商店安装后，通常会自动获取更新。

## 使用方法

1. 在网页图片上点击右键
2. 点击 `高精度识别图片文字`
3. 第一次使用时填写这些配置：
   - Provider：选择与你服务端匹配的 API 家族
   - Base URL：例如 `https://api.openai.com/v1`，或者你的中转站 `/v1` 地址
   - API Key：你的密钥
   - Model：支持视觉输入的模型
   - API Mode：通常优先选 `Chat Completions`
4. 保存设置
5. 点击开始识别

## 推荐设置

- 大多数中转站：使用 `OpenAI / 通用 OpenAI-compatible` + `Chat Completions`
- OpenAI `Responses` API：使用 `Responses`
- 如果模型拿不到原图：切到 Base64 模式
- 如果图片很大：保留默认自动模式，让插件自行压缩
- 如果是 Claude 原生 API：优先尝试 Base64 模式

## 安全说明

- API Key 只保存在你本机浏览器扩展存储中
- 如果你计划公开发布这个扩展，不要把生产环境密钥直接放在前端，应该增加后端中转鉴权

## 常见问题

- `404`：Base URL 可能没有带 `/v1`，或者接口模式选错了
- 模型读不到图片：把图片模式切到 Base64
- 模型报错：请确认你使用的是支持视觉输入的模型

## 开发说明

- 主扩展入口：`manifest.json`
- 后台 Service Worker：`background.js`
- OCR 页面：`ocr.html`
- OCR 逻辑：`ocr.js`
- 样式文件：`style.css`

## 路线图

- 发布到扩展商店以支持自动升级
- 增加更友好的首次配置引导
- 提升链接卡片、中英混排、复杂版式的 OCR 后处理效果
- 增加更多原生 provider 适配，而不止 OpenAI-compatible 和 Anthropic

## 贡献

欢迎提 issue 和 pull request。

提交前建议注意：

1. 除非确实必要，否则保持插件为纯前端结构
2. 不要把密钥或个人凭据提交进仓库
3. 改完后通过本地刷新扩展验证页面和功能

## 许可证

Apache-2.0
