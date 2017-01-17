function geomquadMain(imode) {
    this.version = '0.83';
    imode = typeof imode !== 'undefined' ? imode : 'choose';
    if (imode == "type") imode = "choose";
    if (imode == "choose") {
        chooseQ = true;
        mode = "any";
    } else {
        chooseQ = false;
        mode = imode;
    }
    canvasid = "canvas" + mode;
    titleid = "title" + mode;
    infoid = "info" + mode;
    dragging = false;
    w = 540;
    h = 310;
    if (!chooseQ) {
        w = 450;
        h = 320;
    }
    var s = '';
    s += '<div style="position:relative; width:' + w + 'px; height:' + h + 'px; border: 1px solid blue; border-radius: 9px; margin:auto; display:block; ">';
    s += '<canvas id="' + canvasid + '" width="' + w + '" height="' + h + '" style="z-index:4;"></canvas>';
    s += '<div id="' + titleid + '" style="font: 12pt arial; font-weight: bold; position:absolute; top:14px; left:0px; width:540px; text-align:center;"></div>';
    s += '<div id="' + infoid + '" style="font: 10pt arial; font-weight: bold; color: #6600cc; position:absolute; top:35px; left:0px; width:540px; text-align:center;"></div>';
    if (chooseQ) {
        s += '<form onclick="doType()" id="formtype" style="font: 11pt arial; font-weight: bold; color: #6600cc; background: rgba(200,220,256,0.7);  padding: 5px; position:absolute; top:45px; left:2px; z-index:3; ">';
        opts = [
            [0, "Any"],
            [1, "Parallelogram"],
            [2, "Square"],
            [2, "Rectangle"],
            [2, "Rhombus"],
            [1, "Trapezoid"],
            [1, "Kite"]
        ];
        for (i = 0; i < opts.length; i++) {
            chkStr = opts[i][0] == 0 ? 'checked' : '';
            tabStr = opts[i][0] == 2 ? ' &nbsp; ' : '';
            idStr = 'r' + i;
            s += tabStr + '<label for="' + idStr + '" style="cursor:pointer;"><input type="radio" name="typ" id="' + idStr + '" value="' + opts[i][1] + '" style="height:18px;" ' + chkStr + ' />' + opts[i][1] + '</label><br/>';
        }
        s += '</form>';
    }
    s += '<button id="anglesBtn" onclick="toggleAngles()" style="z-index:2; position:absolute; right:183px; bottom:3px;" class="togglebtn lo" >Angles</button>';
    s += '<button id="sidesBtn" onclick="toggleSides()" style="z-index:2; position:absolute; right:123px; bottom:3px;" class="togglebtn lo" >Sides</button>';
    s += '<button id="diagsBtn" onclick="toggleDiags()" style="z-index:2; position:absolute; right:63px; bottom:3px;" class="togglebtn lo" >Diags</button>';
    s += '<button id="resetBtn" onclick="reset()" style="z-index:2; position:absolute; right:3px; bottom:3px;" class="togglebtn" >Reset</button>';
    s += '<div id="copyrt" style="font: 7pt arial; font-weight: bold; color: #6600cc; position:absolute; left:3px; bottom:3px;">&copy; 2015 MathsIsFun.com  v' + this.version + '</div>';
    s += '</div>';
    document.write(s);
    el = document.getElementById(canvasid);
    ratio = 2;
    el.width = w * ratio;
    el.height = h * ratio;
    el.style.width = w + "px";
    el.style.height = h + "px";
    g = el.getContext("2d");
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    theCanvas = el;
    context = g;
    dragNo = 0;
    anglesQ = false;
    sidesQ = false;
    diagsQ = false;
    titleStr = "Quadrilateral";
    descrStr = "";
    numPts = 4;
    shapes = [];
    quad = new Quad();
    quad.setAllKnown(false);
    quad.setLabels("", "", "", "", "", "");
    makeShapes();
    drawShapes();
    theCanvas.addEventListener("mousedown", mouseDownListener, false);
    theCanvas.addEventListener('touchstart', ontouchstart, false);
    theCanvas.addEventListener("mousemove", domousemove, false);
    doType();
}

function reset() {
    makeShapes();
    update();
}

function update() {
    doType();
}

function toggleAngles() {
    anglesQ = !anglesQ;
    toggleBtn("anglesBtn", anglesQ);
    update();
}

function toggleSides() {
    sidesQ = !sidesQ;
    toggleBtn("sidesBtn", sidesQ);
    update();
}

function toggleDiags() {
    diagsQ = !diagsQ;
    toggleBtn("diagsBtn", diagsQ);
    update();
}

function toggleBtn(btn, onq) {
    if (onq) {
        document.getElementById(btn).classList.add("hi");
        document.getElementById(btn).classList.remove("lo");
    } else {
        document.getElementById(btn).classList.add("lo");
        document.getElementById(btn).classList.remove("hi");
    }
}

