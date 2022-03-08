const { ipcRenderer } = require("electron")
const path = require("path")

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        createButton: document.getElementById("createButton"),
        textArea: document.getElementById("textarea"),
        linecounter: document.getElementById("lines-count"),
        openButton: document.getElementById("openButton"),
        file1: document.getElementById("file1"),
        file2: document.getElementById("file2"),
        file3: document.getElementById("file3")
    }
    var filepaths = {
        file1: "",
        file2: "",
        file3: ""
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
    ipcRenderer.on("FILE_OPENED", (_, content, filePath, count) =>{
        el.textArea.value = content;
        var text = ""
        for (let i = 1;i < content.split('\n').length + 1; i++){
            text += i + ".\n"
        }
        el.linecounter.innerHTML = text
        if (filePath != filepaths.file1 && filePath != filepaths.file2 && filePath != filepaths.file3){
            var filename = path.basename(filePath)
            switch (count){
                case 1:
                    el.file1.innerHTML = filename
                    filepaths.file1 = filePath
                    break;
                case 2:
                    el.file2.innerHTML = filename
                    filepaths.file2 = filePath
                    break;
                case 3:
                    el.file3.innerHTML = filename
                    filepaths.file3 = filePath
                    break;
            }
        }
    })
    ipcRenderer.on("FILE_CREATED", (_, count, filePath) => {
        if (filePath != filepaths.file1 && filePath != filepaths.file2 && filePath != filepaths.file3){
            var filename = path.basename(filePath)
            switch (count){
                case 1:
                    el.file1.innerHTML = filename
                    filepaths.file1 = filePath
                    break;
                case 2:
                    el.file2.innerHTML = filename
                    filepaths.file2 = filePath
                    break;
                case 3:
                    el.file3.innerHTML = filename
                    filepaths.file3 = filePath
                    break;
            }
        }
    })
    el.file1.addEventListener('click', () => {
        ipcRenderer.send("OPEN_RECENT_FILE", filepaths.file1)
    })
    el.file2.addEventListener('click', () => {
        ipcRenderer.send("OPEN_RECENT_FILE", filepaths.file2)
    })
    el.file3.addEventListener('click', () => {
        ipcRenderer.send("OPEN_RECENT_FILE", filepaths.file3)
    })
})