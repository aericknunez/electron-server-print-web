const {app, BrowserWindow, Tray, Menu, dialog} = require('electron');
const path = require("path");
let mainWindow;

// Verificar si ya hay una instancia de la aplicación ejecutándose
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit(); // Cerrar la segunda instancia
}

function createMainWindow() {
    let win = new BrowserWindow({
        width: 400,
        height: 300,
        icon: path.join(__dirname, '/img/hibrido.ico'),
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar: true,
        center: true,
        thickFrame: true,
    });



    // and load the index.html of the app.
    win.loadFile('index.html')

    let tray = null;
    win.on('minimize', function (event) {
        event.preventDefault();
        win.setSkipTaskbar(true);
        tray = createTray();

     
          dialog.showMessageBox(null, {
            type: 'info',
            title: 'Aplicación minimizada',
            message: 'La aplicación ha sido minimizada. Pero sigue activa en la barra de tareas',
            buttons: ['OK']
          });
    });

    win.on('restore', function (event) {
        win.show();
        win.setSkipTaskbar(false);
        tray.destroy();
    });


    return win;
}

function createTray() {
    let appIcon = new Tray(path.join(__dirname, "/img/hibrido.ico"));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Mostrar', click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Salir', click: function () {
                app.isQuiting = true;
                const response = dialog.showMessageBoxSync(mainWindow, {
                    type: 'warning',
                    title: 'Cerrar aplicación',
                    message: '¿Estás seguro que quieres cerrar la aplicación? Al Cerrar ya las impresiones remotas ya no seguiran ejecutandose',
                    buttons: ['Cancel', 'Yes']
                  });
              
                  if (response === 0) {
                     mainWindow.show();
                    } else {
                      app.quit()
                    }
            }
        }
    ]);

    appIcon.on('double-click', function (event) {
        mainWindow.show();
    });
    appIcon.setToolTip('Mostar impresiones sistema de ventas');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
}

app.whenReady().then(() => {
    mainWindow = createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        const response = dialog.showMessageBoxSync(mainWindow, {
            type: 'warning',
            title: 'Cerrar aplicación',
            message: '¿Estás seguro que quieres cerrar la aplicación? Al Cerrar ya las impresiones remotas ya no seguiran ejecutandose',
            buttons: ['Cancel', 'Yes']
          });
      
          if (response === 0) {
              createMainWindow();
            } else {
              app.quit()
            }
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});