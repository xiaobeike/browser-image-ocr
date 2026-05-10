chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'ai-ocr-image',
      title: '高精度识别图片文字',
      contexts: ['image']
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== 'ai-ocr-image') return;
  const src = info.srcUrl || '';
  const url = chrome.runtime.getURL('ocr.html') + '?src=' + encodeURIComponent(src);
  chrome.tabs.create({ url });
});
