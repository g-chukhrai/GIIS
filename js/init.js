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
var LINE_COLOR = "blue";
var CORAL = "#ff7f50";
var WHITE_SMOKE = "#f5f5f5";
var tid = 0;
var speed = 100;

var controlMap = []; //массив "контрольных точек"
var movingPointNumber; //индекс перемещаемой контрольной точки в массиве controlMap
var posX;
var posY;
var showInfoCheckBox;
var hidePlanesCheckBox;

var MODE = {
    MAIN: "MAIN",
    MOVE_CANVAS : "MOVE_CANVAS",
    DRAW_POINT: "DRAW_POINT",
    DELETE_POINT : "DELETE_POINT",
    MOVE_POINT: "MOVE_POINT",
    CUBE: "CUBE",
    ADD_SEED_PIXEL: "ADD_SEED_PIXEL",
    TRIANGULATION: "TRIANGULATION"

};

var LAB_MODE = {
    MAIN: "MAIN",
    HERMITE: "HERMITE",
    BREZIER: "BREZIER",
    BSPLINE: "BSPLINE",
    CUBE: "CUBE",
    FILL_AREA: "FILL_AREA",
    HIDE_LINES: "HIDE_LINES"
};

var mode = MODE.MAIN;
var labMode = LAB_MODE.MAIN;

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

function setMode(newMode) {
    mode = newMode;
}

function setLabMode(newMode) {
    labMode = newMode;
}

function initJQueryComponents() {
    $('#xPos').spinner({ min: -100, max: 100 });
    $('#yPos').spinner({ min: -100, max: 100});
    $('#step').spinner({ min: 1, max: 25 , step: 5 });
    $('#radius').spinner({ min: 1, max: 50 , step: 5 });
    $('#koef').spinner({ min: 1, max: 25 , step: 1 });
    $('#a').spinner({ min: 1, max: 50 , step: 1 });
    $('#b').spinner({ min: 1, max: 50 , step: 1 });
    $('#d').spinner({ min: 5, max: 100 , step: 5 });
    $('#fieldSize').spinner({ min: 10, max: 150 , step: 10 });
    $('#linesCount').spinner({ min: 1, max: 50 , step: 1 });
    showInfoCheckBox = $('input[name="showInfo"]');
    hidePlanesCheckBox = $('input[name="hidePlanes"]');

    $('#accordion').accordion();

    $("#mover").draggable({
        revert: true,
        containment: "parent",
        create: function() {
            $(this).data("startLeft", parseInt($(this).css("left")));
            $(this).data("startTop", parseInt($(this).css("top")));
        },
        drag: function(event, ui) {
            var rel_left = ui.position.left - parseInt($(this).data("startLeft"));
            var rel_top = ui.position.top - parseInt($(this).data("startTop"));
            $('#coords').text(rel_left + ", " + rel_top);
        },
        stop: function() {
            $('#coords').html("&nbsp;");
        }
    });
}


function initEvents() {
    canvasElem.mousedown(function(e) {
        posX = mouseLocalCord(e).x;
        posY = mouseLocalCord(e).y;
        if (mode == MODE.TRIANGULATION) {
            vertices.push(new Delaunay.Point(posX, -posY));
            reDraw(vertices);
        }
        else if (mode != MODE.ADD_SEED_PIXEL) {
            mode = MODE.DRAW_POINT;
            if (tid == 0) {
                tid = setInterval(function() {
                    mode = MODE.MOVE_POINT;
                }, speed);
            }
        }

    });

    canvasElem.mouseup(function() {
        if (mode == MODE.DRAW_POINT) {
            drawPoint(posX, posY);
            if (labMode != LAB_MODE.MAIN && movingPointNumber == null) {
                addToMap(posX, posY, true);
                drawAllPoints();
            }
        } else if (mode == MODE.MOVE_POINT) {
            mode = MODE.MAIN;
            movingPointNumber = null;
        } else if (mode == MODE.ADD_SEED_PIXEL) {
            seedPixel = {"x": posX, "y": posY, "z":1};
            drawPoint(posX, posY);
            mode = MODE.MAIN;
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
                clearStandartMap();
                if (labMode == LAB_MODE.HIDE_LINES) {
                    drawHideLines();
                } else if (labMode == LAB_MODE.FILL_AREA) {
                    stopThread = true;
                    paintArea();
                } else {
                    drawAlgorithm(false);
                }
            }
        } else if (mode == MODE.MAIN) {
            var x = mouseLocalCord(e).x;
            var y = mouseLocalCord(e).y;
            info.html("x: " + x + " y: " + y);
        } else if (mode == MODE.DRAW_POINT && labMode == LAB_MODE.BSPLINE) {
            drawAlgorithm(false);
        }

    });

    window.addEventListener('keydown', move, true);
//    canvas.addEventListener('DOMMouseScroll', scroll, false);
}