function drawBG(w, h) {
    g.lineWidth = 1;
    for (var i = 0; i < 10; i++) {
        var xPix = i * 60;
        g.beginPath();
        if (i % 2) {
            g.strokeStyle = "rgba(0,0,256,0.2)";
        } else {
            g.strokeStyle = "rgba(0,0,256,0.1)";
        }
        g.moveTo(xPix, 0);
        g.lineTo(xPix, h);
        g.stroke();
    }
    for (i = 0; i < 6; i++) {
        var yPix = i * 60;
        g.beginPath();
        if (i % 2) {
            g.strokeStyle = "rgba(0,0,256,0.2)";
        } else {
            g.strokeStyle = "rgba(0,0,256,0.1)";
        }
        g.moveTo(0, yPix);
        g.lineTo(w, yPix);
        g.stroke();
    }
}

function ontouchstart(evt) {
    var touch = evt.targetTouches[0];
    evt.clientX = touch.clientX;
    evt.clientY = touch.clientY;
    evt.touchQ = true;
    mouseDownListener(evt)
}

function ontouchmove(evt) {
    var touch = evt.targetTouches[0];
    evt.clientX = touch.clientX;
    evt.clientY = touch.clientY;
    evt.touchQ = true;
    mouseMoveListener(evt);
    evt.preventDefault();
}

function ontouchend(evt) {
    theCanvas.addEventListener('touchstart', ontouchstart, false);
    window.removeEventListener("touchend", ontouchend, false);
    if (dragging) {
        dragging = false;
        window.removeEventListener("touchmove", ontouchmove, false);
    }
}

function domousemove(e) {
    document.body.style.cursor = "default";
    var bRect = theCanvas.getBoundingClientRect();
    mouseX = (e.clientX - bRect.left) * (el.width / ratio / bRect.width);
    mouseY = (e.clientY - bRect.top) * (el.height / ratio / bRect.height);
    for (var i = 0; i < numPts; i++) {
        if (hitTest(shapes[i], mouseX, mouseY)) {
            dragNo = i;
            document.body.style.cursor = "pointer";
        }
    }
}

function mouseDownListener(evt) {
    var i;
    var highestIndex = -1;
    var bRect = theCanvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left) * (el.width / ratio / bRect.width);
    mouseY = (evt.clientY - bRect.top) * (el.height / ratio / bRect.height);
    for (i = 0; i < numPts; i++) {
        if (hitTest(shapes[i], mouseX, mouseY)) {
            dragNo = i;
            dragging = true;
            if (i > highestIndex) {
                dragHoldX = mouseX - shapes[i].x;
                dragHoldY = mouseY - shapes[i].y;
                highestIndex = i;
                dragIndex = i;
            }
        }
    }
    if (dragging) {
        if (evt.touchQ) {
            window.addEventListener('touchmove', ontouchmove, false);
        } else {
            window.addEventListener("mousemove", mouseMoveListener, false);
        }
        doType();
    }
    if (evt.touchQ) {
        theCanvas.removeEventListener("touchstart", ontouchstart, false);
        window.addEventListener("touchend", ontouchend, false);
    } else {
        theCanvas.removeEventListener("mousedown", mouseDownListener, false);
        window.addEventListener("mouseup", mouseUpListener, false);
    }
    if (evt.preventDefault) {
        evt.preventDefault();
    } else if (evt.returnValue) {
        evt.returnValue = false;
    }
    return false;
}

function mouseUpListener(evt) {
    theCanvas.addEventListener("mousedown", mouseDownListener, false);
    window.removeEventListener("mouseup", mouseUpListener, false);
    if (dragging) {
        dragging = false;
        window.removeEventListener("mousemove", mouseMoveListener, false);
    }
}

function mouseMoveListener(evt) {
    var posX;
    var posY;
    var shapeRad = shapes[dragIndex].rad;
    var minX = shapeRad;
    var maxX = theCanvas.width - shapeRad;
    var minY = shapeRad;
    var maxY = theCanvas.height - shapeRad;
    var bRect = theCanvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left) * (el.width / ratio / bRect.width);
    mouseY = (evt.clientY - bRect.top) * (el.height / ratio / bRect.height);
    posX = mouseX - dragHoldX;
    posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
    posY = mouseY - dragHoldY;
    posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);
    shapes[dragIndex].x = posX;
    shapes[dragIndex].y = posY;
    doType();
}

function hitTest(shape, mx, my) {
    var dx;
    var dy;
    dx = mx - shape.x;
    dy = my - shape.y;
    return (dx * dx + dy * dy < shape.rad * shape.rad);
}

function doType() {
    switch (getType().toLowerCase()) {
        case "any":
            titleStr = "Quadrilateral";
            descrStr = "";
            break;
        case "parallelogram":
            titleStr = "Parallelogram";
            descrStr = "Opposite sides parallel";
            quad.makeParallel(dragNo);
            break;
        case "square":
            titleStr = "Square";
            descrStr = "All sides equal, all right angles";
            quad.makeRegular(dragNo, w / 2 + 30, h / 2);
            break;
        case "rectangle":
            titleStr = "Rectangle";
            descrStr = "All right angles";
            quad.makeRectangle(dragNo);
            break;
        case "rhombus":
            titleStr = "Rhombus";
            descrStr = "All sides equal";
            quad.makeRhombus(dragNo);
            break;
        case "trapezoid":
            titleStr = "Trapezoid (UK: Trapezium)";
            descrStr = "One pair of sides parallel";
            quad.makeTrapez(dragNo);
            break;
        case "kite":
            titleStr = "Kite";
            descrStr = "Two sets of equal adjacent sides";
            quad.makeKite(dragNo);
            break;
        default:
    }
    HiGraphics.clear(el);
    drawBG(this.w, this.h);
    drawShapes();
}

