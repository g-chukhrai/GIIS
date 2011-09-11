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
var tid = 0;
var speed = 100;

$(function() {
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
    initJQueryComponents();
});

function initJQueryComponents() {
    $('#xPos').spinner({ min: -100, max: 100 });
    $('#yPos').spinner({ min: -100, max: 100});
    $('#step').spinner({ min: 1, max: 25 , step: 5 });
    $('#radius').spinner({ min: 1, max: 50 , step: 5 });
    $('#koef').spinner({ min: 1, max: 25 , step: 1 });
    $('#a').spinner({ min: 1, max: 50 , step: 1 });
    $('#b').spinner({ min: 1, max: 50 , step: 1 });
    $("#accordion").accordion({event: "click hoverintent"});
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
                context.translate((e.pageX - oldPosX) / scaleFactor, (e.pageY - oldPosY) / scaleFactor);
                clearContext();
                drawField();
            }
            oldPosX = e.pageX;
            oldPosY = e.pageY;
        }
        else info.html("x: " + mouseLocalCord(e).x + " y: " + mouseLocalCord(e).y);
    });

    window.addEventListener('keydown', move, true);
    canvas.addEventListener('DOMMouseScroll', scroll, false);
}