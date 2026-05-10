const $ = (id) => document.getElementById(id);

const preview = $('preview');
const imageUrlEl = $('imageUrl');
const providerEl = $('provider');
const baseUrlEl = $('baseUrl');
const apiKeyEl = $('apiKey');
const modelEl = $('model');
const apiModeEl = $('apiMode');
const imageModeEl = $('imageMode');
const resultEl = $('result');
const statusEl = $('status');
const linksEl = $('links');
const versionTextEl = $('versionText');
const runtimeMetaEl = $('runtimeMeta');
const resultSectionEl = $('resultSection');

const params = new URLSearchParams(location.search);
const imageSrc = params.get('src') || '';
preview.src = imageSrc;
imageUrlEl.textContent = imageSrc || '没有拿到图片地址。请在网页图片上右键使用。';

syncRuntimeInfo();

init();

async function init() {
  const saved = await chrome.storage.local.get([
    'openaiBaseUrl',
    'openaiApiKey',
    'openaiModel',
    'openaiProvider',
    'openaiApiMode',
    'openaiImageMode'
  ]);

  providerEl.value = saved.openaiProvider || 'openai';
  baseUrlEl.value = saved.openaiBaseUrl || 'https://api.openai.com/v1';
  apiKeyEl.value = saved.openaiApiKey || '';
  modelEl.value = saved.openaiModel || 'gpt-5.2';
  apiModeEl.value = saved.openaiApiMode || 'chat';
  imageModeEl.value = saved.openaiImageMode || 'auto';

  $('saveKeyBtn').addEventListener('click', saveSettings);
  $('clearKeyBtn').addEventListener('click', clearSettings);
  $('recognizeBtn').addEventListener('click', recognize);
  $('copyAllBtn').addEventListener('click', () => copyText(resultEl.value));
  $('copyUrlBtn').addEventListener('click', () => {
    const first = getLinks(resultEl.value)[0];
    if (!first) return setStatus('没有提取到链接。', true);
    copyText(first);
  });
  $('openUrlBtn').addEventListener('click', () => {
    const first = getLinks(resultEl.value)[0];
    if (!first) return setStatus('没有提取到链接。', true);
    chrome.tabs.create({ url: first });
  });
}

async function saveSettings() {
  await chrome.storage.local.set({
    openaiBaseUrl: normalizeBaseUrl(baseUrlEl.value.trim() || 'https://api.openai.com/v1'),
    openaiApiKey: apiKeyEl.value.trim(),
    openaiModel: modelEl.value.trim() || 'gpt-5.2',
    openaiProvider: providerEl.value || 'openai',
    openaiApiMode: apiModeEl.value,
    openaiImageMode: imageModeEl.value
  });
  baseUrlEl.value = normalizeBaseUrl(baseUrlEl.value.trim() || 'https://api.openai.com/v1');
  setStatus('设置已保存。', false, true);
}

async function clearSettings() {
  await chrome.storage.local.remove(['openaiApiKey']);
  apiKeyEl.value = '';
  setStatus('API Key 已清除。Base URL、模型和接口格式已保留。', false, true);
}

