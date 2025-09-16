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
            browser_action: browser.browserAction
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

// 图标配置
const ICON_CONFIG = {
    enabled: {
        16: "icons/icon-fill16.png",
        32: "icons/icon-fill32.png",
        48: "icons/icon-fill48.png",
        128: "icons/icon-fill128.png"
    },
    disabled: {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png"
    }
};

// 更新扩展图标
function updateIcon(isEnabled) {
    const iconPath = isEnabled ? ICON_CONFIG.enabled : ICON_CONFIG.disabled;
    
    browserApi.browser_action.setIcon({
        path: iconPath
    });
}

// 扩展安装时的初始化
browserApi.runtime.onInstalled.addListener((details) =>  {
    browserApi.storage.sync.set({copyEnabled: true}, function() {
        console.log(browserApi.i18n.getMessage("extName") + " " + browserApi.i18n.getMessage("installedMessage"));
        
        // 正确的方式：在回调中获取存储值
        browserApi.storage.sync.get('copyEnabled', function(data) {
            console.log('初始化时存储的值:', data);
            console.log('copyEnabled:', data.copyEnabled);
        });
        
        // 设置初始图标状态
        updateIcon(true);
    });

    if (details.reason === browserApi.runtime.OnInstalledReason.INSTALL) {
        browserApi.runtime.setUninstallURL('https://forms.gle/Qm4ASuPqckZaYpBE9');
    }

});


// 监听来自popup的消息
browserApi.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateIcon') {
        updateIcon(request.enabled);
        sendResponse({success: true});
    }
});

// 监听存储变化，同步图标状态
browserApi.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.copyEnabled) {
        console.log('存储变化 - copyEnabled:', changes.copyEnabled.newValue);
        updateIcon(changes.copyEnabled.newValue);
    }
});