function getType() {
    if (chooseQ) {
        var buttons = document.getElementsByName('typ');
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            if (button.checked) {
                typeStr = button.value;
            }
        }
    } else {
        typeStr = mode;
    }
    return typeStr;
}

function getDescr() {}

function makeShapes() {
    var i;
    var tempX;
    var tempY;
    var tempColor;
    var pos = [
        [200, 60, "A"],
        [293, 210, "B"],
        [143, 244, "C"],
        [126, 86, "D"]
    ];
    switch (getType().toLowerCase()) {
        case "any":
            break;
        case "parallelogram":
            pos = [
                [230, 64, "A"],
                [318, 201, "B"],
                [138, 235, "C"],
                [50, 98, "D"]
            ];
            break;
        case "square":
        case "rectangle":
        case "rhombus":
            break;
        case "trapezoid":
            pos = [
                [154, 113, "A"],
                [280, 124, "B"],
                [291, 217, "C"],
                [73, 198, "D"]
            ];
            break;
        case "kite":
            pos = [
                [259, 155, "A"],
                [201, 75, "B"],
                [108, 110, "C"],
                [145, 258, "D"]
            ];
            break;
        default:
    }
    shapes = [];
    for (i = 0; i < numPts; i++) {
        tempX = pos[i][0];
        tempY = pos[i][1];
        if (chooseQ) {
            tempX += 100;
        }
        tempColor = "rgb(" + 0 + "," + 0 + "," + 255 + ")";
        tempShape = {
            x: tempX,
            y: tempY,
            rad: 9,
            color: tempColor
        };
        shapes.push(tempShape);
        angleBox = new TextBox(g, "Arial", 24, 100, 1, "", 150, 110, false);
    }
}

function drawShapes() {
    var i;
    HiGraphics.lineStyle(1, "#aaaaaa", 0.1);
    HiGraphics.stt();
    g.moveTo(shapes[numPts - 1].x, shapes[numPts - 1].y)
    for (i = 0; i < numPts; i++) {
        g.lineTo(shapes[i].x, shapes[i].y);
        g.fillStyle = "rgba(255, 255, 0, 0.2)";
    }
    g.fill();
    g.stroke();
    var dbg = "";
    for (i = 0; i < numPts; i++) {
        g.fillStyle = "rgba(0, 0, 255, 0.3)";
        g.beginPath();
        g.arc(shapes[i].x, shapes[i].y, shapes[i].rad, 0, 2 * Math.PI, false);
        g.closePath();
        g.fill();
        g.fillStyle = "rgba(0, 0, 0, 0.8)";
        g.beginPath();
        g.arc(shapes[i].x, shapes[i].y, 2, 0, 2 * Math.PI, false);
        g.closePath();
        g.fill();
        g.font = "14px Arial";
        g.fillText(String.fromCharCode(65 + i), shapes[i].x + 5, shapes[i].y - 5, 100);
        quad.setxy(i, shapes[i].x, shapes[i].y)
        dbg += '[' + Math.floor(shapes[i].x) + "," + Math.floor(shapes[i].y) + "],";
    }
    quad.updateMe();
    if (anglesQ) quad.drawAngles(g);
    if (sidesQ) quad.drawSides(g);
    if (diagsQ) quad.drawDiags(g);
    if (mode == 'area') {
        quad.setDec(1);
        quad.setKnown("a", true);
        var base = Number(quad.getUserStr("a"));
        var ht = quad.getAltitude(0);
        if (ht < 0.3 || base < 0.3) {
            s = "Is that a Quadrilateral?";
        } else {
            s = "Area = &frac12; &times; "
            s += base;
            s += " &times; ";
            s += ht;
            s += " = ";
            s += Math.round(0.5 * base * ht, 2);
        }
        quad.drawAltitude(g, 0);
        quad.drawSides(g);
        document.getElementById(titleid).innerHTML = s;
    }
    if (mode == 'perim') {
        quad.drawSides(g);
        s = "Perimeter = ";
        var sum = 0;
        for (i = 0; i < numPts; i++) {
            var side = Math.round(quad.getVal(String.fromCharCode(97 + i)));
            s += side + " + "
            sum += side;
        }
        s = s.substring(0, s.length - 2);
        s += " = " + sum;
        document.getElementById(titleid).innerHTML = s;
    }
    if (mode == 'angles') {
        var angs = quad.drawAngles(g);
        var s = "";
        for (i = 0; i < numPts; i++) {
            s += angs[i] + "Â° + ";
        }
        s = s.substring(0, s.length - 2);
        s += " = 180Â°";
        document.getElementById(titleid).innerHTML = s;
    }
    if (mode == 'type') {
        angs = quad.drawAngles(g);
        document.getElementById(titleid).innerHTML = titleStr;
        document.getElementById(infoid).innerHTML = descrStr;
    }
}

