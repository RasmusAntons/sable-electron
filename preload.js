const {contextBridge, ipcRenderer, webFrame} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendNotification: (title, body) => ipcRenderer.send('notify', {title, body})
});

webFrame.executeJavaScript(`
    window.Notification = function(title, options) {
        electronAPI.sendNotification(title, options.body || '');
        return {onclick: null, close: () => {}};
    };
    window.Notification.permission = 'granted';
    window.Notification.requestPermission = (cb) => {
        if (cb)
           cb('granted');
        return Promise.resolve('granted');
    };
`);
