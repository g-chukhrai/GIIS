var borders = []; //границы фигуры
var seedPixel = null; //затравочный пиксель
var PIXEL_COUNT = 100;
var HALF_PIXEL_COUNT = PIXEL_COUNT/2;

//Функция отрисовки фигуры по точкам на холсте
function paintArea() {
    borders = [];
    var length = controlMap.length;
    for (var i = 0; i < length; i++) {
        var p1 = controlMap[i];
        var p2 = controlMap[i == length - 1 ? 0 : i + 1];
        drawBrez({x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y});
    }
    drawAllPoints();
    map = borders;
	createPixelMatrix();
}

function checkExist(x, y, stack) {
    if (!pointExists(x, y))
	{
		stack.push({x: x, y:y, z:1});
	}
}

var pixelMatrix = null;
function createPixelMatrix() {
	pixelMatrix = new Array(PIXEL_COUNT);
	for (var i = 0; i < PIXEL_COUNT; i++) {
		pixelMatrix[i] = new Array(PIXEL_COUNT);
		for (var j = 0; j < PIXEL_COUNT; j++) {
			pixelMatrix[i][j] = 0;
		}
	}
	$.each(map, function(i,val) {
		pixelMatrix[val.x+HALF_PIXEL_COUNT][val.y+HALF_PIXEL_COUNT] = 1;
    });
}

//Функция, реализующая алгоритм заполнения с затравкой
function simpleFilling() {
	if (seedPixel == null) return false;
    var stack = new Array();
    stack.push(seedPixel);
    while (stack.length != 0) {
        var point = stack.pop();
        var x = point.x;
        var y = point.y;
        if (!pointExists(x, y)) {
            drawPoint(x, y);
		}
        checkExist(++x, y, stack);
        checkExist(--x, ++y, stack);
        checkExist(--x, --y, stack);
        checkExist(++x, --y, stack);
    }
	seedPixel = null;
	pixelMatrix = null;
}

// Функция, реализующая построчный алгоритм заполнения с затравкой
function stringFilling() {
	if (seedPixel == null) return false;
    var stack = new Array();
    stack.push(seedPixel);
    drawPoint(seedPixel.x, seedPixel.y);
    var minX = getXLeft() - 1;
    var maxX = getXRight() + 1;
    while (stack.length != 0) {
        var point = stack.pop();
        var x = point.x;
        var y = point.y;
        if (!pointExists(x, y)) {
            drawPoint(x, y);
        } else {
            continue;
        }
        var i = x;
        while (i > minX) {
            i--;
            if (pointExists(i, y)) {
                stack.push({"x": i + 1,"y": y - 1,"z": 1});
                stack.push({"x": i + 1,"y":y + 1,"z":1});
                break;
            }
            checkExist(i, y + 1, stack);
            //checkExist(i, y - 1, stack);
            drawPoint(i, y);
        }
        i = x;
        while (i < maxX) {
            i++;
            if (pointExists(i, y)) {
                stack.push({"x": i - 1,"y":y - 1,"z":1});
                //stack.push({"x": i - 1,"y":y + 1,"z":1});
                break;
            }
            checkExist(i, y + 1, stack);
            checkExist(i, y - 1, stack);
            drawPoint(i, y);
        }
    }
	seedPixel = null;
	pixelMatrix = null;
}

//Функция, выполняющая поиск точки на границе фигуры с минимальными значением координаты Х
function getXLeft() {
    var minX = borders[0].x;
    for (var i = 0; i < borders.length; i++) {
        var x = borders[i].x;
        if (x < minX) {
            minX = x;
        }
    }
    return minX;
}

//Функция, выполняющая поиск точки на границе фигуры с максимальным значением координаты Х
function getXRight() {
    var maxX = borders[0].x;
    for (var i = 0; i < borders.length; i++) {
        var x = borders[i].x;
        if (x > maxX) {
            maxX = x;
        }
    }
    return maxX;
}
