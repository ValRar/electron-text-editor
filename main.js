// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog} = require('electron')
const path = require('path')
const menu = new Menu
const fs = require('fs')

let mainWindow
let openedFilePath

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  const ctxMenu = new Menu();
  ctxMenu.append(new MenuItem({ role: 'copy', accelerator: 'Ctrl+C'}))
  ctxMenu.append(new MenuItem({ role: 'cut', accelerator: 'Ctrl+X'}))
  ctxMenu.append(new MenuItem({ role: 'delete'}))
  ctxMenu.append(new MenuItem({ role: 'selectAll', accelerator: 'Ctrl+A'}))
  ctxMenu.append(new MenuItem({ role: 'undo', accelerator: 'Ctrl+Z'}))
  mainWindow.webContents.on('context-menu', function(e, params){
  ctxMenu.popup(mainWindow, params.x, params.y)
})

ipcMain.on("OPEN_FILE", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{name: "text files", extensions: "txt"}]
  }).then(({ filePaths }) => {
    const filePath = filePaths[0]
    app.addRecentDocument(filePath);
    fs.readFile(filePath, "utf8", (error, content) => {
      if (error){
        console.log("error")
      }else{
        openedFilePath = filePath
        mainWindow.webContents.send("FILE_OPENED", content)
      }
    })
  })
})

//mainWindow.webContents.openDevTools()
}

Menu.setApplicationMenu(menu)
menu.append(new MenuItem({
  label: 'Electron',
  submenu: [{
    role: 'copy',
    accelerator: 'Ctrl+C'
  }]
  
}))
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.on('CREATE_FILE', () => {
  dialog.showSaveDialog(mainWindow, {
    filters: [{name: "text files", extensions: ["txt"]}]
  }).then(({ filePath }) => {
    openedFilePath = filePath
    fs.writeFile(filePath, "", (error) => {
      if (error){
        console.log("error")
      }
    })
  })
})

ipcMain.on("FILE_CHANGED", (_, content) => {
  if (openedFilePath != null){
  fs.writeFile(openedFilePath, content, (error) => {
    if (error){
      console.log("error")
    }
  })
}
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
