module.exports = `
var handlers = {};
window.bridge = window.bridge || {};

function sendToNative(name, options) {
    window.postMessage(JSON.stringify({ name: name, options: options }));
}

window.bridge.callHandler = function (name, options) {
    sendToNative(name, options);
};

window.bridge.registerHandler = function (name, handler) {
    handlers[name] = handlers[name] || [];
    handlers[name].push(handler);
};

window.addEventListener('message', function (ev) {
    var data = JSON.parse(ev.data);
    var name = data.name;
    if (handlers[name]) {
        handlers[name].forEach(function (handle) {
            handle(data.options)
        }, this);
    }
});

var registeLinkPress = function () {
    var list = document.querySelectorAll('a');
    for (var i = 0; i < list.length; i++) {
        var element = list[i];
        element.addEventListener('click', function (e) {
            e.preventDefault();
            sendToNative('_toNative::onLinkPress', e.currentTarget.href);
        });
    }
};

if (document.readyState !== 'complete') {
    window.addEventListener('load', registeLinkPress);
} else {
    registeLinkPress();
}
`;