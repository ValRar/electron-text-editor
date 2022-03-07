const { ipcRenderer } = require("electron")

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        createButton: document.getElementById("createButton"),
        textArea: document.getElementById("textarea"),
        linecounter: document.getElementById("lines-count"),
        openButton: document.getElementById("openButton")
    }
    el.createButton.addEventListener('click', () => {
        ipcRenderer.send('CREATE_FILE')
    })
    el.textArea.addEventListener('input', (e) => {
        ipcRenderer.send("FILE_CHANGED", e.target.value)
        var text = ""
        for (let i = 1;i < el.textArea.value.split("\n").length + 1; i++){
            text += i + ".\n"
        }
        el.linecounter.innerHTML = text;
    })
    el.openButton.addEventListener('click', () => {
        ipcRenderer.send("OPEN_FILE")
    })
    ipcRenderer.on("FILE_OPENED", (_, content) =>{
        el.textArea.value = content;
        var text = ""
        for (let i = 1;i < content.split('\n').length + 1; i++){
            text += i + ".\n"
        }
        el.linecounter.innerHTML = text
    })
})