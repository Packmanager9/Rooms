

let keyimg = new Image()
keyimg.src = "keySheet.png"
let coinimg = new Image()
coinimg.src = "coinSheet.png"
let potionimg = new Image()
potionimg.src = "potionSheet4.png"
let bombimg = new Image()
bombimg.src = "bomb.png"



window.addEventListener('DOMContentLoaded', (event) => {
    const gamepadAPI = {
        controller: {},
        turbo: true,
        connect: function (evt) {
            if (navigator.getGamepads()[0] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[1] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[2] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[3] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            }
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] === null) {
                    continue;
                }
                if (!gamepads[i].connected) {
                    continue;
                }
            }
        },
        disconnect: function (evt) {
            gamepadAPI.turbo = false;
            delete gamepadAPI.controller;
        },
        update: function () {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.buttonsCache = [];// clear the buttons cache
            for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
                gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
            }
            gamepadAPI.buttonsStatus = [];// clear the buttons status
            var c = gamepadAPI.controller || {}; // get the gamepad object
            var pressed = [];
            if (c.buttons) {
                for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
                    if (c.buttons[b].pressed) {
                        pressed.push(gamepadAPI.buttons[b]);
                    }
                }
            }
            var axes = [];
            if (c.axes) {
                for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
                    axes.push(c.axes[a].toFixed(2));
                }
            }
            gamepadAPI.axesStatus = axes;// assign received values
            gamepadAPI.buttonsStatus = pressed;
            // console.log(pressed); // return buttons for debugging purposes
            return pressed;
        },
        buttonPressed: function (button, hold) {
            var newPress = false;
            for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
                if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
                    newPress = true;// set the boolean variable to true
                    if (!hold) {// if we want to check the single press
                        for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
                            if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
                                newPress = false;
                            }
                        }
                    }
                }
            }
            return newPress;
        },
        buttons: [
            'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
        ],
        buttonsCache: [],
        buttonsStatus: [],
        axesStatus: []
    };
    let canvas
    let canvas_context
    let keysPressed = {}
    let FLEX_engine
    let TIP_engine = {}
    let XS_engine
    let YS_engine
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.radius = 0
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }
    class Line {
        constructor(x, y, x2, y2, color, width) {
            this.x1 = x
            this.y1 = y
            this.x2 = x2
            this.y2 = y2
            this.color = color
            this.width = width
        }
        hypotenuse() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            return Math.sqrt(hypotenuse)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.x1, this.y1)
            canvas_context.lineTo(this.x2, this.y2)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class LineOP {
        constructor(object, target, color, width) {
            this.object = object
            this.target = target
            this.color = color
            this.width = width
        }
        angle() {
            return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
        }
        hypotenuse() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            return Math.sqrt(hypotenuse)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.object.x, this.object.y)
            canvas_context.lineTo(this.target.x, this.target.y)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class Triangle {
        constructor(x, y, color, length, fill = 0, strokeWidth = 0, leg1Ratio = 1, leg2Ratio = 1, heightRatio = 1) {
            this.x = x
            this.y = y
            this.color = color
            this.length = length
            this.x1 = this.x + this.length * leg1Ratio
            this.x2 = this.x - this.length * leg2Ratio
            this.tip = this.y - this.length * heightRatio
            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
            this.fill = fill
            this.stroke = strokeWidth
        }
        draw() {
            canvas_context.strokeStyle = this.color
            canvas_context.stokeWidth = this.stroke
            canvas_context.beginPath()
            canvas_context.moveTo(this.x, this.y)
            canvas_context.lineTo(this.x1, this.y)
            canvas_context.lineTo(this.x, this.tip)
            canvas_context.lineTo(this.x2, this.y)
            canvas_context.lineTo(this.x, this.y)
            if (this.fill == 1) {
                canvas_context.fill()
            }
            canvas_context.stroke()
            canvas_context.closePath()
        }
        isPointInside(point) {
            if (point.x <= this.x1) {
                if (point.y >= this.tip) {
                    if (point.y <= this.y) {
                        if (point.x >= this.x2) {
                            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
                            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
                            this.basey = point.y - this.tip
                            this.basex = point.x - this.x
                            if (this.basex == 0) {
                                return true
                            }
                            this.slope = this.basey / this.basex
                            if (this.slope >= this.accept1) {
                                return true
                            } else if (this.slope <= this.accept2) {
                                return true
                            }
                        }
                    }
                }
            }
            return false
        }
    }
    class Rectangle {
        constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
            this.stroke = stroke
            this.strokeWidth = strokeWidth
            this.fill = fill
        }
        draw() {
            canvas_context.fillStyle = this.color
            canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            if (point.x + point.radius >= this.x) {
                if (point.y + point.radius >= this.y) {
                    if (point.x - point.radius <= this.x + this.width) {
                        if (point.y - point.radius <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        clone() {
            let circ = new Circle(this.x, this.y, this.radius, this.color, this.xmom, this.ymom)
            return circ
        }
        draw() {
            canvas_context.lineWidth = this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } class Polygon {
        constructor(x, y, size, color, sides = 3, xmom = 0, ymom = 0, angle = 0, reflect = 0) {
            if (sides < 2) {
                sides = 2
            }
            this.reflect = reflect
            this.xmom = xmom
            this.ymom = ymom
            this.body = new Circle(x, y, size - (size * .293), "transparent")
            this.nodes = []
            this.angle = angle
            this.size = size
            this.color = color
            this.angleIncrement = (Math.PI * 2) / sides
            this.sides = sides
            for (let t = 0; t < sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
        }
        isPointInside(point) { // rough approximation
            this.body.radius = this.size - (this.size * .293)
            if (this.sides <= 2) {
                return false
            }
            this.areaY = point.y - this.body.y
            this.areaX = point.x - this.body.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.body.radius * this.body.radius)) {
                return true
            }
            return false
        }
        move() {
            if (this.reflect == 1) {
                if (this.body.x > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.body.x < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.body.x += this.xmom
            this.body.y += this.ymom
        }
        draw() {
            this.nodes = []
            this.angleIncrement = (Math.PI * 2) / this.sides
            this.body.radius = this.size - (this.size * .293)
            for (let t = 0; t < this.sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
            canvas_context.strokeStyle = this.color
            canvas_context.fillStyle = this.color
            canvas_context.lineWidth = 0
            canvas_context.beginPath()
            canvas_context.moveTo(this.nodes[0].x, this.nodes[0].y)
            for (let t = 1; t < this.nodes.length; t++) {
                canvas_context.lineTo(this.nodes[t].x, this.nodes[t].y)
            }
            canvas_context.lineTo(this.nodes[0].x, this.nodes[0].y)
            canvas_context.fill()
            canvas_context.stroke()
            canvas_context.closePath()
        }
    }
    class Shape {
        constructor(shapes) {
            this.shapes = shapes
        }
        isPointInside(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].isPointInside(point)) {
                    return true
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return true
                }
            }
            return false
        }
        isInsideOf(box) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (box.isPointInside(this.shapes[t])) {
                    return true
                }
            }
            return false
        }
        push(object) {
            this.shapes.push(object)
        }
    }
    class Spring {
        constructor(x, y, radius, color, body = 0, length = 1, gravity = 0, width = 1) {
            if (body == 0) {
                this.body = new Circle(x, y, radius, color)
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            } else {
                this.body = body
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            }
            this.gravity = gravity
            this.width = width
        }
        balance() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += (this.body.x - this.anchor.x) / this.length
                this.body.ymom += (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom -= (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom -= (this.body.y - this.anchor.y) / this.length
            } else {
                this.body.xmom -= (this.body.x - this.anchor.x) / this.length
                this.body.ymom -= (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom += (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom += (this.body.y - this.anchor.y) / this.length
            }
            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            this.beam.draw()
            this.body.draw()
            this.anchor.draw()
        }
        move() {
            this.anchor.ymom += this.gravity
            this.anchor.move()
        }

    }
    class Color {
        constructor(baseColor, red = -1, green = -1, blue = -1, alpha = 1) {
            this.hue = baseColor
            if (red != -1 && green != -1 && blue != -1) {
                this.r = red
                this.g = green
                this.b = blue
                if (alpha != 1) {
                    if (alpha < 1) {
                        this.alpha = alpha
                    } else {
                        this.alpha = alpha / 255
                        if (this.alpha > 1) {
                            this.alpha = 1
                        }
                    }
                }
                if (this.r > 255) {
                    this.r = 255
                }
                if (this.g > 255) {
                    this.g = 255
                }
                if (this.b > 255) {
                    this.b = 255
                }
                if (this.r < 0) {
                    this.r = 0
                }
                if (this.g < 0) {
                    this.g = 0
                }
                if (this.b < 0) {
                    this.b = 0
                }
            } else {
                this.r = 0
                this.g = 0
                this.b = 0
            }
        }
        normalize() {
            if (this.r > 255) {
                this.r = 255
            }
            if (this.g > 255) {
                this.g = 255
            }
            if (this.b > 255) {
                this.b = 255
            }
            if (this.r < 0) {
                this.r = 0
            }
            if (this.g < 0) {
                this.g = 0
            }
            if (this.b < 0) {
                this.b = 0
            }
        }
        randomLight() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12) + 4)];
            }
            var color = new Color(hash, 55 + Math.random() * 200, 55 + Math.random() * 200, 55 + Math.random() * 200)
            return color;
        }
        randomDark() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12))];
            }
            var color = new Color(hash, Math.random() * 200, Math.random() * 200, Math.random() * 200)
            return color;
        }
        random() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 16))];
            }
            var color = new Color(hash, Math.random() * 255, Math.random() * 255, Math.random() * 255)
            return color;
        }
    }
    class Softbody { //buggy, spins in place
        constructor(x, y, radius, color, members = 10, memberLength = 5, force = 10, gravity = 0) {
            this.springs = []
            this.pin = new Circle(x, y, radius, color)
            this.spring = new Spring(x, y, radius, color, this.pin, memberLength, gravity)
            this.springs.push(this.spring)
            for (let k = 0; k < members; k++) {
                this.spring = new Spring(x, y, radius, color, this.spring.anchor, memberLength, gravity)
                if (k < members - 1) {
                    this.springs.push(this.spring)
                } else {
                    this.spring.anchor = this.pin
                    this.springs.push(this.spring)
                }
            }
            this.forceConstant = force
            this.centroid = new Point(0, 0)
        }
        circularize() {
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            this.angle = 0
            this.angleIncrement = (Math.PI * 2) / this.springs.length
            for (let t = 0; t < this.springs.length; t++) {
                this.springs[t].body.x = this.centroid.x + (Math.cos(this.angle) * this.forceConstant)
                this.springs[t].body.y = this.centroid.y + (Math.sin(this.angle) * this.forceConstant)
                this.angle += this.angleIncrement
            }
        }
        balance() {
            for (let s = this.springs.length - 1; s >= 0; s--) {
                this.springs[s].balance()
            }
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            for (let s = 0; s < this.springs.length; s++) {
                this.link = new Line(this.centroid.x, this.centroid.y, this.springs[s].anchor.x, this.springs[s].anchor.y, 0, "transparent")
                if (this.link.hypotenuse() != 0) {
                    this.springs[s].anchor.xmom += (((this.springs[s].anchor.x - this.centroid.x) / (this.link.hypotenuse()))) * this.forceConstant
                    this.springs[s].anchor.ymom += (((this.springs[s].anchor.y - this.centroid.y) / (this.link.hypotenuse()))) * this.forceConstant
                }
            }
            for (let s = 0; s < this.springs.length; s++) {
                this.springs[s].move()
            }
            for (let s = 0; s < this.springs.length; s++) {
                this.springs[s].draw()
            }
        }
    }
    class Observer {
        constructor(x, y, radius, color, range = 100, rays = 10, angle = (Math.PI * .125)) {
            this.body = new Circle(x, y, radius, color)
            this.color = color
            this.ray = []
            this.rayrange = range
            this.globalangle = Math.PI
            this.gapangle = angle
            this.currentangle = 0
            this.obstacles = []
            this.raymake = rays
        }
        beam() {
            this.currentangle = this.gapangle / 2
            for (let k = 0; k < this.raymake; k++) {
                this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
                let ray = new Circle(this.body.x, this.body.y, 1, "white", (((Math.cos(this.globalangle + this.currentangle)))), (((Math.sin(this.globalangle + this.currentangle)))))
                ray.collided = 0
                ray.lifespan = this.rayrange - 1
                this.ray.push(ray)
            }
            for (let f = 0; f < this.rayrange; f++) {
                for (let t = 0; t < this.ray.length; t++) {
                    if (this.ray[t].collided < 1) {
                        this.ray[t].move()
                        for (let q = 0; q < this.obstacles.length; q++) {
                            if (this.obstacles[q].isPointInside(this.ray[t])) {
                                this.ray[t].collided = 1
                            }
                        }
                    }
                }
            }
        }
        draw() {
            this.beam()
            this.body.draw()
            canvas_context.lineWidth = 1
            canvas_context.fillStyle = this.color
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath()
            canvas_context.moveTo(this.body.x, this.body.y)
            for (let y = 0; y < this.ray.length; y++) {
                canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
                canvas_context.lineTo(this.body.x, this.body.y)
            }
            canvas_context.stroke()
            canvas_context.fill()
            this.ray = []
        }
    }
    function setUp(canvas_pass, style = "#000000") {
        canvas = canvas_pass
        canvas_context = canvas.getContext('2d');
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 25)
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
        window.addEventListener('pointerdown', e => {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
            // example usage: if(object.isPointInside(TIP_engine)){ take action }
            if(started == 0){
                if(easy.isPointInside(TIP_engine)){
                    started = 1
                    rooms[activeroom].enemies = []
                }
                if(hard.isPointInside(TIP_engine)){
                    started = 1
                    eyesack.speed-=.5
                    eyesack.range-=5
                    eyesack.health-=1
                    eyesack.shotrate+=1
                    eyesack.body.radius+=2
                    eyesack.keys--
                }

            }
            window.addEventListener('pointermove', continued_stimuli);
        });
        window.addEventListener('pointerup', e => {
            window.removeEventListener("pointermove", continued_stimuli);
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
        }
    }
    function gamepad_control(object, speed = 1) { // basic control for objects using the controler
        console.log(gamepadAPI.axesStatus[1] * gamepadAPI.axesStatus[0])
        if (typeof object.body != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.body.x += (gamepadAPI.axesStatus[2] * speed)
                    object.body.y += (gamepadAPI.axesStatus[1] * speed)
                }
            }
        } else if (typeof object != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.x += (gamepadAPI.axesStatus[0] * speed)
                    object.y += (gamepadAPI.axesStatus[1] * speed)
                }
            }
        }
    }
    function vcontrol(object, speed = 1) {

        if (typeof object != 'undefined') {
            if (keysPressed['w']) {
                object.ymom -= speed
            }
            if (keysPressed['d']) {
                object.xmom += speed
            }
            if (keysPressed['s']) {
                object.ymom += speed
            }
            if (keysPressed['a']) {
                object.xmom -= speed
            }
        }
    }
    function control(object, speed = 1) { // basic control for objects
        let clone = object.clone()
        if (typeof object != 'undefined') {
            let wet = 0
            for (let t = 0; t < rooms[activeroom].doors.length; t++) {
                if (rooms[activeroom].doors[t].doesPerimeterTouch(object)) {
                    if (typeof rooms[activeroom].links[t] == "number") {
                        if (rooms[activeroom].locks[t] == 0 || (rooms[activeroom].locks[t] == 1 && eyesack.keys > 0)) {
                            wet = 1
                        }
                    }
                }
            }



            if (keysPressed['w']) {
                object.y -= speed
                if (wet == 0) {
                    if (!rooms[activeroom].body2.isPointInside(object)) {
                        // object.x = clone.x
                        object.y = clone.y
                    }
                }
            }
            if (keysPressed['d']) {
                object.x += speed
                if (wet == 0) {
                    if (!rooms[activeroom].body2.isPointInside(object)) {
                        object.x = clone.x
                        // object.y = clone.y
                    }
                }
            }
            if (keysPressed['s']) {
                object.y += speed
                if (wet == 0) {
                    if (!rooms[activeroom].body2.isPointInside(object)) {
                        // object.x = clone.x
                        object.y = clone.y
                    }
                }
            }
            if (keysPressed['a']) {
                object.x -= speed
                if (wet == 0) {
                    if (!rooms[activeroom].body2.isPointInside(object)) {
                        object.x = clone.x
                        // object.y = clone.y
                    }
                }
            }
            let dry = 0

            if (wet == 1) {
                for (let t = 0; t < rooms[activeroom].doors.length; t++) {
                    if (rooms[activeroom].doors[t].doesPerimeterTouch(object)) {
                        if (typeof rooms[activeroom].links[t] == "number") {
                            if (rooms[activeroom].locks[t] == 0 || (rooms[activeroom].locks[t] == 1 && eyesack.keys > 0)) {
                                dry = 1
                            }
                        }
                    }
                }
            }
            if (dry == 0) {
                if (!rooms[activeroom].body2.isPointInside(object)) {
                    object.x = clone.x
                    object.y = clone.y
                }

            }
            // if (typeof object.body != 'undefined') {
            //     if (keysPressed['w']) {
            //         object.body.y -= speed
            //     }
            //     if (keysPressed['d']) {
            //         object.body.x += speed
            //     }
            //     if (keysPressed['s']) {
            //         object.body.y += speed
            //     }
            //     if (keysPressed['a']) {
            //         object.body.x -= speed
            //     }
            // } else 
        }
    }
    function getRandomLightColor() { // random color that will be visible on  black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12) + 4)];
        }
        return color;
    }
    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    function getRandomDarkColor() {// color that will be visible on a black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12))];
        }
        return color;
    }
    function castBetween(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
        let limit = granularity
        let shape_array = []
        for (let t = 0; t < limit; t++) {
            let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
            shape_array.push(circ)
        }
        return (new Shape(shape_array))
    }


    class Enemy {
        constructor(x, y, type) {
            this.body = new Circle(x, y, 20, "#FF1144")
            this.maxradius = this.body.radius
            this.speed = 3
            this.moving = 0
            this.type = type
            if (this.type == 0) {
                this.body.color = "gold"
            }
            if (this.type == 2) {
                this.body.color = "orange"
            }
            if (this.type == 1) {
                this.body.color = "red"
            }
            if (this.type == 4) {
                this.body.color = "purple"
            }
            if (this.type == 5) {
                this.body.color = "pink"
            }
            this.shotcounter = 0
            this.shotrate = 20
            this.shots = []
            this.shotspeed = 5
            this.range = 100
            this.health = 100
            this.maxhealth = 100
            this.marked = 0
        }
        shoot() {
            let variate = Math.floor(Math.random() * 4)
            if (this.shotcounter > this.shotrate) {
                if (variate == 1) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", 0, -this.shotspeed)
                    shot.range = this.range
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
                if (variate == 2) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", -this.shotspeed, 0)
                    shot.range = this.range
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
                if (variate == 0) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", 0, this.shotspeed)
                    shot.range = this.range
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
                if (variate == 3) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", this.shotspeed, 0)
                    shot.range = this.range
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
            } else {
                this.shotcounter++
            }
        }
        aimshoot() {
            let angle = (new LineOP(eyesack.body, this.body)).angle()
            if (this.shotcounter > this.shotrate * 3) {
                let shot = new Circle(this.body.x, this.body.y, 6, "#AA00FF", (this.shotspeed * Math.cos(angle)) * .8, (this.shotspeed * Math.sin(angle)) * .8)
                shot.range = this.range
                this.shots.push(shot)
                this.shotcounter = 0
            } else {
                this.shotcounter++
            }
        }
        bigaimshoot() {
            let angle = (new LineOP(eyesack.body, this.body)).angle()
            if (this.shotcounter > this.shotrate * 30) {
                for (let t = 0; t < 10; t++) {
                    let shot = new Circle(this.body.x, this.body.y, 6, "#AA00FF", (this.shotspeed * Math.cos(angle)) * .8, (this.shotspeed * Math.sin(angle)) * .8)
                    shot.xmom += (Math.random() - .5) * (this.shotspeed * .3)
                    shot.ymom += (Math.random() - .5) * (this.shotspeed * .3)
                    shot.range = this.range
                    this.shots.push(shot)
                    this.shotcounter = 0
                }
            } else {
                this.shotcounter++
            }
        }
        bigshoot() {
            let variate = Math.floor(Math.random() * 4)
            if (this.shotcounter > this.shotrate * 10) {
                if (variate == 1) {
                    for (let t = 0; t < 10; t++) {
                        let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", 0, -this.shotspeed)
                        shot.xmom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.ymom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.range = this.range
                        this.shots.push(shot)
                        this.shotcounter = 0
                    }
                    return
                }
                if (variate == 2) {
                    for (let t = 0; t < 10; t++) {
                        let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", -this.shotspeed, 0)
                        shot.xmom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.ymom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.range = this.range
                        this.shots.push(shot)
                        this.shotcounter = 0
                    }
                    return
                }
                if (variate == 0) {
                    for (let t = 0; t < 10; t++) {
                        let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", 0, this.shotspeed)
                        shot.xmom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.ymom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.range = this.range
                        this.shots.push(shot)
                        this.shotcounter = 0
                    }
                    return
                }
                if (variate == 3) {
                    for (let t = 0; t < 10; t++) {
                        let shot = new Circle(this.body.x, this.body.y, 4, "#AA0000", this.shotspeed, 0)
                        shot.xmom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.ymom += (Math.random() - .5) * (this.shotspeed * .8)
                        shot.range = this.range
                        this.shots.push(shot)
                        this.shotcounter = 0
                    }
                    return
                }
            } else {
                this.shotcounter++
            }
        }
        draw() {
            this.bodyclone = this.body.clone()
            if (this.type == 0 || this.type == 2) {
                let xpath = this.body.x - eyesack.body.x
                let ypath = this.body.y - eyesack.body.y
                if (Math.abs(xpath) > Math.abs(ypath)) {
                    if (xpath < 0) {
                        this.body.x += this.speed
                    } else {
                        this.body.x -= this.speed
                    }
                    if (!rooms[activeroom].body2.isPointInside(this.body)) {
                        this.body.x = this.bodyclone.x
                    }
                } else {
                    if (ypath < 0) {
                        this.body.y += this.speed
                    } else {
                        this.body.y -= this.speed
                    }
                    if (!rooms[activeroom].body2.isPointInside(this.body)) {
                        this.body.y = this.bodyclone.y
                    }
                }
            }
            for (let t = 0; t < eyesack.shots.length; t++) {
                if (eyesack.shots[t].doesPerimeterTouch(this.body)) {
                    this.body.xmom = eyesack.shots[t].xmom
                    this.body.ymom = eyesack.shots[t].ymom
                    this.body.xmom += (Math.random() - .5) * this.speed
                    this.body.ymom += (Math.random() - .5) * this.speed
                    this.moving = 10
                    this.body.xmom /= 3
                    this.body.ymom /= 3
                    this.body.move()
                    if(this.health > 0){
                        eyesack.shots[t].range = -1
                    }
                    this.health -= eyesack.attack
                    if (this.health <= 0) {
                        this.marked = 1
                    }
                }
            }
            for (let t = 0; t < rooms[activeroom].enemies.length; t++) {
                if (rooms[activeroom].enemies[t].body != (this.body)) {
                    if (rooms[activeroom].enemies[t].body.doesPerimeterTouch(this.body)) {
                        let link = new LineOP(rooms[activeroom].enemies[t].body, this.body)
                        this.body.xmom = -Math.cos(link.angle()) * this.speed
                        this.body.ymom = -Math.sin(link.angle()) * this.speed
                        this.moving = 2
                    }
                }
            }

            if (this.moving > 0) {
                this.body.move()
                if (!rooms[activeroom].body2.isPointInside(this.body)) {
                    this.body.x = this.bodyclone.x
                    this.body.y = this.bodyclone.y
                }
                this.moving--
            }
            if (this.type == 1 || this.type == 2) {
                this.shoot()
            }
            if (this.type == 3) {
                if (this.health == this.maxhealth) {
                    this.bigshoot()
                }
                this.body.radius = (this.maxradius * (this.health / this.maxhealth)) + 7
                this.health *= 1.00001
                this.health += .5

                if (this.health > this.maxhealth) {
                    this.health = this.maxhealth
                }
            }
            if (this.type == 4) {
                this.aimshoot()
            }
            if (this.type == 5) {
                this.bigaimshoot()
            }

            for (let t = 0; t < this.shots.length; t++) {
                this.shots[t].move()
                this.shots[t].draw()
                this.shots[t].range--
            }
            for (let t = 0; t < this.shots.length; t++) {
                if (!rooms[activeroom].body2.isPointInside(this.shots[t])) {
                    this.shots.splice(t, 1)
                }
            }
            for (let t = 0; t < this.shots.length; t++) {
                if (this.shots[t].range < 0) {
                    this.shots.splice(t, 1)
                }
            }
            this.body.draw()
        }

    }


    class Pickup {
        constructor(x, y, type) {
            this.body = new Circle(x, y, 12, "transparent")
            this.type = type
            this.framer = 0
            this.maxer = 0
            this.slower = 2
            this.slow = 0
        }
        draw() {
            if (this.type == 0) {
                this.maxer = 32
                let width = keyimg.width / this.maxer
                this.slow++
                if (this.slow % this.slower == 0) {
                    this.framer++
                    this.framer %= this.maxer
                }
                if (this.marked != 1) {
                    canvas_context.drawImage(keyimg, this.framer * width, 0, width, keyimg.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 3, this.body.radius * 3)
                    if (this.body.doesPerimeterTouch(eyesack.body)) {
                        eyesack.keys++
                        this.marked = 1
                    }
                }
            }
            if (this.type == 1) {
                this.maxer = 12
                let width = coinimg.width / this.maxer
                this.slow++
                if (this.slow % this.slower == 0) {
                    this.framer++
                    this.framer %= this.maxer
                }
                if (this.marked != 1) {
                    canvas_context.drawImage(coinimg, this.framer * width, 0, width, coinimg.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 1.5, this.body.radius * 1.5)
                    if (this.body.doesPerimeterTouch(eyesack.body)) {
                        eyesack.coins++
                        this.marked = 1
                    }
                }
            }
            if (this.type == 2) {
                this.maxer = 28
                let width = potionimg.width / this.maxer
                this.slow++
                if (this.slow % this.slower == 0) {
                    this.framer++
                    this.framer %= this.maxer
                }
                if (this.marked != 1) {
                    canvas_context.drawImage(potionimg, this.framer * width, 0, width, potionimg.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 3, this.body.radius * 3)
                    if (this.body.doesPerimeterTouch(eyesack.body)) {
                        eyesack.health++
                        this.marked = 1
                    }
                }
            }
            if (this.type == 3) {
                this.maxer = 1
                let width = bombimg.width / this.maxer
                this.slow++
                if (this.slow % this.slower == 0) {
                    this.framer++
                    this.framer %= this.maxer
                }
                if (this.marked != 1) {
                    canvas_context.drawImage(bombimg, this.framer * width, 0, width, bombimg.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 2, this.body.radius * 2)
                    if (this.body.doesPerimeterTouch(eyesack.body)) {
                        eyesack.bombs++
                        this.marked = 1
                    }
                }
            }
        }
    }

    class Room {
        constructor() {
            this.drawn = 0
            this.items = []
            this.enemies = []
            this.body1 = new Rectangle(100, 100, canvas.width - 200, canvas.height - 200, "#CC5500")
            this.body2 = new Rectangle(110, 110, canvas.width - 220, canvas.height - 220, "#553322")
            this.walls = []
            this.wall1 = new Line(0, 0, this.body1.x + 5, this.body1.y + 5, "red", 5)
            this.wall2 = new Line(1280, 0, this.body1.x + this.body1.width - 5, this.body1.y + 5, "red", 5)
            this.wall3 = new Line(0, 720, this.body1.x + 5, this.body1.y + this.body1.height - 5, "red", 5)
            this.wall4 = new Line(1280, 720, this.body1.x + this.body1.width - 5, this.body1.y + this.body1.height - 5, "red", 5)
            this.walls = [this.wall1, this.wall2, this.wall3, this.wall4]
            this.links = []
            this.doors = []
            this.door1 = new Rectangle(this.body1.x + (this.body1.width * .5) - 50, 0, 100, this.body1.y, "#333333")
            this.doors.push(this.door1)
            this.door2 = new Rectangle(this.body1.x + (this.body1.width * .5) - 50, 620, 100, this.body1.y, "#333333")
            this.doors.push(this.door2)
            this.door3 = new Rectangle(0, 310, 100, this.body1.y, "#333333")
            this.doors.push(this.door3)
            this.door4 = new Rectangle(1180, 310, 100, this.body1.y, "#333333")
            this.doors.push(this.door4)
            this.index = roomcounter
            this.details = []
            this.locks = []
            for (let t = 0; t < 5; t++) {
                this.detail = new Line(this.body2.x + (Math.random() * this.body2.width), this.body2.y + (Math.random() * this.body2.height), this.body2.x + (Math.random() * this.body2.width), this.body2.y + (Math.random() * this.body2.height), getRandomColor() + "44", 5 + (Math.random() * 8))
                this.details.push(this.detail)
            }
            rooms.push(this)
            for (let t = 0; t < 4; t++) {
                if (rooms.length < 1000) {
                    if (Math.random() < .3 - (rooms.length / 3333)) {
                        if (this.links.length < 4) {
                            roomcounter++
                            this.links.push(roomcounter)
                            this.locks.push(Math.floor(Math.random() * 2))
                            let room = new Room()
                            if (this.links.length == 1) {
                                room.links[1] = this.index
                                room.locks[1] = 0
                            } else if (this.links.length == 2) {
                                room.links[0] = this.index
                                room.locks[0] = 0
                            } else if (this.links.length == 3) {
                                room.links[3] = this.index
                                room.locks[3] = 0
                            } else if (this.links.length == 4) {
                                room.links[2] = this.index
                                room.locks[2] = 0
                            }
                        }
                    }
                }
            }
            for (let t = 0; t < Math.random() * 10; t++) {
                let pickup = new Pickup((Math.random() * (this.body2.width - 40)) + this.body2.x + 20, (Math.random() * (this.body2.height - 40)) + this.body2.y + 20, Math.floor(Math.random() * 4))
                this.items.push(pickup)
            }
            for (let t = 0; t < Math.random() * 4; t++) {
                this.enemyhas = 1
                let migo = new Enemy((Math.random() * (this.body2.width - 40)) + this.body2.x + 20, (Math.random() * (this.body2.height - 40)) + this.body2.y + 20, Math.floor(Math.random() * 6))
                this.enemies.push(migo)
            }
        }
        draw() {
            if (keysPressed[';']) {
                console.log(activeroom, "a")
                console.log(this.index, "i")
            }
            if (this.index == activeroom) {
                if (this.drawn == 0) {
                    let roomlength = rooms.length
                    for (let t = 0; t < 4; t++) {
                        if (rooms.length < roomlength + 100) {
                            if (Math.random() < .3 - (rooms.length / 3333)) {
                                if (this.links.length < 4) {
                                    roomcounter++
                                    this.links.push(roomcounter)
                                    this.locks.push(Math.floor(Math.random() * 2))
                                    let room = new Room()
                                    if (this.links.length == 1) {
                                        room.links[1] = this.index
                                        room.locks[1] = 0
                                    } else if (this.links.length == 2) {
                                        room.links[0] = this.index
                                        room.locks[0] = 0
                                    } else if (this.links.length == 3) {
                                        room.links[3] = this.index
                                        room.locks[3] = 0
                                    } else if (this.links.length == 4) {
                                        room.links[2] = this.index
                                        room.locks[2] = 0
                                    }
                                }
                            }
                        }
                    }
                    this.drawn = 1
                }
                if (keysPressed[';']) {
                    console.log(this.links)
                }

                this.body1.draw()
                this.body2.draw()
                for (let t = 0; t < this.walls.length; t++) {
                    this.walls[t].draw()
                }
                for (let t = 0; t < this.links.length; t++) {
                    if (typeof this.links[t] == "number") {
                        if (this.locks[t] == 1) {
                            this.doors[t].color = "white"
                        } else {
                            this.doors[t].color = "#333333"
                        }
                        this.doors[t].draw()
                        if (this.doors[t].isPointInside(eyesack.body)) {
                            if (this.locks[t] != 1) {
                                eyesack.shots = []
                                eyesack.charge++
                                eyesack.roomstorage = activeroom
                                activeroom = this.links[t]
                                if (t == 0) {
                                    eyesack.body.x = 640
                                    eyesack.body.y = 580
                                } else if (t == 1) {
                                    eyesack.body.x = 640
                                    eyesack.body.y = 120
                                } else if (t == 2) {
                                    eyesack.body.x = 1160
                                    eyesack.body.y = 360
                                } else if (t == 3) {
                                    eyesack.body.x = 120
                                    eyesack.body.y = 360
                                }
                            } else {
                                if (eyesack.keys > 0) {
                                    eyesack.shots = []

                                    eyesack.charge++
                                    eyesack.roomstorage = activeroom
                                    activeroom = this.links[t]
                                    if (t == 0) {
                                        eyesack.body.x = 640
                                        eyesack.body.y = 580
                                    } else if (t == 1) {
                                        eyesack.body.x = 640
                                        eyesack.body.y = 120
                                    } else if (t == 2) {
                                        eyesack.body.x = 1160
                                        eyesack.body.y = 360
                                    } else if (t == 3) {
                                        eyesack.body.x = 120
                                        eyesack.body.y = 360
                                    }
                                    eyesack.keys--
                                    this.locks[t] = 0
                                }
                            }
                        }
                    }
                }
                for (let t = 0; t < this.details.length; t++) {
                    this.details[t].draw()
                }

                for (let t = 0; t < this.items.length; t++) {
                    this.items[t].draw()
                }
                for (let t = 0; t < this.enemies.length; t++) {
                    this.enemies[t].draw()
                }
                for (let t = 0; t < this.enemies.length; t++) {
                    if (this.enemies[t].marked == 1) {
                        this.enemies.splice(t, 1)
                    }
                }
            }
            if (this.enemyhas == 1) {
                if (this.enemies.length == 0) {
                    this.enemyhas = 0
                    let pickup = new Pickup((Math.random() * (this.body2.width - 40)) + this.body2.x + 20, (Math.random() * (this.body2.height - 40)) + this.body2.y + 20, Math.floor(Math.random() * 3))
                    this.items.push(pickup)


                }
            }
        }
    }

    class Player {
        constructor() {
            this.hitstun = 0
            this.chargebar = new Rectangle(0, 0, 50, 100, "#00FF00")
            this.notch = new Rectangle(0, 50, 35, 1, "black")
            this.roomstorage = 0
            this.body = new Circle(640, 360, 20, "blue")
            this.speed = 5
            this.charge = 2
            this.keys = 2
            this.health = 4
            this.bombs = 1
            this.coins = 0
            this.shotcounter = 0
            this.shotrate = 20
            this.shots = []
            this.shotspeed = 7
            this.range = 100
            this.attack = 35
            this.bombtimer = 0
        }
        shoot() {
            if (this.shotcounter > this.shotrate) {
                if (keysPressed['i']) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "cyan", 0, -this.shotspeed)
                    shot.range = this.range
                    vcontrol(shot, this.speed * .5)
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
                if (keysPressed['j']) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "cyan", -this.shotspeed, 0)
                    shot.range = this.range
                    vcontrol(shot, this.speed * .5)
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
                if (keysPressed['k']) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "cyan", 0, this.shotspeed)
                    shot.range = this.range
                    vcontrol(shot, this.speed * .5)
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
                if (keysPressed['l']) {
                    let shot = new Circle(this.body.x, this.body.y, 4, "cyan", this.shotspeed, 0)
                    shot.range = this.range
                    vcontrol(shot, this.speed * .5)
                    this.shots.push(shot)
                    this.shotcounter = 0
                    return
                }
            } else {
                this.shotcounter++
            }

        }
        bomb(){
            if(this.bombtimer <= 0){
                if(this.bombs> 0){
                    for(let t = 0;t<60;t++){
                        let shot = new Circle(this.body.x, this.body.y, 5, "red", (Math.random()-.5)*10,  (Math.random()-.5)*10)  
                        shot.range = this.range
                        this.shots.push(shot)
                    }
                    this.bombs--
                    this.bombtimer = 30
                }
            }
            
        }
        draw() {
            if(keysPressed['e']){
                this.bomb()
            }
            this.bombtimer--
            this.shoot()
            canvas_context.font = "20px arial"
            canvas_context.fillStyle = "white"
            canvas_context.fillText(`Active room: ${activeroom}`, 100, 20)
            canvas_context.fillText(`Stored Room: ${this.roomstorage}`, 100, 40)
            canvas_context.fillText(`Keys: ${this.keys}`, 100, 60)


            canvas_context.fillText(`Bombs: ${this.bombs}`, 700, 20)
            canvas_context.fillText(`Coins: ${this.coins}`, 700, 40)
            canvas_context.fillText(`Health: ${this.health}`, 700, 60)
            this.chargebar.height = this.charge * 50
            this.chargebar.height = Math.min(this.chargebar.height, 100)
            this.chargebar.draw()
            this.notch.draw()
            control(this.body, this.speed)
            this.body.draw()
            if (this.charge >= 2) {
                if (keysPressed[' ']) {
                    activeroom = this.roomstorage
                    this.charge = 0
                }
            }
            for (let t = 0; t < this.shots.length; t++) {
                this.shots[t].move()
                this.shots[t].draw()
                this.shots[t].range--
            }
            for (let t = 0; t < this.shots.length; t++) {
                if (!rooms[activeroom].body2.isPointInside(this.shots[t])) {
                    this.shots.splice(t, 1)
                }
            }
            for (let t = 0; t < this.shots.length; t++) {
                if (this.shots[t].range < 0) {
                    this.shots.splice(t, 1)
                }
            }
            if(this.hitstun <= 0){
            for (let t = 0; t < rooms[activeroom].enemies.length; t++) {
                for (let k = 0; k < rooms[activeroom].enemies[t].shots.length; k++) {
                    if (rooms[activeroom].enemies[t].shots[k].doesPerimeterTouch(this.body)) {
                        this.health--
                        rooms[activeroom].enemies[t].shots[k].range = -1
                        this.hitstun = 100
                    }
                }
                if (rooms[activeroom].enemies[t].body.doesPerimeterTouch(this.body)) {
                    this.health--
                    this.hitstun = 100
                }
            }
            this.body.color = "blue"
            }else{

            for (let t = 0; t < rooms[activeroom].enemies.length; t++) {
                for (let k = 0; k < rooms[activeroom].enemies[t].shots.length; k++) {
                    if (rooms[activeroom].enemies[t].shots[k].doesPerimeterTouch(this.body)) {
                        rooms[activeroom].enemies[t].shots[k].range = -1
                    }
                }
            }
                this.hitstun--
                if(this.hitstun%20 < 5){
                    this.body.color = "blue"
                }else if(this.hitstun%20 < 10){
                    this.body.color = "#0055FF"
                }else if(this.hitstun%20 < 15){
                    this.body.color = "#00AAFF"
                }else{
                    this.body.color = "#00CCFF"
                }
            }
        }
    }

    let key = new Pickup(200, 200, 1)

    let setup_canvas = document.getElementById('canvas') //getting canvas from document

    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    // object instantiation and creation happens here 

    let roomcounter = 0
    let activeroom = 0
    let rooms = []
    let room1 = new Room()
    // let room2 = new Room()
    let eyesack = new Player()
    // let enemy = new Enemy(100, 100)
    let started = 0
    let easy = new Rectangle(200, 200, 200, 100, "#00FF00")
    let hard = new Rectangle(700, 200, 200, 100, "#FF0000")

    function main() {
        canvas_context.clearRect(0, 0, canvas.width, canvas.height)  // refreshes the image
        gamepadAPI.update()
        if (started == 1) { 
            // for (let t = 0; t < rooms.length; t++) {
                rooms[activeroom].draw()
            // }
            eyesack.draw()
            if(eyesack.health<=0){
                 rooms = []
                 activeroom = 0
                 roomcounter = 0
                 room1 = new Room()
                 eyesack = new Player()
                 started = 0
            }
        }else{
            easy.draw()
            hard.draw()
            canvas_context.font = "50px arial"
            canvas_context.fillStyle = "Black"
            canvas_context.fillText("Easy", easy.x +50, easy.y + 50)
            canvas_context.fillText("Hard", hard.x +50, hard.y + 50)
        }
        // key.draw()
        // enemy.draw()
    }
})