function hiGraphics() {
    lineWidth = 5;
    lineJoin = "round";
    strokeStyle = "#333";
}
hiGraphics.prototype.clear = function(el) {
    g = el.getContext("2d");
    g.clearRect(0, 0, el.width, el.height);
    return true;
};
hiGraphics.prototype.lineStyle = function(width, clr, opacity) {
    lineWidth = width;
    lineJoin = "round";
    strokeStyle = clr;
};
hiGraphics.prototype.stt = function() {
    g.beginPath();
    g.lineWidth = lineWidth;
    g.lineJoin = lineJoin;
    g.strokeStyle = strokeStyle;
};
hiGraphics.prototype.drawCircle = function(g, circleX, circleY, circleRadius) {
    this.stt();
    g.fillStyle = "#FF0000";
    g.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
    g.stroke();
    return true;
};
hiGraphics.prototype.drawCompass = function(g, circleX, circleY, tickRadius) {
    var tickLen = 15;
    for (var i = 0; i < 360; i += 15) {
        var angle = i * Math.PI / 180.;
        if (i % 90) {
            this.lineStyle(1, "#888888", 1);
        } else {
            this.lineStyle(2, "#444444", 1);
        }
        this.stt();
        var cX = circleX + Math.cos(angle) * tickRadius;
        var cY = circleY - Math.sin(angle) * tickRadius;
        g.moveTo(cX, cY);
        cX = circleX + Math.cos(angle) * (tickRadius + tickLen);
        cY = circleY - Math.sin(angle) * (tickRadius + tickLen);
        g.lineTo(cX, cY);
        g.stroke();
        cX = circleX + Math.cos(angle) * (tickRadius + tickLen + 14) - 12;
        cY = circleY - Math.sin(angle) * (tickRadius + tickLen + 14) + 5;
        g.font = "12px Arial";
        g.fillText(i + "Â°", cX, cY, 100);
    }
};
hiGraphics.prototype.drawArc = function(g, midX, midY, radius, fromAngle, toAngle) {
    this.stt();
    g.arc(midX, midY, radius, fromAngle, toAngle);
    g.stroke();
};
hiGraphics.prototype.drawBox = function(g, midX, midY, radius, angle) {
    this.stt();
    var pts = [
        [0, 0],
        [Math.cos(angle), Math.sin(angle)],
        [Math.cos(angle) + Math.cos(angle + Math.PI / 2), Math.sin(angle) + Math.sin(angle + Math.PI / 2)],
        [Math.cos(angle + Math.PI / 2), Math.sin(angle + Math.PI / 2)],
        [0, 0]
    ];
    for (var i = 0; i < pts.length; i++) {
        if (i == 0) {
            g.moveTo(midX + radius * pts[i][0], midY + radius * pts[i][1]);
        } else {
            g.lineTo(midX + radius * pts[i][0], midY + radius * pts[i][1]);
        }
    }
    g.stroke();
};
hiGraphics.prototype.drawLine = function(g, xStt, yStt, xEnd, yEnd, sttStyle, endStyle) {
    this.stt();
    g.moveTo(xStt, yStt);
    g.lineTo(xEnd, yEnd);
    g.stroke();
}
var HiGraphics = new hiGraphics();

function TextBox(ig, ifont, ifontSize, iwd, ilines, itxt, ix, iy, iinputQ) {
    this.g = ig;
    this.font = ifont;
    this.fontSize = ifontSize;
    this.wd = iwd;
    this.lines = ilines;
    this.txt = itxt;
    this.posx = ix;
    this.posy = iy;
    this.clr = "#000000";
    this.refresh();
}
TextBox.prototype.refresh = function() {
    this.g.font = this.fontSize + "px " + this.font;
    this.g.fillStyle = this.clr;
    this.g.fillText(this.txt, this.posx, this.posy, this.wd);
};
TextBox.prototype.setText = function(itxt) {
    this.txt = itxt;
    this.refresh();
};
TextBox.prototype.setClr = function(iclr) {
    this.clr = iclr;
};

