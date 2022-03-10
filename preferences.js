const ipcRenderer = require('electron')
const path = require('path')
const fs = require('fs')
const cfgPath = path.join(__dirname, "/cfg/settings.json")
window.addEventListener('DOMContentLoaded', () => {
    let Cfg = JSON.parse(fs.readFileSync(cfgPath))
    var input = document.getElementsByTagName("input")
    input[0].value = Cfg["number_size"]
    input[0].addEventListener('keyup', () => {
        ipcRenderer.ipcRenderer.send("CHANGE_NUMBER_SIZE", input[0].value)
})
})
