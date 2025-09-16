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

// i18n.js
function getLocalizedMessage(messageName) {
    return browserApi.i18n.getMessage(messageName) || messageName;
}

function localizeHtmlPage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const message = getLocalizedMessage(element.getAttribute('data-i18n'));
        element.textContent = message;
    });
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getLocalizedMessage, localizeHtmlPage };
}

// 在全局作用域中也可以使用
if (typeof window !== 'undefined') {
    window.getLocalizedMessage = getLocalizedMessage;
    window.localizeHtmlPage = localizeHtmlPage;
}

// 自动执行本地化（用于直接引用的场景）
document.addEventListener('DOMContentLoaded', localizeHtmlPage);
