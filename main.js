const {
    app,
    BrowserWindow,
    protocol,
    net,
    Notification,
    ipcMain,
    Tray,
    Menu,
    shell,
    session,
    desktopCapturer
} = require('electron')
const path = require('path');

let mainWindow;
let tray;

if (!app.requestSingleInstanceLock()) {
    console.error('another instance is already running');
    app.quit();
}

protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {standard: true, secure: true, supportFetchAPI: true, allowServiceWorkers: true}}
]);

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        title: "Sable Client",
        icon: path.join(__dirname, 'favicon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.removeMenu();
    mainWindow.webContents.setWindowOpenHandler(({url}) => {
        if (new URL(url).protocol !== 'app:') {
            shell.openExternal(url);
            return {action: 'deny'};
        }
        return {action: 'allow'};
    });
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (new URL(url).protocol !== 'app:') {
            event.preventDefault();
            shell.openExternal(url);
        }
    });
    mainWindow.loadURL('app://sable/');
}

function createTray() {
    try {
        tray = new Tray(path.join(__dirname, 'tray-icon.png'));
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Open Sable Client', click: () => {
                    if (mainWindow) {
                        mainWindow.show();
                        mainWindow.focus();
                    } else {
                        createWindow();
                    }
                }
            },
            {type: 'separator'},
            {
                label: 'Quit', click: () => {
                    app.quit();
                }
            }
        ]);
        tray.setContextMenu(contextMenu);
        tray.setToolTip('Sable Client');
        tray.on('click', () => {
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            } else {
                createWindow();
            }
        });
        return tray;
    } catch (err) {
        console.error('failed to create tray:', err);
    }
}

app.whenReady().then(() => {
    const appDir = path.join(__dirname, 'sable', 'dist');

    protocol.handle('app', (request) => {
        const url = new URL(request.url);
        const filePattern = /^\/(config\.json$|manifest\.json$|sw\.js$|pdf\.worker\.min\.js$|public\/|assets\/|element-call\/dist\/)/;
        const filePath = path.join(appDir, filePattern.test(url.pathname) ? url.pathname : '/index.html');
        return net.fetch('file://' + filePath);
    });

    createWindow();
    createTray();

    // this might request the notification permission if it isn't already granted
    new Notification();

    const allowedPermissions = new Set(['media', 'speaker-selection', 'notifications', 'display-capture', 'background-sync']);
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        return allowedPermissions.has(permission);
    })

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const url = new URL(webContents.getURL());
        callback(url.protocol === 'app:' && allowedPermissions.has(permission));
    });

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({types: ['screen']}).then((sources) => {
            if (sources && sources.length > 0) {
                callback({video: sources[0], audio: 'loopback'});
            }
        }).catch(err => {
            console.error('Error getting desktop sources:', err);
        });
    });
});

ipcMain.on('notify', (event, {title, body}) => {
    new Notification({
        title: title,
        body: body,
        icon: path.join(__dirname, 'favicon.png'),
        silent: false,
    }).show();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (mainWindow) {
        mainWindow.show();
    } else {
        createWindow();
    }
})
