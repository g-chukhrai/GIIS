var canvas, context;
var width, height, halfWidth, halfHeight;
var canvasStep = 10;
var scaleFactor = 1;
var map = [];
var canvasElem,info, steps;
var oldPosX,oldPosY;
var POINT_COLOR = "#0000ff";
var POINT_CONTROL_COLOR = "#ff0000";
var POINT_HOVER_COLOR = "#ff0000";
var tid = 0;
var speed = 100;

var controlMap = []; //массив "контрольных точек"
var movingPointNumber; //индекс перемещаемой контрольной точки в массиве controlMap
var algorithmType;
var posX;
var posY;

var MODE = {
    MAIN: "MAIN",
    MOVE_CANVAS : "MOVE_CANVAS",
    SCALE_CANVAS : "SCALE_CANVAS",
    DRAW_POINT: "DRAW_POINT",
    DELETE_POINT : "DELETE_POINT",
    MOVE_POINT: "MOVE_POINT"
};

var mode = MODE.MAIN;

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
    clearCanvas();

});

function setMode(mode, isRandom) {
    algorithmType = mode;
    drawAlgorithm(isRandom);
}

function initJQueryComponents() {
    $('#xPos').spinner({ min: -100, max: 100 });
    $('#yPos').spinner({ min: -100, max: 100});
    $('#step').spinner({ min: 1, max: 25 , step: 5 });
    $('#radius').spinner({ min: 1, max: 50 , step: 5 });
    $('#koef').spinner({ min: 1, max: 25 , step: 1 });
    $('#a').spinner({ min: 1, max: 50 , step: 1 });
    $('#b').spinner({ min: 1, max: 50 , step: 1 });
//	$('#accordion').accordion();
}


function initEvents() {
    canvasElem.mousedown(function(e) {
        mode = MODE.DRAW_POINT;
        posX = mouseLocalCord(e).x;
        posY = mouseLocalCord(e).y;
        if (tid == 0) {
            tid = setInterval(function() {
                mode = MODE.MOVE_POINT;
            }, speed);
        }

    });

    canvasElem.mouseup(function() {
        if (mode == MODE.DRAW_POINT) {
            drawPoint(posX, posY);
            if (algorithmType != null && movingPointNumber == null) {
                addToMap(posX, posY, true);
                drawAllPoints();
            }
        } else if (mode == MODE.MOVE_POINT) {
            mode = MODE.MAIN;
            movingPointNumber = null;
        }
        toggleOff();
    });

    canvasElem.mousemove(function(e) {
        if (mode == MODE.MOVE_CANVAS) {
            if (oldPosX != null && oldPosY != null) {
                context.translate((e.pageX - oldPosX) / scaleFactor, (e.pageY - oldPosY) / scaleFactor);
                clearContext();
                drawField();
            }
            oldPosX = e.pageX;
            oldPosY = e.pageY;
        } else if (mode == MODE.MOVE_POINT) {
            if (movingPointNumber == null) {
                movingPointNumber = controlPointExists(posX, posY);
                if (movingPointNumber == null) {
                    addToMap(posX, posY, true);
                    drawAllPoints();
                }
            }
            if (movingPointNumber != null) {
                changePointPosition(mouseLocalCord(e).x, mouseLocalCord(e).y, movingPointNumber);
                drawAlgorithm(false);
            }
        } else if (mode = MODE.MAIN) {
            var x = mouseLocalCord(e).x;
            var y = mouseLocalCord(e).y;
            info.html("x: " + x + " y: " + y);
        } else if (mode = MODE.DRAW_POINT && algorithmType == 3) {
            drawAlgorithm(false);
        }

    });

    window.addEventListener('keydown', move, true);
//    canvas.addEventListener('DOMMouseScroll', scroll, false);
}