function createCompareCanvas(text1, text2) {
    let margin = 10;
    let body = document.body;
    body.style.margin = '0px';
    body.style.padding = '0px';
    let w = window.innerWidth;
    let h = window.innerHeight;
    let width = w - margin * 2;
    let height = (h - margin * 3) / 2;
    let flag = false;
    if (w > h) {
        width = (w - margin * 3) / 2;
        height = h - margin * 2;
        flag = true;
    }
    let left = margin;
    let top = margin;
    createCanvas('webgl', text1);
    if (flag) {
        left = width + margin * 2;
        top = margin;
    } else {
        left = margin;
        top = height + margin * 2;
    }
    createCanvas('canvas', text2);

    function createCanvas(id, text) {

        let webglCanvas = document.createElement('canvas');
        webglCanvas.style.display = 'block';
        webglCanvas.style.position = 'absolute';
        webglCanvas.style.left = left + 'px';
        webglCanvas.style.top = top + 'px';
        webglCanvas.style.backgroundColor = 'black';
        webglCanvas.id = id;
        webglCanvas.width = width;
        webglCanvas.height = height;
        webglCanvas.style.width = webglCanvas.width + "px";
        webglCanvas.style.height = webglCanvas.height + "px";
        // webglCanvas.style.margin = margin + 'px';

        let div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.zIndex = '0';

        div.style.color = "#ffffff";
        div.style.left = left + margin + 'px';
        div.style.top = margin + top + 'px';
        if (text)
            div.innerText = text;

        document.body.append(webglCanvas);
        document.body.append(div);
    }

    return {id1: 'webgl', id2: 'canvas'};
}

function createOneFullCanvas(text) {
    let margin = 10;
    let body = document.body;
    body.style.margin = '0px';
    body.style.padding = '0px';
    let w = window.innerWidth;
    let h = window.innerHeight;
    createCanvas('webgl');

    function createCanvas(id) {
        let webglCanvas = document.createElement('canvas');
        webglCanvas.style.display = 'block';
        webglCanvas.style.backgroundColor = 'black';
        webglCanvas.id = id;
        webglCanvas.style.margin = margin + 'px';
        webglCanvas.width = w - margin * 2;
        webglCanvas.height = h - margin * 2;
        webglCanvas.style.width = webglCanvas.width + "px";
        webglCanvas.style.height = webglCanvas.height + "px";
        let div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.zIndex = '0';
        div.style.left = margin * 2 + 'px';
        div.style.top = margin * 2 + 'px';
        div.style.color = "#ffffff";
        if (text)
            div.innerText = text;

        document.body.append(webglCanvas);
        document.body.append(div);
    }
}