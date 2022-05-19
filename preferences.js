const {ipcRenderer} = require('electron')
const path = require('path')
const fs = require('fs')
const { dialog } = require('electron')
console.log("preferences started");
const cfgPath = path.join(__dirname, "/cfg/settings.json")
window.addEventListener('DOMContentLoaded', () => {
    let Cfg = JSON.parse(fs.readFileSync(cfgPath))
    var input = document.getElementsByTagName("input")
    var backButton = document.getElementById("backButton");
    input[0].value = Cfg["number_size"]
    input[1].value = Cfg["linescount_padding"]
    input[0].addEventListener('keyup', () => {
        let element = "number_size";
        ipcRenderer.send("CHANGE_CFG", input[0].value, element)
    })
    input[1].addEventListener('keyup', () => {
        let element = "linescount_padding";
        ipcRenderer.send("CHANGE_CFG", input[1].value, element)
    })
    input[2].addEventListener('click', () => {
        ipcRenderer.send("CHANGE_BACKGROUND_IMAGE")
    })
    backButton.addEventListener('click', () => {
        ipcRenderer.send("ESCAPE_FROM_PREFS");
    })
})
