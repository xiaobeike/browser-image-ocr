# Browser Image OCR

[English](./README.md) | [简体中文](./README.zh-CN.md)

Browser Image OCR is a local Edge/Chrome extension that lets you right-click a web image and run high-accuracy OCR through a vision-capable model endpoint.

Repository: `https://github.com/xiaobeike/browser-image-ocr`

## Features

- Right-click any web image to start OCR
- Works with OpenAI-compatible endpoints and relay services
- Supports multiple providers, including OpenAI-compatible services and Anthropic Claude native API
- Supports both `Chat Completions` and `Responses` style APIs where applicable
- Can send the original image URL or convert the image to Base64 automatically
- Extracts plain text and helps surface URLs from the OCR result

## Provider Compatibility

The extension now separates support by provider instead of only relying on a model name.

The extension is usable when:

1. The model supports vision input
2. The service endpoint matches the selected provider format

Currently supported providers:

- `OpenAI / Generic OpenAI-compatible`
  Use this for OpenAI and most relay services that support image input through OpenAI-style `chat/completions` or `responses`
- `Gemini (OpenAI-compatible gateway)`
  Use this when your Gemini service is exposed behind an OpenAI-compatible gateway
- `Anthropic Claude (native Messages API)`
  Use this for Claude-compatible native `messages` endpoints

Common examples:

- OpenAI official vision-capable models: usually supported
- OpenRouter or relay services exposing OpenAI-style vision APIs: often supported
- Claude native API: supported through the Anthropic provider mode
- Gemini native API, DashScope native API, or other non-OpenAI-native APIs: may still require extra provider adapters if they are not exposed through a compatible gateway

## Install

1. Open `edge://extensions` or `chrome://extensions`
2. Turn on Developer Mode
3. Click `Load unpacked`
4. Select this folder, the one that contains `manifest.json`

## Upgrade

### Local unpacked installation

If you installed the extension with `Load unpacked`, it will not auto-update.

To upgrade:

1. Pull or replace the local project files with the latest version
2. Open `edge://extensions` or `chrome://extensions`
3. Find `Browser Image OCR`
4. Click `Reload`

### Store installation

If the extension is published to Chrome Web Store or Edge Add-ons in the future, users who install from the store will typically receive automatic updates.

## Usage

1. Right-click an image on a web page
2. Click `高精度识别图片文字`
3. Fill in the required settings on first use:
   - Provider: choose the API family that matches your service
   - Base URL: for example `https://api.openai.com/v1` or your relay endpoint ending in `/v1`
   - API Key: your API key
   - Model: a vision-capable model
   - API Mode: usually `Chat Completions`
4. Save settings
5. Click the recognize button to run OCR

## Recommended Settings

- Most relay services: use `OpenAI / Generic OpenAI-compatible` with `Chat Completions`
- OpenAI `Responses` API: use `Responses`
- If the model cannot fetch the source image: use Base64 mode
- For large images: keep the default automatic mode so the extension can compress when needed
- For Claude native API: Base64 mode is recommended first

## Security Notes

- The API key is stored only in your local browser extension storage
- If you plan to publish this extension broadly, avoid shipping production secrets in the frontend and add a backend relay with authentication

## Troubleshooting

- `404`: the Base URL may be missing `/v1`, or the selected API mode does not match the server
- Image not readable by the model: switch to Base64 mode
- Model error: use a model that supports vision input

## Development

- Main extension entry: `manifest.json`
- Background service worker: `background.js`
- OCR page UI: `ocr.html`
- OCR logic: `ocr.js`
- Styles: `style.css`

## Roadmap

- Publish to extension stores for automatic updates
- Add a friendlier onboarding flow for first-time setup
- Improve OCR post-processing for links, cards, and mixed-language layouts
- Add more native provider adapters beyond OpenAI-compatible and Anthropic

## Contributing

Issues and pull requests are welcome.

Before contributing:

1. Keep the extension frontend-only unless a backend is clearly necessary
2. Avoid storing secrets in source code
3. Test changes by reloading the unpacked extension locally

## License

Apache-2.0