function Quad() {
    numPts = 4;
    sides = [3, 4, 5, 6];
    sideLabels = [];
    var sideTextArray = [];
    angleLabels = [];
    var angleTextArray = [];
    var defaultAngleLabels = ["A", "B", "C"];
    var defaultSideLabels = ["c", "a", "b"];
    var isAngleKnownQ = [false, false, false];
    var isSideKnownQ = [false, false, false];
    var dec = 1;
    var types = [];
    var fillQ = true;
    scaleFactor = 1;
    pts = new Array(numPts);
    for (var k = 0; k < numPts; k++) {
        pts[k] = new Pt(0, 0);
    }
    sideLabels = defaultSideLabels;
    angleLabels = defaultAngleLabels;
}
Quad.prototype.makeRegular = function(PointNum, midX, midY) {
    var movedQ = true;
    var obj = shapes[PointNum];
    var radius = dist(midX - obj.x, midY - obj.y);
    if (radius > 180) radius = 180;
    var SttAngle = Math.atan2(obj.y - midY, obj.x - midX);
    var dAngle = Math.PI * 2 / 4;
    for (var i = 0; i < numPts; i++) {
        obj = shapes[i];
        var angle = SttAngle + (i - PointNum) * dAngle;
        obj.x = midX + radius * Math.cos(angle);
        obj.y = midY + radius * Math.sin(angle);
        if (i != PointNum) {
            shapes[i].x = obj.x
            shapes[i].y = obj.y
        }
    }
    return movedQ;
}
Quad.prototype.makeParallel = function(PointNum) {
    var ANum = PointNum;
    var BNum = PointNum + 1;
    var CNum = PointNum + 2;
    var DNum = PointNum + 3;
    if (BNum >= numPts)
        BNum -= numPts;
    if (CNum >= numPts)
        CNum -= numPts;
    if (DNum >= numPts)
        DNum -= numPts;
    var Aobj = shapes[ANum];
    var Bobj = shapes[BNum];
    var Cobj = shapes[CNum];
    var Dobj = shapes[DNum];
    var ABx = Aobj.x - Bobj.x;
    var ABy = Aobj.y - Bobj.y;
    Dobj.x = Cobj.x + ABx;
    Dobj.y = Cobj.y + ABy;
}
Quad.prototype.makeKite = function(PointNum) {
    var ANum = 3;
    var BNum = 0;
    var CNum = BNum + 1;
    var DNum = CNum + 1;
    var Aobj = shapes[ANum];
    var Bobj = shapes[BNum];
    var Cobj = shapes[CNum];
    var Dobj = shapes[DNum];
    var Ox = (Bobj.x + Dobj.x) / 2;
    var Oy = (Bobj.y + Dobj.y) / 2;
    var Angle = 0;
    if (PointNum == ANum) {
        Angle = Math.atan2(Aobj.y - Oy, Aobj.x - Ox);
    }
    if (PointNum == BNum) {
        Angle = Math.atan2(Bobj.y - Oy, Bobj.x - Ox) + Math.PI / 2;
    }
    if (PointNum == CNum) {
        Angle = Math.atan2(Cobj.y - Oy, Cobj.x - Ox) + Math.PI;
    }
    if (PointNum == DNum) {
        Angle = Math.atan2(Dobj.y - Oy, Dobj.x - Ox) - Math.PI / 2;
    }
    var BO = dist(Bobj.x - Ox, Bobj.y - Oy);
    Bobj.x = Ox + BO * Math.cos(Angle - Math.PI / 2);
    Bobj.y = Oy + BO * Math.sin(Angle - Math.PI / 2);
    Dobj.x = Ox + BO * Math.cos(Angle + Math.PI / 2);
    Dobj.y = Oy + BO * Math.sin(Angle + Math.PI / 2);
    var AO = dist(Aobj.x - Ox, Aobj.y - Oy);
    Aobj.x = Ox + AO * Math.cos(Angle);
    Aobj.y = Oy + AO * Math.sin(Angle);
    var CO = dist(Cobj.x - Ox, Cobj.y - Oy);
    Cobj.x = Ox + CO * Math.cos(Angle - Math.PI);
    Cobj.y = Oy + CO * Math.sin(Angle - Math.PI);
}
Quad.prototype.makeRhombus = function(PointNum) {
    var ANum = PointNum - 1;
    var BNum = PointNum;
    var CNum = PointNum + 1;
    var DNum = PointNum + 2;
    if (ANum < 0)
        ANum += numPts;
    if (CNum >= numPts)
        CNum -= numPts;
    if (DNum >= numPts)
        DNum -= numPts;
    var Aobj = shapes[ANum];
    var Bobj = shapes[BNum];
    var Cobj = shapes[CNum];
    var Dobj = shapes[DNum];
    var Side = 150;
    var Angle = Math.atan2(Aobj.y - Bobj.y, Aobj.x - Bobj.x);
    Aobj.x = Bobj.x + Side * Math.cos(Angle);
    Aobj.y = Bobj.y + Side * Math.sin(Angle);
    Angle = Math.atan2(Cobj.y - Bobj.y, Cobj.x - Bobj.x);
    Cobj.x = Bobj.x + Side * Math.cos(Angle);
    Cobj.y = Bobj.y + Side * Math.sin(Angle);
    var AngleAB = Math.atan2(Bobj.y - Aobj.y, Bobj.x - Aobj.x);
    var AngleAC = Math.atan2(Cobj.y - Aobj.y, Cobj.x - Aobj.x);
    var AngleDiff = AngleAB - AngleAC;
    var AngleAD = AngleAB - AngleDiff * 2;
    Dobj.x = Aobj.x + Side * Math.cos(AngleAD);
    Dobj.y = Aobj.y + Side * Math.sin(AngleAD);
}
Quad.prototype.makeRectangle = function(PointNum) {
    var ANum = PointNum - 1;
    var BNum = PointNum;
    var CNum = PointNum + 1;
    var DNum = PointNum + 2;
    if (ANum < 0)
        ANum += numPts;
    if (CNum >= numPts)
        CNum -= numPts;
    if (DNum >= numPts)
        DNum -= numPts;
    var Aobj = shapes[ANum];
    var Bobj = shapes[BNum];
    var Cobj = shapes[CNum];
    var Dobj = shapes[DNum];
    var Angle = Math.atan2(Aobj.y - Bobj.y, Aobj.x - Bobj.x);
    var AD = dist(Dobj.x - Aobj.x, Dobj.y - Aobj.y);
    Cobj.x = Bobj.x + AD * Math.cos(Angle - Math.PI / 2);
    Cobj.y = Bobj.y + AD * Math.sin(Angle - Math.PI / 2);
    Dobj.x = Aobj.x + AD * Math.cos(Angle - Math.PI / 2);
    Dobj.y = Aobj.y + AD * Math.sin(Angle - Math.PI / 2);
}
Quad.prototype.makeTrapez = function(PointNum) {
    var ANum = 0;
    var BNum = 1;
    var CNum = 2;
    var DNum = 3;
    if (ANum < 0)
        ANum += numPts;
    if (CNum >= numPts)
        CNum -= numPts;
    if (DNum >= numPts)
        DNum -= numPts;
    var Aobj = shapes[ANum];
    var Bobj = shapes[BNum];
    var Cobj = shapes[CNum];
    var Dobj = shapes[DNum];
    var Angle = 0;
    var AB = 0;
    var CD = 0;
    switch (PointNum) {
        case 0:
            Angle = Math.atan2(Aobj.y - Bobj.y, Aobj.x - Bobj.x);
            CD = dist(Dobj.x - Cobj.x, Dobj.y - Cobj.y);
            Dobj.x = Cobj.x + CD * Math.cos(Angle);
            Dobj.y = Cobj.y + CD * Math.sin(Angle);
            break;
        case 1:
            Angle = Math.atan2(Bobj.y - Aobj.y, Bobj.x - Aobj.x);
            CD = dist(Dobj.x - Cobj.x, Dobj.y - Cobj.y);
            Cobj.x = Dobj.x + CD * Math.cos(Angle);
            Cobj.y = Dobj.y + CD * Math.sin(Angle);
            break;
        case 2:
            Angle = Math.atan2(Cobj.y - Dobj.y, Cobj.x - Dobj.x);
            AB = dist(Aobj.x - Bobj.x, Aobj.y - Bobj.y);
            Bobj.x = Aobj.x + AB * Math.cos(Angle);
            Bobj.y = Aobj.y + AB * Math.sin(Angle);
            break;
        case 3:
            Angle = Math.atan2(Dobj.y - Cobj.y, Dobj.x - Cobj.x);
            AB = dist(Aobj.x - Bobj.x, Aobj.y - Bobj.y);
            Aobj.x = Bobj.x + AB * Math.cos(Angle);
            Aobj.y = Bobj.y + AB * Math.sin(Angle);
            break;
    }
}
Quad.prototype.getAngles = function() {
    return [pts[0].getAngle(), pts[1].getAngle(), pts[2].getAngle()];
}
Quad.prototype.getNo = function(varName) {
    switch (varName) {
        case "A":
            return 0;
            break;
        case "B":
            return 1;
            break;
        case "C":
            return 2;
            break;
        case "D":
            return 2;
            break;
        case "a":
            return 1;
            break;
        case "b":
            return 2;
            break;
        case "c":
            return 3;
        case "d":
            return 0;
            break;
    }
    return -1;
}
Quad.prototype.getVal = function(varName) {
    switch (varName) {
        case "A":
        case "B":
        case "C":
        case "D":
            return pts[this.getNo(varName)].getAngle();
            break;
        case "a":
        case "b":
        case "c":
        case "d":
            return sides[this.getNo(varName)];
            break;
        default:
    }
    return 0;
};
Quad.prototype.setLabels = function(angleA, angleB, angleC, angleD, sidea, sideb, sidec, sided) {
    this.setLabel("A", angleA);
    this.setLabel("B", angleB);
    this.setLabel("C", angleC);
    this.setLabel("D", angleC);
    this.setLabel("a", sidea);
    this.setLabel("b", sideb);
    this.setLabel("c", sidec);
    this.setLabel("d", sidec);
}
Quad.prototype.setLabel = function(varName, labelStr) {
    var lblNo = this.getNo(varName);
    if (lblNo < 0)
        return;
    if (labelStr == null)
        return;
    switch (varName) {
        case "A":
        case "B":
        case "C":
        case "D":
            angleLabels[lblNo] = labelStr;
            break;
        case "a":
        case "b":
        case "c":
        case "d":
            sideLabels[lblNo] = labelStr;
            break;
        default:
    }
}
Quad.prototype.getUserStr = function(varName) {
    switch (varName) {
        case "A":
        case "B":
        case "C":
        case "D":
            if (this.isKnown(varName)) {
                return (this.userAngle(pts[this.getNo(varName)].getAngle()).toString() + "Âº");
            } else {
                return (angleLabels[this.getNo(varName)]);
            }
            break;
        case "a":
        case "b":
        case "c":
        case "d":
            if (this.isKnown(varName)) {
                return (this.userSide(this.getNo(varName)).toString());
            } else {
                return (sideLabels[this.getNo(varName)]);
            }
            break;
        default:
    }
    return "";
}
Quad.prototype.setxy = function(ptNo, ix, iy) {
    pts[ptNo].setxy(ix, iy);
}
Quad.prototype.updateMe = function() {
    setAngles(pts);
    sides = getSides(pts);
}
Quad.prototype.setAllKnown = function(knownQ) {
    isAngleKnownQ = [knownQ, knownQ, knownQ, knownQ]
    isSideKnownQ = [knownQ, knownQ, knownQ, knownQ]
}
Quad.prototype.setKnown = function(varName, knownQ) {
    switch (varName) {
        case "A":
        case "B":
        case "C":
        case "D":
            isAngleKnownQ[this.getNo(varName)] = knownQ;
            break;
        case "a":
        case "b":
        case "c":
        case "d":
            isSideKnownQ[this.getNo(varName)] = knownQ;
            break;
        default:
    }
}
Quad.prototype.isKnown = function(varName) {
    switch (varName) {
        case "A":
        case "B":
        case "C":
        case "D":
            return isAngleKnownQ[this.getNo(varName)];
            break;
        case "a":
        case "b":
        case "c":
        case "d":
            return isSideKnownQ[this.getNo(varName)];
            break;
        default:
    }
    return false;
}
Quad.prototype.userSide = function(i) {
    return Math.round(sides[i] * scaleFactor, this.dec);
}
Quad.prototype.userAngle = function(x) {
    return Math.round(x * 180 / Math.PI, this.dec);
}
Quad.prototype.drawSides = function(g) {
    var ptC = new Pt();
    ptC.setAvg(pts);
    g.fillStyle = "#000000";
    g.font = "bold 12px Arial";
    var ptM = new Pt();
    for (var i = 0; i < 4; i++) {
        ptM.setAvg([pts[i], pts[loop(i, 0, 3, 1)]]);
        ptM.interpolate(ptM, ptC, 1.2);
        var side = Math.round(this.getVal(String.fromCharCode(97 + loop(i + 2, 0, 3, 1))));
        g.fillText(side, ptM.x - 10, ptM.y + 5, 100);
    }
}
Quad.prototype.drawAngles = function(g) {
    var angSum = 0;
    var angDescr = "";
    var angs = [];
    for (var i = 0; i < pts.length; i++) {
        var angDeg = Math.round(pts[i].getAngle() * 180 / Math.PI);
        var d = 30;
        if (angDeg == 90) {
            HiGraphics.lineStyle(2, 0x888888);
            HiGraphics.drawBox(g, pts[i].x, pts[i].y, 25, pts[i].angleOut - Math.PI / 2);
        } else {
            if (angDeg > 90) {
                HiGraphics.lineStyle(2, 0xff0000);
                d = Math.max(20, 30 - (angDeg - 90) / 6); // slightly smaller diameter looks better on large angles
            } else {
                HiGraphics.lineStyle(2, 0x4444FF);
            }
            g.fillStyle = "rgba(0, 0, 255, 0.3)";
            g.beginPath();
            g.moveTo(pts[i].x, pts[i].y);
            g.arc(pts[i].x, pts[i].y, d, pts[i].angleIn, pts[i].angleOut, false);
            g.closePath();
            g.fill();
        }
        var ang = this.userAngle(pts[i].getAngle());
        if (i < 3) {
            angSum += ang;
        } else {
            ang = 360 - angSum;
            if (ang < 0) ang += 360;
        }
        angs[i] = ang;
        angDescr += ang + "Â° + "
        var aMid = (pts[i].angleIn + pts[i].angleOut) / 2;
        var txtPt = new Pt(0, 0)
        txtPt.x = pts[i].x + (d + 15) * Math.cos(aMid) - 0
        txtPt.y = pts[i].y + (d + 15) * Math.sin(aMid) - 0
        g.fillStyle = "rgba(0, 0, 255, 1)";
        g.fillText(Math.round(ang) + "Â°", txtPt.x - 10, txtPt.y + 5, 100);
    }
    return angs
}
Quad.prototype.drawDiags = function(g) {
    g.strokeStyle = "#666666";
    var diagCount = 0;
    for (var i = 0; i < pts.length - 2; i++) {
        for (var j = i + 2; j < pts.length; j++) {
            if (i == 0 && j == pts.length - 1) {} else {
                g.beginPath();
                g.moveTo(pts[i].x, pts[i].y);
                g.lineTo(pts[j].x, pts[j].y);
                g.stroke();
                diagCount++;
            }
        }
    }
}
Quad.prototype.setDec = function(decimals) {
    this.dec = decimals;
}
Line.prototype.getLength = function(n) {
    var dx = this.b.x - this.a.x;
    var dy = this.b.y - this.a.y;
    return Math.sqrt(dx * dx + dy * dy) * scaleFactor;
}

