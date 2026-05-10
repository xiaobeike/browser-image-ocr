# Browser Image OCR

Browser Image OCR is a local Edge/Chrome extension that lets you right-click a web image and run high-accuracy OCR through an OpenAI-compatible vision endpoint.

基于 OpenAI-compatible 接口的浏览器图片文字识别扩展，适合识别网页截图、分享卡片、海报、链接卡片和普通图片中的文字。

Repository: `https://github.com/xiaobeike/browser-image-ocr`

## Features

- Right-click any web image to start OCR.
- Works with OpenAI-compatible endpoints and relay services.
- Supports both `Chat Completions` and `Responses` style APIs.
- Can send the original image URL or convert the image to Base64 automatically.
- Extracts plain text and helps surface URLs from the OCR result.

## Install

1. Open `edge://extensions` or `chrome://extensions`.
2. Turn on Developer Mode.
3. Click `Load unpacked`.
4. Select this folder, the one that contains `manifest.json`.

## Upgrade

### Local unpacked installation

If you installed the extension with `Load unpacked`, it will not auto-update.

To upgrade:

1. Pull or replace the local project files with the latest version.
2. Open `edge://extensions` or `chrome://extensions`.
3. Find `Browser Image OCR`.
4. Click `Reload`.

### Store installation

If the extension is published to Chrome Web Store or Edge Add-ons in the future, users who install from the store will typically receive automatic updates.

## Usage

1. Right-click an image on a web page.
2. Click `高精度识别图片文字`.
3. Fill in the required settings on first use:
   - Base URL: for example `https://api.openai.com/v1` or your relay endpoint ending in `/v1`
   - API Key: your API key
   - Model: a vision-capable model
   - API Mode: usually `Chat Completions`
4. Save settings.
5. Click the recognize button to run OCR.

## Recommended Settings

- Most relay services: use `Chat Completions`
- OpenAI `Responses` API: use `Responses`
- If the model cannot fetch the source image: use Base64 mode
- For large images: keep the default automatic mode so the extension can compress when needed

## Security Notes

- The API key is stored only in your local browser extension storage.
- If you plan to publish this extension broadly, avoid shipping production secrets in the frontend and add a backend relay with authentication.

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

## Contributing

Issues and pull requests are welcome.

Before contributing:

1. Keep the extension frontend-only unless a backend is clearly necessary.
2. Avoid storing secrets in source code.
3. Test changes by reloading the unpacked extension locally.

## License

Apache-2.0
