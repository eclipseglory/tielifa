# TieLiFa(铁力发)
Javascript canvas rendering context 2d implement with webgl
# How to use
Import ```tielifa.js``` or ```tielifa.min.js```, create a new context object like this : 
```Javascript
let canvas = document.getElementById('someid');// Get the canvas element object
let ctx = new tielifa.WebGl2D(canvas);
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
TieLiFa does not paint immediately when user execute ```fill,stroke or drawImage```, it need user to invoke ```draw``` method.
# What TieLiFa implements
## Properties

Properties | Support
------------ | -------------
```canvas``` | <span style="color:red">Yes</span>

| Properties    | Support | Different |
| ------| ------  | ------ |
| ```fillStyle``` | ```fillStyle``` | none |
| ```strokeStyle``` | ```strokeStyle``` | none |
## Methods
| CanvasRendingContext2D    | TieLiFa | Different |
| ------| ------  | ------ |
| ```save()``` | ```save()``` | none |
| ```restore()```| ```restore()``` | none |
| ```clearRect(x,y,w,h)```| ```clearRect()``` | just clean whole canvas |
| ```beginPath()```| ```beginPath()``` | none |
| ```closePath()```| ```closePath()``` | none |
| ```fill()```| ```fill()``` | none |
| ```stroke()```| ```stroke()``` | none |
| ```rotate(radian)```| ```rotate(radian)``` | none |
| ```translate(x,y)```| ```translate(x,y,z)``` | accpet depth paramter |
| ```moveTo(x,y)```| ```moveTo(x,y,z)``` | accpet depth paramter |
| ```lineTo(x,y)```| ```lineTo(x,y,z)``` | accpet depth paramter |
| ```arc(x,y,radius,startAngel,endAngel,anticlockwise)```| ```arc(x,y,radius,startAngel,endAngel,anticlockwise)``` | none |
| ```ellipse(x,y,radiusX,radiusY,rotation,startAngel,endAngel,anticlockwise)```| ```ellipse(x,y,radiusX,radiusY,rotation,startAngel,endAngel,anticlockwise)``` | none |
| ```drawImage(image,tx,ty,tw,th,sx,sy,sw,sh)```| ```drawImage(image,tx,ty,tw,th,sx,sy,sw,sh)``` | none |
| ```rect(x,y,w,h)```| ```rect(x,y,w,h)``` | none |
| ```fillRect(x,y,w,h)```| ```fillRect(x,y,w,h)``` | none |
# Example
- [Animation](https://codepen.io/eclipseglory/pen/zyaaJj)
- [Extend Methods](https://codepen.io/eclipseglory/pen/GPGGvb)