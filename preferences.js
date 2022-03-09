const ipcRenderer = require('electron')
window.addEventListener('DOMContentLoaded', () => {
    var input = document.getElementsByTagName("input")
    input[0].addEventListener('keyup', () => {
        ipcRenderer.ipcRenderer.send("CHANGE_NUMBER_SIZE", input[0].value)
})
})
