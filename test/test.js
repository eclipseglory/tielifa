


function createTestCanvas(){
    let margin = 10;
    let body = document.body;
    body.style.margin = margin;
    body.style.padding = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;
    createCanvas('webgl');
    createCanvas('canvas');
    function createCanvas(id){
        let webglCanvas = document.createElement('canvas');
        webglCanvas.style.display = 'block';
        webglCanvas.style.backgroundColor = 'black';
        webglCanvas.id = id;
        webglCanvas.width = w - margin*2;
        webglCanvas.height = h/2 - margin*2;
        webglCanvas.style.width = webglCanvas.width + "px";
        webglCanvas.style.height = webglCanvas.height + "px";
        document.body.append(webglCanvas);
    }
}
