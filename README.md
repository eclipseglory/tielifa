# What's TieLiFa
TieLiFa(铁力发) is a library implements Javascript canvas rendering context 2d with webgl.
# How to use
Import ```tielifa.js``` or ```tielifa.min.js```, create a new context object like this : 
```Javascript
let canvas = document.getElementById('someid');// Get the canvas element object
let ctx = new tielifa.WebGL2D(canvas);
```
Use this ```ctx``` to draw something like the CanvasRendingContext2D.

CanvasRendingContext2D:
```javascript
ctx.save();
ctx.translate(10,10);
ctx.fillStyle = 'red';
ctx.rect(0,0,100,100);
ctx.fill();
ctx.restore();
```
TieLiFa:
```javascript
ctx.save();
ctx.translate(10,10);
ctx.fillStyle = 'red';
ctx.rect(0,0,100,100);
ctx.fill();
ctx.restore();

ctx.draw();
```
TieLiFa does not paint immediately when user invoke ```fill,stroke or drawImage```, it need user to invoke ```draw``` method.
# What TieLiFa implements

Property | Support | Example
------ | ------- | -------
```canvas```| :heavy_check_mark:
```fillStyle```| :heavy_check_mark:|[fill a rectangle](https://codepen.io/eclipseglory/pen/VqoMXB)
```font```| :x:
```globalAlpha```| :heavy_check_mark:|[two rectangles](https://codepen.io/eclipseglory/pen/MZNEBj)
```globalCompositeOperation```| :x:
```imageSmoothingEnabled```| :x:
```lineCap```| :x:
```lineDashOffset```| :x:
```lineJoin```| :x:
```lineWidth```| :heavy_check_mark:|[rect and line](https://codepen.io/eclipseglory/pen/wRVrYw)
```miterLimit```| :x:
```shadowBlur```| :x:
```shadowColor```| :x:
```shadowOffsetX```| :x:
```shadowOffsetY```| :x:
```strokeStyle```| :heavy_check_mark:|[rect and line](https://codepen.io/eclipseglory/pen/wRVrYw)
```textAlign```| :heavy_check_mark:
```textBaseline```| :heavy_check_mark:

Method | Support | Example
------ | ------- | -------
```arc()```| :heavy_check_mark:|[some arcs](https://codepen.io/eclipseglory/pen/GPVMVb)
```arcTo()```| :heavy_check_mark:|[change arc radius](https://codepen.io/eclipseglory/pen/qgWeje)
```beginPath()```| :heavy_check_mark:|[tow lines](https://codepen.io/eclipseglory/pen/ZVgaEJ)
```bezierCurveTo()```| :heavy_check_mark:|[cubic bezier](https://codepen.io/eclipseglory/pen/PXMOwo)
```clearRect()```| :warning:|just clear whole canvas
```clip()```| :x:
```closePath()```| :heavy_check_mark:|[a triangle](https://codepen.io/eclipseglory/pen/MZNOwo)
```createImageData()```| :heavy_check_mark:
```createLinearGradient()```| :x:
```createPattern()```| :x:
```createRadialGradient()```| :x:
```drawFocusIfNeeded()```| :x:
```drawImage()```| :heavy_check_mark:|[rotating image](https://codepen.io/eclipseglory/pen/zyaaJj)
```ellipse()```| :heavy_check_mark:|[Example1](https://codepen.io/eclipseglory/pen/VqorjN) [Example2](https://codepen.io/eclipseglory/pen/roXYMJ)
```fill()```| :heavy_check_mark:|[fill a rectangle](https://codepen.io/eclipseglory/pen/VqoMXB)
```fillRect()```| :heavy_check_mark:|[two rectangles](https://codepen.io/eclipseglory/pen/MZNEBj)
```fillText()```| :heavy_check_mark:
```getImageData()```| :x:
```getLineDash()```| :x:
```isPointInPath()```| :x:
```isPointInStroke()```| :x:
```lineTo()```| :heavy_check_mark:|[tow lines](https://codepen.io/eclipseglory/pen/ZVgaEJ)
```measureText()```| :heavy_check_mark:
```moveTo()```| :heavy_check_mark:|[tow lines](https://codepen.io/eclipseglory/pen/ZVgaEJ)
```putImageData()```| :x:
```quadraticCurveTo()```| :heavy_check_mark:|[quadratic bezier](https://codepen.io/eclipseglory/pen/ebqeWV)
```rect()```| :heavy_check_mark:|[rect and line](https://codepen.io/eclipseglory/pen/wRVrYw)
```restore()```| :heavy_check_mark:|[save/restore color](https://codepen.io/eclipseglory/pen/EGqbXe)
```rotate()```| :heavy_check_mark:|[rotate rectangle](https://codepen.io/eclipseglory/pen/bOXYrB)
```save()```| :heavy_check_mark:|[save/restore color](https://codepen.io/eclipseglory/pen/EGqbXe)
```scale()```| :heavy_check_mark:|[scale rect](https://codepen.io/eclipseglory/pen/XovzaY)
```setLineDash()```| :x:
```setTransform()```| :heavy_check_mark:|[skewing rect](https://codepen.io/eclipseglory/pen/maNqBy)
```stroke()```| :heavy_check_mark:|[tow lines](https://codepen.io/eclipseglory/pen/ZVgaEJ)
```strokeRect()```| :heavy_check_mark:
```strokeText()```| :x:
```transform()```| :heavy_check_mark:|[skewing rect](https://codepen.io/eclipseglory/pen/maNqBy)
```translate()```| :heavy_check_mark:|[rotating image](https://codepen.io/eclipseglory/pen/zyaaJj)
