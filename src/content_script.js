(function() {

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
    let copyEnabled = true;

    function enableCopy() {
        copyEnabled = true;
        applyChanges();
    }

    function disableCopy() {
        copyEnabled = false;
        applyChanges();
    }

    function applyChanges() {
        if (copyEnabled) {
            enableTextSelection();
            overrideDefaultBehaviors();
            addEventListeners();
            injectCustomScripts();
        } else {
            removeEventListeners();
            removeInjectedScripts();
        }
    }

    function enableTextSelection() {
        const css = `
            * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
        `;
        const style = document.createElement('style');
        style.id = 'copyNinjaStyle';
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    function overrideDefaultBehaviors() {
        document.oncontextmenu = null;
        document.onselectstart = null;
        document.ondragstart = null;
        document.onmousedown = null;
        document.body.style.userSelect = 'auto';
        document.body.style.webkitUserSelect = 'auto';
        document.body.style.MozUserSelect = 'auto';
        document.body.style.msUserSelect = 'auto';
    }

    function addEventListeners() {
        document.addEventListener('copy', handleCopy, true);
        document.addEventListener('cut', handleCopy, true);
        document.addEventListener('contextmenu', handleContextMenu, true);
        document.addEventListener('selectstart', handleSelectStart, true);
        document.addEventListener('mousedown', handleMouseDown, true);
        document.addEventListener('keydown', handleKeyDown, true);
    }

    function removeEventListeners() {
        document.removeEventListener('copy', handleCopy, true);
        document.removeEventListener('cut', handleCopy, true);
        document.removeEventListener('contextmenu', handleContextMenu, true);
        document.removeEventListener('selectstart', handleSelectStart, true);
        document.removeEventListener('mousedown', handleMouseDown, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        const style = document.getElementById('copyNinjaStyle');
        if (style) style.remove();
    }

    function handleCopy(e) {
        e.stopPropagation();
    }

    function handleContextMenu(e) {
        e.stopPropagation();
        return true;
    }

    function handleSelectStart(e) {
        e.stopPropagation();
        return true;
    }

    function handleMouseDown(e) {
        if (e.button === 2) { // 右键点击
            e.stopPropagation();
            return true;
        }
    }

    function handleKeyDown(e) {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'x')) {
            const selectedText = getSelectedText();
            if (selectedText) {
                e.preventDefault();
                e.stopPropagation();
                copyToClipboard(selectedText);
            }
        } else if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            e.stopPropagation();
            forceCopy();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            e.stopPropagation();
            const allText = extractAllText();
            copyToClipboard(allText);
        }
    }

    function getSelectedText() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const clonedContents = range.cloneContents();
            const div = document.createElement('div');
            div.appendChild(clonedContents);
            return div.innerText;
        }
        return '';
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            fallbackCopyToClipboard(text);
        });
    }

    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            console.log('Fallback: Text copied to clipboard');
        } catch (err) {
            console.error('Fallback: Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    }

    function forceCopy() {
        const selectedText = getSelectedText();
        if (selectedText) {
            copyToClipboard(selectedText);
        } else {
            const allText = extractAllText();
            copyToClipboard(allText);
        }
    }

    function extractAllText() {
        // 针对飞书文档的特殊处理
        if (window.location.hostname.includes('larkoffice.com')) {
            return extractLarkDocText();
        }
        return document.body.innerText;
    }

    function extractLarkDocText() {
        const contentElements = document.querySelectorAll('[data-slate-node="element"]');
        let text = '';
        contentElements.forEach(element => {
            text += element.textContent + '\n';
        });
        return text.trim();
    }

    function injectCustomScripts() {
        const script = document.createElement('script');
        script.id = 'copyNinjaScript';
        script.src = browserApi.runtime.getURL('inject.js'); // 修复：使用正确的文件名
        (document.head || document.documentElement).appendChild(script);
    }

    function removeInjectedScripts() {
        const script = document.getElementById('copyNinjaScript');
        if (script) script.remove();
    }

    // 监听来自 popup 的消息
    browserApi.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'toggleCopy') {
            if (request.enabled) {
                enableCopy();
            } else {
                disableCopy();
            }
        }
    });

    // 初始化时检查状态
    browserApi.storage.sync.get('copyEnabled', function(data) {
        console.log("初始化检查状态 copyEnabled" + data.copyEnabled);
        if (data.copyEnabled !== false) {
            enableCopy();
        } else {
            disableCopy();
        }
    });

    // 应用初始更改
    applyChanges();
})();