async function recognize() {
  const provider = providerEl.value || 'openai';
  const baseUrl = normalizeBaseUrl(baseUrlEl.value.trim() || 'https://api.openai.com/v1');
  const apiKey = apiKeyEl.value.trim();
  const model = modelEl.value.trim() || 'gpt-5.2';
  const apiMode = apiModeEl.value || 'chat';
  const imageMode = imageModeEl.value || 'auto';

  if (!imageSrc) return setStatus('没有图片地址，请回到网页图片上右键使用。', true);
  if (!apiKey) return setStatus('请先填写 API Key。', true);
  if (!/^https?:\/\//i.test(baseUrl)) return setStatus('Base URL 必须以 http:// 或 https:// 开头。', true);

  await saveSettings();
  resultEl.value = '';
  renderLinks([]);
  setStatus('正在准备图片并调用接口……');
  $('recognizeBtn').disabled = true;
  scrollToResult();

  try {
    const imageUrlForApi = await prepareImageForApi(imageSrc, imageMode);
    setStatus(`正在识别……\n提供商：${providerLabel(provider)}\n接口：${describeEndpoint(provider, baseUrl, apiMode)}\n图片方式：${imageUrlForApi.startsWith('data:') ? 'Base64' : 'URL'}`);

    const output = await recognizeByProvider({
      provider,
      baseUrl,
      apiKey,
      model,
      apiMode,
      imageUrlForApi
    });

    const polished = postProcess(output);
    resultEl.value = polished;
    renderLinks(getLinks(polished));
    setStatus('识别完成。', false, true);
    scrollToResult();
  } catch (err) {
    console.error(err);
    setStatus(formatError(err), true);
    scrollToResult();
  } finally {
    $('recognizeBtn').disabled = false;
  }
}

function normalizeBaseUrl(url) {
  let u = (url || '').trim();
  if (!u) return 'https://api.openai.com/v1';
  u = u.replace(/\/+$/, '');
  // 用户如果填到具体接口，自动还原为 /v1 根路径。
  u = u.replace(/\/chat\/completions$/i, '').replace(/\/responses$/i, '');
  return u.replace(/\/+$/, '');
}

function syncRuntimeInfo() {
  const manifest = chrome.runtime.getManifest();
  const version = manifest?.version || 'dev';
  document.title = `${manifest?.name || 'Browser Image OCR'} v${version}`;
  if (versionTextEl) versionTextEl.textContent = `v${version}`;
  if (runtimeMetaEl) {
    runtimeMetaEl.textContent = '当前是本地加载扩展。更新代码后，需要到 edge://extensions 或 chrome://extensions 手动点击“刷新”。';
  }
}

function scrollToResult() {
  resultSectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function providerLabel(provider) {
  if (provider === 'anthropic') return 'Anthropic Claude';
  if (provider === 'gemini-openai') return 'Gemini（OpenAI 兼容）';
  return 'OpenAI / 通用兼容';
}

function describeEndpoint(provider, baseUrl, apiMode) {
  if (provider === 'anthropic') return `${baseUrl}/messages`;
  return `${baseUrl}/${apiMode === 'chat' ? 'chat/completions' : 'responses'}`;
}

async function recognizeByProvider({ provider, baseUrl, apiKey, model, apiMode, imageUrlForApi }) {
  if (provider === 'anthropic') {
    return await callAnthropicVisionOCR({ baseUrl, apiKey, model, imageUrlForApi });
  }
  if (apiMode === 'responses') {
    return await callResponsesVisionOCR({ baseUrl, apiKey, model, imageUrlForApi });
  }
  return await callChatCompletionsVisionOCR({ baseUrl, apiKey, model, imageUrlForApi });
}

function joinEndpoint(baseUrl, path) {
  return `${normalizeBaseUrl(baseUrl)}/${path.replace(/^\//, '')}`;
}

function buildPrompt() {
  return [
    '你是一个高精度 OCR 工具。',
    '请完整转写图片中可见的文字，不要解释，不要编造。',
    '保留原始换行和语义结构。',
    '特别注意中文、英文、GitHub 项目名、URL、域名、标点、斜杠和连字符。',
    '如果图片里是链接卡片，请输出：站点、标题、描述。',
    '如果能从 GitHub 卡片标题中确定仓库地址，例如 GitHub - owner/repo，请额外输出完整链接：https://github.com/owner/repo',
    '只输出识别结果。'
  ].join('\n');
}

async function prepareImageForApi(src, mode) {
  if (mode === 'url') return src;

  try {
    setStatus('正在把图片转成 Base64，避免中转站无法访问原图……');
    return await imageUrlToDataUrl(src);
  } catch (err) {
    if (mode === 'base64') throw new Error('图片转 Base64 失败：' + (err?.message || err));
    console.warn('Base64 failed, fallback to original URL:', err);
    return src;
  }
}

async function imageUrlToDataUrl(src) {
  const res = await fetch(src, { cache: 'force-cache', credentials: 'omit' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const blob = await res.blob();

  // 小图直接转，尽量保留截图文字细节。
  if (blob.size <= 2.5 * 1024 * 1024) {
    return await blobToDataUrl(blob);
  }

  // 大图压缩到最长边 2000，减少请求体积。
  return await resizeBlobToJpegDataUrl(blob, 2000, 0.88);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('FileReader 失败'));
    reader.readAsDataURL(blob);
  });
}

async function resizeBlobToJpegDataUrl(blob, maxSide, quality) {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', quality);
}

async function callChatCompletionsVisionOCR({ baseUrl, apiKey, model, imageUrlForApi }) {
  const body = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: buildPrompt() },
          {
            type: 'image_url',
            image_url: {
              url: imageUrlForApi,
              detail: 'high'
            }
          }
        ]
      }
    ],
    temperature: 0,
    max_tokens: 1500
  };

  const data = await postJson(joinEndpoint(baseUrl, '/chat/completions'), apiKey, body);
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function callResponsesVisionOCR({ baseUrl, apiKey, model, imageUrlForApi }) {
  const body = {
    model,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: buildPrompt() },
          {
            type: 'input_image',
            image_url: imageUrlForApi,
            detail: 'high'
          }
        ]
      }
    ],
    temperature: 0,
    max_output_tokens: 1500
  };

  const data = await postJson(joinEndpoint(baseUrl, '/responses'), apiKey, body);
  return data.output_text || extractTextFromResponse(data);
}

