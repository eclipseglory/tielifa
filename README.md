# TieLiFa(铁力发)
Javascript canvas rendering context 2d implement with webgl
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
```fillStyle```| :heavy_check_mark:
```font```| :x:
```globalAlpha```| :heavy_check_mark:
```globalCompositeOperation```| :x:
```imageSmoothingEnabled```| :x:
```lineCap```| :x:
```lineDashOffset```| :x:
```lineJoin```| :x:
```lineWidth```| :heavy_check_mark:
```miterLimit```| :x:
```shadowBlur```| :x:
```shadowColor```| :x:
```shadowOffsetX```| :x:
```shadowOffsetY```| :x:
```strokeStyle```| :heavy_check_mark:
```textAlign```| :x:
```textBaseline```| :x:

Method | Support | Example
------ | ------- | -------
```arc()```| :heavy_check_mark:
```arcTo()```| :x:
```beginPath()```| :heavy_check_mark:
```bezierCurveTo()```| :heavy_check_mark:
```clearRect()```| :warning:
```clip()```| :x:
```closePath()```| :heavy_check_mark:
```createImageData()```| :x:
```createLinearGradient()```| :x:
```createPattern()```| :x:
```createRadialGradient()```| :x:
```drawFocusIfNeeded()```| :x:
```drawImage()```| :heavy_check_mark:
```ellipse()```| :heavy_check_mark:
```fill()```| :heavy_check_mark:
```fillRect()```| :heavy_check_mark:
```fillText()```| :x:
```getImageData()```| :x:
```getLineDash()```| :x:
```isPointInPath()```| :x:
```isPointInStroke()```| :x:
```lineTo()```| :heavy_check_mark:
```measureText()```| :x:
```moveTo()```| :heavy_check_mark:
```putImageData()```| :x:
```quadraticCurveTo()```| :heavy_check_mark:
```rect()```| :heavy_check_mark:
```restore()```| :heavy_check_mark:
```rotate()```| :heavy_check_mark:
```save()```| :heavy_check_mark:
```scale()```| :heavy_check_mark:
```setLineDash()```| :x:
```setTransform()```| :heavy_check_mark:
```stroke()```| :heavy_check_mark:
```strokeRect()```| :heavy_check_mark:
```strokeText()```| :x:
```transform()```| :heavy_check_mark:
```translate()```| :heavy_check_mark:
