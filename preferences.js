const ipcRenderer = require('electron')
input = document.getElementsByTagName("input")
input[0].addEventListener('keyup', () => {
    ipcRenderer.send("CHANGE_NUMBER_SIZE", input[0].value)
})