async function callAnthropicVisionOCR({ baseUrl, apiKey, model, imageUrlForApi }) {
  const imagePart = imageUrlForApi.startsWith('data:')
    ? dataUrlToAnthropicImageSource(imageUrlForApi)
    : {
        type: 'image',
        source: {
          type: 'url',
          url: imageUrlForApi
        }
      };

  const body = {
    model,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildPrompt()
          },
          imagePart
        ]
      }
    ]
  };

  const data = await postAnthropicJson(joinEndpoint(baseUrl, '/messages'), apiKey, body);
  return extractTextFromAnthropic(data);
}

async function postJson(url, apiKey, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || data?.raw || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

async function postAnthropicJson(url, apiKey, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || data?.raw || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

function dataUrlToAnthropicImageSource(dataUrl) {
  const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error('Anthropic 接口当前要求图片 URL 或 Base64 data URL。');
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: match[1],
      data: match[2]
    }
  };
}

function extractTextFromAnthropic(data) {
  const chunks = [];
  for (const item of data?.content || []) {
    if (item?.type === 'text' && item?.text) chunks.push(item.text);
  }
  return chunks.join('\n').trim();
}

function extractTextFromResponse(data) {
  try {
    const chunks = [];
    for (const item of data.output || []) {
      for (const part of item.content || []) {
        if ((part.type === 'output_text' || part.type === 'text') && part.text) chunks.push(part.text);
      }
    }
    return chunks.join('\n').trim();
  } catch {
    return '';
  }
}

function postProcess(text) {
  let t = (text || '').trim();
  if (!t) throw new Error('接口返回了空结果。请检查模型是否支持图片输入。');

  t = t.replace(/\r\n/g, '\n');
  t = t.replace(/[ \t]+\n/g, '\n');
  t = t.replace(/\n{3,}/g, '\n\n');

  const ghMatch = t.match(/GitHub\s*[-–—]\s*([A-Za-z0-9_.-]+)\s*\/\s*([A-Za-z0-9_.-]+)/i);
  if (ghMatch) {
    const repoUrl = `https://github.com/${ghMatch[1]}/${ghMatch[2]}`;
    if (!t.includes(repoUrl)) {
      t += `\n\n推断链接：\n${repoUrl}`;
    }
  }

  return t;
}

function getLinks(text) {
  const links = new Set();
  const urlRegex = /https?:\/\/[^\s\]）)>,"'，。；;]+/gi;
  for (const match of text.matchAll(urlRegex)) links.add(match[0]);

  const ghMatch = text.match(/GitHub\s*[-–—]\s*([A-Za-z0-9_.-]+)\s*\/\s*([A-Za-z0-9_.-]+)/i);
  if (ghMatch) links.add(`https://github.com/${ghMatch[1]}/${ghMatch[2]}`);

  const domainRegex = /\b(?:github\.com|www\.[a-z0-9.-]+\.[a-z]{2,}|[a-z0-9-]+\.[a-z]{2,})(?:\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?/gi;
  for (const match of text.matchAll(domainRegex)) {
    const raw = match[0];
    if (/^github\.com$/i.test(raw)) continue;
    links.add(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  }

  return Array.from(links);
}

function renderLinks(links) {
  if (!links.length) {
    linksEl.textContent = '暂无';
    linksEl.className = 'links muted';
    return;
  }
  linksEl.className = 'links';
  linksEl.innerHTML = '';
  links.forEach((link) => {
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.textContent = link;
    linksEl.appendChild(a);
  });
}

async function copyText(text) {
  if (!text) return setStatus('没有可复制的内容。', true);
  await navigator.clipboard.writeText(text);
  setStatus('已复制到剪贴板。', false, true);
}

function setStatus(message, isError = false, isOk = false) {
  statusEl.textContent = message;
  statusEl.className = 'status' + (isError ? ' error' : '') + (isOk ? ' ok' : '');
}

function formatError(err) {
  const message = String(err?.message || err || '未知错误');
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) return '网络请求失败。请检查 Base URL 是否正确、中转站是否允许浏览器扩展跨域访问，或改用 https 地址。原始错误：' + message;
  if (/401|Incorrect API key|invalid_api_key|unauthorized/i.test(message)) return 'API Key 不正确或无权限。原始错误：' + message;
  if (/404|not found/i.test(message)) return '接口地址不存在。请检查 Base URL 是否应该以 /v1 结尾，以及接口格式是否选对。原始错误：' + message;
  if (/model|does not exist|unsupported|not support/i.test(message)) return '模型不可用，或这个模型不支持图片输入。请换成支持视觉的模型。原始错误：' + message;
  if (/billing|quota|insufficient_quota|rate limit/i.test(message)) return '额度不足、限流或没有开通计费。原始错误：' + message;
  if (/image|download|fetch|access|invalid.*image/i.test(message)) return '图片输入失败。可以把“图片传输方式”改成“强制 Base64”再试。原始错误：' + message;
  if (/CSP|content security/i.test(message)) return '被扩展 CSP 拦截。请使用新版插件，或检查 Base URL 协议。原始错误：' + message;
  return message;
}
