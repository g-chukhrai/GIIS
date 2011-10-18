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

//Point moving
var controlMap = []; //массив "контрольных точек" 
var movingPointNumber; //индекс перемещаемой контрольной точки в массиве controlMap
var algorythmType; 

var MODE = {
	MAIN:0,
  MOVE_CANVAS :1,
  SCALE_CANVAS : 2,
  DRAW_POINT: 3,
  DELETE_POINT :4,
  MOVE_POINT: 5
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

function setMode(mode) {
	algorythmType = mode;
}

function initJQueryComponents() {
    $('#xPos').spinner({ min: -100, max: 100 });
    $('#yPos').spinner({ min: -100, max: 100});
    $('#step').spinner({ min: 1, max: 25 , step: 5 });
    $('#radius').spinner({ min: 1, max: 50 , step: 5 });
    $('#koef').spinner({ min: 1, max: 25 , step: 1 });
    $('#a').spinner({ min: 1, max: 50 , step: 1 });
    $('#b').spinner({ min: 1, max: 50 , step: 1 });
//	$('#accordion').accordion({event: "click hoverintent"});
  
}

function initEvents() {
    canvasElem.mousedown(function() {
	mode = MODE.DRAW_POINT;
	if(tid==0) {
	 tid = setInterval(function(){	
		mode = MODE.MOVE_POINT;
	 },speed);
	}});
	

    canvasElem.mouseup(function(e) {
		var posX = mouseLocalCord(e).x;
		var posY = mouseLocalCord(e).y;
		if (mode == MODE.DRAW_POINT){
            drawPoint(posX, posY);		
		} else if (mode == MODE.MOVE_POINT){
			mode = MODE.MAIN;
		}
        toggleOff();
    });

    canvasElem.mousemove(function(e) {

		if (mode == MODE.MOVE_POINT) {
		var posX = mouseLocalCord(e).x;
		var posY = mouseLocalCord(e).y;			
		if (controlPointExists(posX, posY)) {
				mode = MODE.MOVE_POINT;
				movingPointNumber = getPointNumber(posX, posY);
			} else {
				addToMap(posX, posY, true);
				drawAllPoints();
			}
		} else if (mode == MODE.MOVE_CANVAS) {
            if (oldPosX != null && oldPosY != null) {
                context.translate((e.pageX - oldPosX) / scaleFactor, (e.pageY - oldPosY) / scaleFactor);
                clearContext();
                drawField();
            }
            oldPosX = e.pageX;
            oldPosY = e.pageY;
        } else if (mode == MODE.MOVE_POINT) {	
			changePointPosition(mouseLocalCord(e).x, mouseLocalCord(e).y, movingPointNumber);
			drawAlgorythm();
		} else if (algorythmType == 3) {
			drawAlgorythm();
		} else info.html("x: " + mouseLocalCord(e).x + " y: " + mouseLocalCord(e).y);
    });

    window.addEventListener('keydown', move, true);
    canvas.addEventListener('DOMMouseScroll', scroll, false);
}