function Pt(ix, iy) {
    this.x = ix;
    this.y = iy;
    var prevx;
    var prevy;
    var a;
    var prevQ = false;
    var validPtQ;
    angleIn = 0;
    angleOut = 0;
}
Pt.prototype.setxy = function(ix, iy) {
    this.x = ix;
    this.y = iy;
    validPtQ = true;
}
Pt.prototype.setPrevPt = function() {
    if (validPtQ) {
        prevx = this.x
        prevy = this.y;
        prevQ = true;
    }
}
Pt.prototype.getAngle = function() {
    return this.angleOut - this.angleIn;
}
Pt.prototype.drawMe = function(g) {
    g.fillStyle = "rgba(0, 0, 255, 0.3)";
    g.beginPath();
    g.arc(this.x, this.y, 20, 0, 2 * Math.PI, false);
    g.closePath();
    g.fill();
}
Pt.prototype.getAvg = function(pts) {
    var xSum = 0;
    var ySum = 0;
    for (var i = 0; i < pts.length; i++) {
        xSum += pts[i].x;
        ySum += pts[i].y;
    }
    newPt = new Pt(xSum / pts.length, ySum / pts.length);
    newPt.x = xSum / pts.length;
    newPt.y = ySum / pts.length;
    return newPt;
}
Pt.prototype.setAvg = function(pts) {
    this.setPrevPt();
    var newPt = this.getAvg(pts);
    this.x = newPt.x;
    this.y = newPt.y;
    validPtQ = true;
}
Pt.prototype.interpolate = function(pt1, pt2, f) {
    this.setPrevPt();
    this.x = pt1.x * f + pt2.x * (1 - f);
    this.y = pt1.y * f + pt2.y * (1 - f);
    validPtQ = true;
}
Pt.prototype.translate = function(pt, addQ) {
    addQ = typeof addQ !== 'undefined' ? addQ : true;
    t = new Pt(this.x, this.y);
    t.x = this.x
    t.y = this.y
    if (addQ) {
        t.x += pt.x;
        t.y += pt.y
    } else {
        t.x -= pt.x;
        t.y -= pt.y
    }
    return t;
}
Pt.prototype.multiply = function(fact) {
    return new Pt(this.x * fact, this.y * fact);
}
Pt.prototype.multiplyMe = function(fact) {
    this.x *= fact;
    this.y *= fact;
}

