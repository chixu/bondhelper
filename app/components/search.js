let panel = document.getElementById('searchPanel');
let input = panel.children[0];
let inputShown = false;
let ctrlF = false;
panel.style.display = 'none';


document.addEventListener('keydown', function (event) {
    if (event.code == 'KeyF' && (event.ctrlKey || event.metaKey)) {
        // console.log(ctrlF);
        // if (!ctrlF) {
        //     ctrlF = true;
        if (!inputShown) {
            inputShown = true;
            panel.style.display = 'block';
            input.focus();
        } else {
            inputShown = false;
            panel.style.display = 'none';
        }
    }
    if (event.keyCode == 13) {
        if (input.value && inputShown)
            window.find(input.value);
    }
    // }
});

document.addEventListener('keyup', function (event) {
    // console.log('up', event);
    // if (event.code == 'KeyF') {
    //     ctrlF = false;
    //     console.log(ctrlF);
    // }
});