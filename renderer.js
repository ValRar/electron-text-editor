const { ipcRenderer } = require("electron")
const path = require("path")
const CfgPath = path.join(__dirname, "/cfg/settings.json")
const fs = require('fs')
var recentFileIndex = 0;
window.addEventListener("DOMContentLoaded", () => {
    const el = {
        createButton: document.getElementById("createButton"),
        textArea: document.getElementById("textarea"),
        linecounter: document.getElementById("lines-count"),
        openButton: document.getElementById("openButton"),
        recentFilesList: document.getElementById("recent-files")
    }

    let cfg = JSON.parse(fs.readFileSync(CfgPath))
    el.linecounter.style.fontSize = cfg["number_size"]
    el.linecounter.style.paddingTop = cfg["linescount_padding"]

    el.createButton.addEventListener('click', () => {
        ipcRenderer.send('CREATE_FILE')
    })
    el.textArea.addEventListener('input', (e) => {
        ipcRenderer.send("FILE_CHANGED", e.target.value)
        var text = ""
        for (let i = 1;i < el.textArea.value.split("\n").length + 1; i++){
            text += i + ".<br>"
        }
        el.linecounter.innerHTML = text;
    })
    el.openButton.addEventListener('click', () => {
        ipcRenderer.send("OPEN_FILE")
    })
    ipcRenderer.on("FILE_OPENED", (_, content, fileName) =>{
        el.textArea.value = content;
        var text = ""
        for (let i = 1;i < content.split('\n').length + 1; i++){
            text += i + ".<br>"
        }
        el.linecounter.innerHTML = text
        var unical = true;
        var recent = document.getElementsByClassName("recent-file");
        for (let i = 0; i < recent.length; i++){
            if (recent[i].textContent == fileName){
                unical = false;
            }
        }
        if (unical){
            el.recentFilesList.innerHTML += "<li class='recent-file', id='file" + recentFileIndex + "'>" + fileName + "</li>";
            for (let i = 0; i < recent.length; i++){
                recent[i].addEventListener('click', function() {
                    ipcRenderer.send("RECENT_FILE_CLICKED", this.id);
                })
            }
            recentFileIndex++;
        }
    })
    ipcRenderer.on("FILE_CREATED", (_, fileName) => {
        var unical = true;
        var recent = document.getElementsByClassName("recent-file");
        for (let i = 0; i < recent.length; i++){
            if (recent[i].textContent == fileName){
                unical = false;
            }
        }
        if (unical){
            el.recentFilesList.innerHTML += "<li class='recent-file', id='file" + recentFileIndex + "'>" + fileName + "</li>";
            recentFileIndex++;
            let interaction = document.getElementById("file" + recentFileIndex);
            interaction.addEventListener('click', () => {
                ipcRenderer.send("RECENT_FILE_CLICKED", interaction.id);
            })
            recentFileIndex++;
        }
    })
    ipcRenderer.on("CHANGE_CFG_REPLY", (_, value, element) => {
        //cfg[element] = value;
        //fs.writeFileSync(CfgPath, JSON.stringify(cfg))
        switch (element) {
            case "number_size": 
                el.linecounter.style.fontSize = value;
                break;
            case "linescount_padding":
                el.linecounter.style.paddingTop = value;
                break;
            case "background_image":
                el.textArea.style.backgroundImage = value;
                console.log(value)
                break;
                
        }
    })
    })
    