function setAngles(pts) {
    var CW = getClockwise(pts);
    var numPoints = pts.length;
    var angles = [];
    for (var i = 0; i < numPoints; i++) {
        var pt = pts[i];
        var ptm1 = pts[loop(i, 0, numPoints - 1, -1)];
        var ptp1 = pts[loop(i, 0, numPoints - 1, 1)];
        var a1 = Math.atan2(ptm1.y - pt.y, ptm1.x - pt.x);
        var a2 = Math.atan2(ptp1.y - pt.y, ptp1.x - pt.x);
        if (CW == 1) {
            var temp = a1;
            a1 = a2;
            a2 = temp;
        }
        if (a1 > a2)
            a2 += 2 * Math.PI;
        pt.angleIn = a1;
        pt.angleOut = a2;
    }
}

function getClockwise(pts) {
    var numPoints = pts.length;
    var count = 0;
    for (var i = 0; i < numPoints; i++) {
        var pt = pts[i];
        var ptm1 = pts[loop(i, 0, numPoints - 1, -1)];
        var ptp1 = pts[loop(i, 0, numPoints - 1, 1)];
        var z = 0;
        z += (pt.x - ptm1.x) * (ptp1.y - pt.y);
        z -= (pt.y - ptm1.y) * (ptp1.x - pt.x);
        if (z < 0) {
            count--;
        } else if (z > 0) {
            count++;
        }
    }
    if (count > 0)
        return (1);
    if (count == 0)
        return (0);
    return (-1);
}

