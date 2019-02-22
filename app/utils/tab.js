class TabContainer {
    constructor(id, defaultTab) {
        let container = document.getElementById(id);
        let childs = container.children;
        let tabs = {};
        let contents = {};
        if (childs.length == 1) {
            let child = childs[0];
            for (let j = 0; j < child.children.length; j++) {
                let tab = child.children[j];
                let tabname = child.children[j].getAttribute('value');
                defaultTab = defaultTab || tabname;
                tabs[tabname] = tab;
                tab.onclick = () => this.onTabClick(tabname);

                let content = document.createElement('div');
                content.className = 'tabcontent';
                content.style.overflow = 'scroll';
                // content.id = 
                contents[tabname] = content;
                container.appendChild(content);
            }
        } else {
            for (let i = 0; i < childs.length; i++) {
                let child = childs[i];
                if (child.className == 'tabcontent') {
                    let tabname = child.getAttribute('id')
                    contents[tabname] = child;
                } else {
                    for (let j = 0; j < child.children.length; j++) {
                        let tab = child.children[j];
                        let tabname = child.children[j].getAttribute('value');
                        defaultTab = defaultTab || tabname;
                        tabs[tabname] = tab;
                        tab.onclick = () => this.onTabClick(tabname);
                    }
                }
            }
        }
        // for (let i = 0; i < childs.length; i++) {
        //     // console.log(childs[i]);
        //     let child = childs[i];
        //     if (child.className == 'tab') {
        //         for (let j = 0; j < child.children.length; j++) {
        //             let tab = child.children[j];
        //             let tabname = child.children[j].getAttribute('value');
        //             defaultTab = defaultTab || tabname;
        //             tabs[tabname] = tab;
        //             tab.onclick = () => this.onTabClick(tabname);

        //             let content = document.createElement('div');
        //             content.className = 'tabcontent';
        //             content.style.overflow = 'scroll';
        //             // content.id = 
        //             contents[tabname] = content;
        //             container.appendChild(content);
        //         }
        //     }
        // }
        this.tabs = tabs;
        this.contents = contents;
        this.onTabClick(defaultTab);
    }

    onTabClick(name) {
        if (this.selected == name) return;
        this.selected = name;
        for (let k in this.contents) {
            this.contents[k].style.display = "none";
        }
        for (let k in this.tabs) {
            this.tabs[k].className = this.tabs[k].className.replace(" active", "");
        }
        this.contents[name].style.display = "block";
        this.tabs[name].className += " active";
        if (this.clickHandler) this.clickHandler(name);
    }
}



module.exports = {
    TabContainer: TabContainer
};