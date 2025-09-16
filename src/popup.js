import './popup.css';
import { localizeHtmlPage } from './i18n.js';

// 浏览器API适配器
const browserApi = (() => {
    // 检测浏览器类型
    const isFirefox = typeof browser !== 'undefined' && browser.runtime;
    const isChrome = typeof chrome !== 'undefined' && chrome.runtime;
    
    if (isFirefox) {
        // Firefox环境
        return {
            ...browser,
            // 重写action，指向browser_action
            action: browser.browserAction,
            // 为了向后兼容，也提供browser_action别名
            browser_action: browser.browserAction,
            // 使用chrome API进行脚本执行（Firefox兼容模式）
            tabs: chrome.tabs
        };
    } else if (isChrome) {
        // Chrome/Edge环境
        return {
            ...chrome,
            // 为了向后兼容，提供browser_action别名指向action
            browser_action: chrome.action
        };
    } else {
        throw new Error('Neither browser nor chrome API is available');
    }
})();

// 检测浏览器类型
function getBrowser() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        return manifest.manifest_version === 2 ? 'firefox' : 'chrome';
    }
    return 'chrome';
}

// 执行脚本到标签页
function executeScript(tabId, files, callback) {
    const browser = getBrowser();
    
    if (browser === 'firefox') {
        // Firefox使用chrome.tabs.executeScript（兼容模式）
        chrome.tabs.executeScript(tabId, {
            file: files[0] // Firefox只支持单个文件，且使用'file'而不是'files'
        }, callback);
    } else {
        // Chrome/Edge使用scripting.executeScript
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: files
        }, callback);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const copySwitch = document.getElementById('copy-switch');

    // 从存储中获取当前状态
    browserApi.storage.sync.get('copyEnabled', function(data) {
        copySwitch.checked = data.copyEnabled !== false;
    });

    copySwitch.addEventListener('change', function() {
        const isEnabled = this.checked;
        
        // 保存状态到存储
        browserApi.storage.sync.set({copyEnabled: isEnabled});

        console.log('storage 1', JSON.stringify(browserApi.storage.sync.get('copyEnabled')));
        // 更新扩展图标
        browserApi.runtime.sendMessage({
            action: 'updateIcon',
            enabled: isEnabled
        }, function(response) {
            if (response && response.success) {
                console.log('图标已更新');
            }
        });

        // 向内容脚本发送消息
        browserApi.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            if (activeTab && activeTab.url && !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('moz-extension://')) {
                executeScript(activeTab.id, ['content.js'], function() {
                    browserApi.tabs.sendMessage(activeTab.id, {action: 'toggleCopy', enabled: isEnabled});
                });
            }
        });
    });

    // 调用本地化函数
    localizeHtmlPage();
});
