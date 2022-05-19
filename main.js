// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog} = require('electron')
const path = require('path')
var mainWindow;
const menu = new Menu
const fs = require('fs')
const CfgPath = path.join(__dirname, "/cfg")
const defCfg = {
  number_size: "14px",
  linescount_padding: "2px"
}
var RecentFiles = new Map([])

function AddrecentFile(Path) {
  let key = "file" + (RecentFiles.size);
  RecentFiles.set(key, Path);
}

if (!fs.existsSync(CfgPath)){
  fs.mkdirSync(CfgPath)
}
if (!fs.existsSync(CfgPath + "/settings.json")){
  fs.writeFileSync(CfgPath + "/settings.json", JSON.stringify(defCfg), (error) => {
    if (error){
      console.log(error.stack)
    }
  })
}
let openedFilePath

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

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
        AddrecentFile(filePath)
        fileName = path.basename(filePath);
        openedFilePath = filePath;
        mainWindow.webContents.send("FILE_OPENED", content, fileName)
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
        console.log(error)
      }else{
        AddrecentFile(filePath)
        fileName = path.basename(filePath);
        mainWindow.webContents.send("FILE_CREATED", fileName)
      }
    })
  })
})
  ipcMain.on("CHANGE_CFG", (_, value, element) => {
    mainWindow.webContents.send("CHANGE_CFG_REPLY", value, element)
  })
  ipcMain.on("RECENT_FILE_CLICKED", (_, id) => {
    let filePath = RecentFiles.get(id);
    fs.readFile(filePath, "utf8", (error, content) => {
      if (error){
        console.log(error)
      } else {
        let fileName = path.basename(filePath);
        openedFilePath = filePath;
        mainWindow.webContents.send("FILE_OPENED", content, fileName)
      }
    })
  })
  ipcMain.on("CHANGE_BACKGROUND_IMAGE", () => {
    dialog.showOpenDialog(mainWindow, {
      filters: [{name: "all files", extensions: ""}]
    }).then(({ filePaths }) => {
      if (filePaths[0] == null){
      } else {
        console.log(filePaths[0])
        let filePath = "url(" + filePaths[0] + ")"
        mainWindow.webContents.send("CHANGE_CFG_REPLY", filePaths[0], "background_image")
      }
    })
  })
}

Menu.setApplicationMenu(menu)
menu.append(new MenuItem({
  label: 'Preferences',
    click: _ => {
      let prefWindow = new BrowserWindow({ width: 700, height: 500, resizable: false , webPreferences: {
        preload: path.join(__dirname, "preferences.js"),
        parent: mainWindow,
      }
      })
      prefWindow.loadFile("preferences.html")
      //prefWindow.webContents.openDevTools()
      prefWindow.show()
      // on window closed
    },
  },
  ))

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
