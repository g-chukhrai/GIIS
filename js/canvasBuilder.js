var canvas, context;
var width, height, halfWidth, halfHeight;
var canvasStep = 10;
var scaleFactor = 1;
var map = [];
var canvasElem,info, steps;
var moveCanvas = false;
var oldPosX,oldPosY;
var POINT_COLOR = "#0000ff";
var POINT_HOVER_COLOR = "#ff0000";

$(function() {
    initCanvas()
});

function initCanvas() {
    canvas = document.getElementById("canvas");
    canvasElem = $("#canvas");
    info = $("#info");
    steps = $("#steps");
    context = canvas.getContext('2d');

    setCtxCenter();
    width = canvas.width;
    halfWidth = width / 2;
    height = canvas.height;
    halfHeight = height / 2;

    drawField();
    initEvents();
}

function changeStep() {
    var newStep = parseInt($("#step").val());
    if (newStep > 0 && newStep <= 25)
        canvasStep = newStep;
    clearCanvas();
}

var tid = 0;
var speed = 100;
function toggleOff() {
    if (tid != 0) {
        clearInterval(tid);
        tid = 0;
        moveCanvas = false;
        oldPosX = oldPosY = null;
    }
}

function initEvents() {
    canvasElem.mousedown(function() {
        if (tid == 0)
            tid = setInterval(function() {
                moveCanvas = true;
            }, speed);
    });

    canvasElem.mouseup(function(e) {
        if (!moveCanvas)
            drawPoint(mouseLocalCord(e).x, mouseLocalCord(e).y);
        toggleOff();
    });

    canvasElem.mousemove(function(e) {
        if (moveCanvas) {
            if (oldPosX != null && oldPosY != null) {
                context.translate((e.pageX - oldPosX)/scaleFactor, (e.pageY - oldPosY)/scaleFactor);
                clearContext();
                drawField();
            }
            oldPosX = e.pageX;
            oldPosY = e.pageY;
        }
        else info.html("x: " + mouseLocalCord(e).x + " y: " + mouseLocalCord(e).y);
    });

    canvasElem.scroll(function() {
        info.html('<div>Handler for .scroll() called.</div>');
    });

    window.addEventListener('keydown', move, true);
    canvas.addEventListener('DOMMouseScroll', scroll, false);
}

function scroll(e) {
    var rolled = ('wheelDelta' in e) ? e.wheelDelta : -40 * e.detail;
    if (rolled > 0)
        upScale();
    else
        downScale();
    console.log(rolled);
}

function move(e) {
    var keyCode = e.keyCode;
    if (keyCode == 38)
        context.translate(0, -canvasStep);
    else if (keyCode == 40)
        context.translate(0, +canvasStep);
    else if (keyCode == 37)
        context.translate(- canvasStep, 0);
    else if (keyCode == 39)
        context.translate(canvasStep, 0);
    else
        return;
    clearContext();
    drawField();
}

function mouseLocalCord(e) {
    var offset = canvasElem.offset();
    var x = Math.floor((e.pageX - offset.left - halfWidth) / canvasStep / scaleFactor);
    var y = Math.floor((e.pageY - offset.top - halfHeight) / canvasStep / scaleFactor);
    return {"x" : x, "y" : -y};
}

function setCtxCenter() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(canvas.width / 2, canvas.height / 2);
}

function clearCanvas() {
    map = [];
    resetScale();
    steps.html("");
}

function clearContext() {
    context.save();
    context.beginPath();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function upScale() {
    clearContext();
    scaleFactor += 0.1;
    context.scale(1.1, 1.1);
    drawField();
}

function resetScale() {
    clearContext();
    scaleFactor = 1;
    setCtxCenter();
    drawField();
}

function downScale() {
    clearContext();
    context.scale(0.9, 0.9);
    scaleFactor -= 0.1;
    drawField();
}