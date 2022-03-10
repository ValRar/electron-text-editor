// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog} = require('electron')
const path = require('path')
const menu = new Menu
const fs = require('fs')
const CfgPath = path.join(__dirname, "/cfg")
const defCfg = {
  number_size: "14px"
}

if (!fs.existsSync(CfgPath)){
  fs.mkdirSync(CfgPath)
}
if (!fs.existsSync(CfgPath + "/settings.json")){
  fs.writeFileSync(CfgPath + "/settings.json",JSON.stringify(defCfg), (error) => {
    if (error){
      console.log(error.stack)
    }
  })
}

require("electron-reloader")
let openedFilePath

var openedFiles = {
  file1: "",
  file2: "",
  file3: "",
  currentfile: 1,
  allFilled: false
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.


  mainWindow.webContents.openDevTools()
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
    filters: [{name: "all files", extensions: ""}]
  }).then(({ filePaths }) => {
    const filePath = filePaths[0]
    app.addRecentDocument(filePath);
    fs.readFile(filePath, "utf8", (error, content) => {
      if (error){
        console.log("error")
      }else{
        openedFilePath = filePath
        if (!openedFiles.allFilled){
          switch (openedFiles.currentfile){
            case 1:
              openedFiles.file1 = filePath
              break;
            case 2:
              openedFiles.file2 = filePath
              break;
            case 3:
              openedFiles.allFilled = true
              openedFiles.file3 = filePath
              break;
          }
        }
        else {
          openedFiles.file1 = filePath
        }
        mainWindow.webContents.send("FILE_OPENED", content, filePath, openedFiles.currentfile)
        if (openedFiles.currentfile < 3 && !openedFiles.allFilled){
          openedFiles.currentfile++
        } else{
          openedFiles.currentfile = 1
        }
      }
    })
  })
})

ipcMain.on('CREATE_FILE', () => {
  dialog.showSaveDialog(mainWindow, {
    filters: [{name: "all files", extensions: [""]}]
  }).then(({ filePath }) => {
    openedFilePath = filePath
    fs.writeFile(filePath, "", (error) => {
      if (error){
        console.log("error")
      }else{
        if (!openedFiles.allFilled){
          switch (openedFiles.currentfile){
            case 1:
              openedFiles.file1 = filePath
              break;
            case 2:
              openedFiles.file2 = filePath
              break;
            case 3:
              openedFiles.allFilled = true
              openedFiles.file3 = filePath
              break;
          }
        }
        else {
          openedFiles.file1 = filePath
        }
        mainWindow.webContents.send("FILE_CREATED", openedFiles.currentfile, filePath)
        if (openedFiles.currentfile < 3 && !openedFiles.allFilled){
          openedFiles.currentfile++
        } else{
          openedFiles.currentfile = 1
        }
      }
    })
  })
})
  ipcMain.on("OPEN_RECENT_FILE", (_, filePath) => {
    fs.readFile(filePath, "utf8", (error, content) => {
      if (error){
        console.log(error.stack)
      } else {
        mainWindow.webContents.send("FILE_OPENED", content, filePath, 1)
      }
    })
  })
  ipcMain.on("CHANGE_NUMBER_SIZE", (_, value) => {
    mainWindow.webContents.send("CHANGE_NUMBER_SIZE_REPLY", value)
  })
}

Menu.setApplicationMenu(menu)
menu.append(new MenuItem({
  label: 'electron',
  submenu: [{
    label: 'Preferences',
    click: _ => {
      let prefWindow = new BrowserWindow({ width: 500, height: 300, resizable: false , webPreferences: {
        preload: path.join(__dirname, "preferences.js"),
        //webSecurity: false,
        contextIsolation: false,
        nodeIntegration: true
      }
      })
      prefWindow.loadFile("preferences.html")
      prefWindow.webContents.openDevTools()
      prefWindow.show()
      // on window closed
    },
  },
]
  
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
