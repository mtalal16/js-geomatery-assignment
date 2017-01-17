function drawCanvas() {
    canvasid = "canvas";
    titleid = "title";
    infoid = "info";
    dragging = false;
    w = 1200;
    h = 600;
    clickCount = 0;
    paralleloPos = [];
    var s = '';
    s += '<div style="position:relative; width:' + w + 'px; height:' + h + 'px; border: 1px solid blue; border-radius: 9px; margin:auto; display:block; ">';
    s += '<canvas id="' + canvasid + '" width="' + w + '" height="' + h + '" style="z-index:4;" onclick="getClickPos(event)"></canvas>';
    s += '<div id="' + titleid + '" style="font: 12pt arial; font-weight: bold; position:absolute; top:14px; left:0px; width:540px; text-align:center;"></div>';
    s += '<div id="' + infoid + '" style="font: 10pt arial; font-weight: bold; color: #6600cc; position:absolute; top:35px; left:0px; width:540px; text-align:center;"></div>';
    s += '<button id="diagsBtn" onclick="toggleDiags()" style="z-index:2; position:absolute; right:63px; bottom:3px;" class="togglebtn lo" >Diags</button>';
    s += '<button id="resetBtn" onclick="reset()" style="z-index:2; position:absolute; right:3px; bottom:3px;" class="togglebtn" >Reset</button>';
    s += '</div>';
    document.write(s);
}

function getClickPos(event){
    clickCount++;
    el = document.getElementById(canvasid);
    g = el.getContext("2d");
    var rect = el.getBoundingClientRect();
    if(clickCount <= 3){
        posx = event.x - rect.left;
        posy = event.y - rect.top;
        g.fillStyle = "red";
        g.beginPath();
        g.arc(posx, posy, 11, 0, 2*Math.PI);
        g.fill();
        paralleloPos.push([posx,posy,""]);
        if(clickCount === 3){
            paralleloPos.push([0,0,""]);
            drawParallelogram(paralleloPos);
        }
    }else{
        event.preventDefault();
    }
    
}

function drawParallelogram(paralleloPos){
    initParalleloProgram();
    quad = new Quad();
    makeParalleloGramShapes(paralleloPos);
    drawParalleloGramShapes();
    theCanvas.addEventListener("mousedown", mouseDownListener, false);
    theCanvas.addEventListener('touchstart', ontouchstart, false);
    theCanvas.addEventListener("mousemove", domousemove, false);
    doType();
}
function initParalleloProgram() {
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
    diagsQ = false;
    numPts = 4;
    shapes = [];
    area=[];
}
function reset() {
    clickCount = 0;
    initParalleloProgram();
    paralleloPos = [];
    theCanvas.removeEventListener("mousedown", mouseDownListener, false);
    theCanvas.removeEventListener('touchstart', ontouchstart, false);
    theCanvas.removeEventListener("mousemove", domousemove, false);    
}

function update() {
    doType();
}

function toggleDiags() {
    diagsQ = !diagsQ;
    update();
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
    quad.makeParallel(dragNo);
    HiGraphics.clear(el);
    drawParalleloGramShapes();
}

function makeParalleloGramShapes(newPos) {
    var i;
    var tempX;
    var tempY;
    var tempColor;
    var pos  = newPos;
    shapes = [];
    for (i = 0; i < numPts; i++) {
        tempX = pos[i][0];
        tempY = pos[i][1];
        tempColor = "rgb(" + 0 + "," + 0 + "," + 255 + ")";
        tempShape = {
            x: tempX,
            y: tempY,
            rad: 11,
            color: tempColor
        };
        shapes.push(tempShape);
    }
}

function drawParalleloGramShapes() {
    var i;
    HiGraphics.lineStyle(1, "blue", 0.1);
    HiGraphics.stt();
    g.moveTo(shapes[numPts - 1].x, shapes[numPts - 1].y)
    for (i = 0; i < numPts; i++) {
        g.lineTo(shapes[i].x, shapes[i].y);
    }
    g.stroke();
    var dbg = "";
    for (i = 0; i < numPts; i++) {
        g.fillStyle = "red";
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
        g.fillText(String.fromCharCode(65 + i)+" ("+ shapes[i].x+","+ shapes[i].y+")", shapes[i].x + 5, shapes[i].y - 15, 100);
        quad.setxy(i, shapes[i].x, shapes[i].y)
        dbg += '[' + Math.floor(shapes[i].x) + "," + Math.floor(shapes[i].y) + "],";
    }
    quad.updateMe();
    quad.drawSides(g);
    quad.drawCircle(g);
    if (diagsQ) quad.drawDiags(g);
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

var HiGraphics = new hiGraphics();

function Quad() {
    numPts = 4;
    sides = [3, 4, 5, 6];
    var dec = 1;
    var types = [];
    var fillQ = true;
    scaleFactor = 1;
    pts = new Array(numPts);
    for (var k = 0; k < numPts; k++) {
        pts[k] = new Pt(0, 0);
    }
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

Quad.prototype.setxy = function(ptNo, ix, iy) {
    pts[ptNo].setxy(ix, iy);
}
Quad.prototype.updateMe = function() {
    setAngles(pts);
    sides = getSides(pts);
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
        if(i < 2){
            area.push(side);
        }
    }
}
Quad.prototype.drawCircle = function(g) {
    var midPointX = (shapes[0].x + shapes[2].x)/2;
    var midPointY = (shapes[0].y + shapes[2].y)/2;
    var radius = Math.sqrt((area[0]*area[1])/2);
    HiGraphics.lineStyle(1, "yellow", 0.1);
    HiGraphics.stt();
    g.beginPath();
    g.arc(midPointX, midPointY, radius, 0, 2 * Math.PI, false);
    g.stroke();
    g.closePath();
    area= [];
};

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



