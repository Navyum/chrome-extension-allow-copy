
(function() {
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
        if (prop === 'oncopy' || prop === 'oncut' || prop === 'onpaste') {
            return obj;
        }
        return originalDefineProperty.call(this, obj, prop, descriptor);
    };
    
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'copy' || type === 'cut' || type === 'paste') {
            return;
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
})();