function getSides(pts) {
    var numPoints = pts.length;
    var sides = [];
    for (var i = 0; i < numPoints; i++) {
        var pt = pts[i];
        var ptp1 = pts[loop(i, 0, numPoints - 1, 1)];
        sides.push(dist(ptp1.x - pt.x, ptp1.y - pt.y));
    }
    return (sides);
}

function dist(dx, dy) {
    return (Math.sqrt(dx * dx + dy * dy));
}

function loop(currNo, minNo, maxNo, incr) {
    currNo += incr;
    var was = currNo;
    var range = maxNo - minNo + 1;
    if (currNo < minNo) {
        currNo = maxNo - (-currNo + maxNo) % range;
    }
    if (currNo > maxNo) {
        currNo = minNo + (currNo - minNo) % range;
    }
    return currNo;
}

function constrain(min, val, max) {
    return (Math.min(Math.max(min, val), max));
}

function Line(pt1, pt2) {
    this.a = pt1;
    this.b = pt2;
}
Line.prototype.getMidPt = function() {
    return new Pt((this.a.x + this.b.x) / 2, (this.a.y + this.b.y) / 2);
}
Line.prototype.getClosestPoint = function(toPt, inSegmentQ) {
    var AP = toPt.translate(this.a, false);
    var AB = this.b.translate(this.a, false);
    var ab2 = AB.x * AB.x + AB.y * AB.y;
    var ap_ab = AP.x * AB.x + AP.y * AB.y;
    var t = ap_ab / ab2;
    if (inSegmentQ) {
        t = constrain(0, t, 1);
    }
    closest = this.a.translate(AB.multiply(t));
    return closest;
}
Line.prototype.setLen = function(newLen, fromMidQ) {
    fromMidQ = typeof fromMidQ !== 'undefined' ? fromMidQ : true;
    var len = this.getLength();
    if (fromMidQ) {
        var midPt = this.getMidPt();
        var halfPt = new Pt(this.a.x - midPt.x, this.a.y - midPt.y);
        halfPt.multiplyMe(newLen / len);
        pt1 = midPt.translate(halfPt);
        pt2 = midPt.translate(halfPt, false);
    } else {
        var diffPt = new Pt(this.a.x - this.b.x, this.a.y - this.b.y);
        diffPt.multiplyMe(newLen / len);
        pt2 = pt1.translate(diffPt, false);
    }
}
Line.prototype.getAngle = function() {
    return Math.atan2(this.b.y - this.a.y, this.b.x - this.a.x);
}