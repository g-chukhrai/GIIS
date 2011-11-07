var planes;
var vertexes;
var prevVertexes;

var DEFAULT_ZOOM_IN = 1.1;
var MOVE_STEP = 10;
var DEFAULT_ZOOM_OUT = 0.9;
var ANGLE_30 = Math.PI / 6;
var CS = 50;
var CUBE_CANVAS_STEP = 1;

var ROTATION = {
    X: "X",
    Y: "Y",
    Z: "Z"
};

//Функция, выполняющая скалирование точки
function scale(pointMatrix, zoomX, zoomY, zoomZ) {
    //Если в функцию подается два аргумента, то принимаем увеличением по осям У и Z равным увеличению по оси Х
    if (arguments.length == 2) {
        zoomY = arguments[1];
        zoomZ = arguments[1];
    }
    //Матрица преобразования
    var transform = [
        [zoomX, 0, 0, 0],
        [0, zoomY, 0, 0],
        [0, 0, zoomZ, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

//Функция, выполняющая перемещение точки
function translate(pointMatrix, x, y, z) {
    //Матрица преобразования
    var transform = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

//Функция, выполняющая перспективное преобразование точки на расстояние d
function projection(pointMatrix, d) {
    var transform = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 1 / d],
        [0, 0, 0, 0]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

/*Фукнция, выполняющая поворот точки в пространстве
pointMatrix - координаты точки вида {x,y,z,w}
agnle - угол поворота
direction - направление поворота
*/
function rotate(pointMatrix, angle, direction) {
    var transform;
    //Матрица преобразования для поворота по оси Х
    if (direction == ROTATION.X) {
        transform = [
            [1, 0, 0, 0],
            [0, Math.cos(angle), Math.sin(angle), 0],
            [0, -Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    }
    //Матрица преобразования для поворота по оси У
    else if (direction == ROTATION.Y) {
        transform = [
            [Math.cos(angle), 0, -Math.sin(angle), 0],
            [0, 1, 0, 0],
            [Math.sin(angle), 0, Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    }
    //Матрица преобразования для поворота по оси Z
    else if (direction == ROTATION.Z) {
        transform = [
            [Math.cos(angle), Math.sin(angle), 0, 0],
            [-Math.sin(angle), Math.cos(angle), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }
    return multiplyMatrix(pointMatrix, transform);
}

//Функция установки начальных координат вершин и описания граней
function getStartCubeCoords() {
    prevVertexes = null;
    vertexes = [
        [-CS, -CS, -CS, 1],
        [CS, -CS, -CS, 1],
        [CS, CS, -CS, 1],
        [-CS, CS, -CS, 1],
        [-CS, -CS, CS, 1],
        [CS, -CS, CS, 1],
        [CS, CS, CS, 1],
        [-CS, CS, CS, 1]
    ];

    planes = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [1, 2, 6, 5],
        [0, 3, 7, 4],
        [0, 4, 5, 1],
        [2, 3, 7, 6]
    ];
}

//Функция отрисовки фигуры
function drawFigure() {
    //Очистка холста
    clearCanvas();
    //Установка индикатора необходимости скрытия невидимых граней
    var hidePlanes = hidePlanesCheckBox.prop('checked');
    var visibleVector = hidePlanes ? checkPlanes() : null;
    //Отрисовка фигуры
    for (var i = 0; i < planes.length; i++) {
        if (!hidePlanes || visibleVector[i]){
            var plane = planes[i];
            var length = plane.length;
			var v1 = vertexes[plane[0]];
			context.strokeStyle = LINE_COLOR; //Установка цвета линии
			context.beginPath();  //Включить режим отрисовки
			context.moveTo(v1[0], v1[1]);  //Установка инструмента рисования в начальную точку
             //Цикл отрисовки ребер фигуры
			 for (var j = 0; j < length; j++) {
				v1 = vertexes[plane[j]];
                var v2 = vertexes[plane[j == length - 1 ? 0 : j + 1]];			 
				context.lineTo(v2[0], v2[1]); //Отрисовка ребра
			 }
			context.stroke(); //Выключить режим отрисовки
			/*
            for (var j = 0; j < length; j++) {
                var v1 = vertexes[plane[j]];
                var v2 = vertexes[plane[j == length - 1 ? 0 : j + 1]];
                //drawBrez({x1:v1[0], y1:v1[1], x2:v2[0], y2:v2[1]});
			    //context.beginPath();
				context.moveTo(v1[0], v1[1]);
				context.lineTo(v2[0], v2[1]);
				//context.lineTo(t.p3.x, t.p3.y);
				//context.lineTo(t.p1.x, t.p1.y);
				//context.stroke();
				
            }
			*/
        }
    }
    //Вывод отладочной информации
    printVertexes();
}

//Функция увеличения куба
//isZoomIn - переменная, определяющая во сколько раз куб должен быть увеличен
function zoomCube(isZoomIn) {
    //Сохранение данных о предыдуших вершинах куба
    savePrevVertexes();
    //Применение преобразований к каждой вершине куба
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = scale(point, isZoomIn ? DEFAULT_ZOOM_IN : DEFAULT_ZOOM_OUT);
        vertexes[i] = result[0];
    });
    //Отрисовка куба
    drawFigure();
}

//Функция поворота куба
//rotation - направление поворота
function rotateCube(rotation) {
    //Сохранение данных о предыдуших вершинах куба
    savePrevVertexes();
    //Применение преобразований к каждой вершине куба
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = rotate(point, ANGLE_30, rotation);
        vertexes[i] = result[0];
    });
    //Отрисовка куба
    drawFigure();
}

//Функция перемещения куба
//x,y,z - шаг перемещения по каждой из осей
function translateCube(x, y, z) {
    //Сохранение данных о предыдуших вершинах куба
    savePrevVertexes();
    //Применение преобразований к каждой вершине куба
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = translate(point, x, y, z);
        vertexes[i] = result[0];
    });
    //Отрисовка куба
    drawFigure();
}

//Фукнция, выполняющая перспективную проекцию куба на расстояние d
function projectionCube(d) {
    //Сохранение данных о предыдуших вершинах куба
    savePrevVertexes();
    //Применение преобразований к каждой вершине куба
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = projection(point, d);
        vertexes[i] = result[0];
    });
	
	$.each(vertexes, function(i, val) {
        vertexes[i][0] = (vertexes[i][0]*vertexes[i][3])/vertexes[i][2];
		vertexes[i][1] = (vertexes[i][1]*vertexes[i][3])/vertexes[i][2];
		vertexes[i][2] = (vertexes[i][3]);
    });
    //Отрисовка куба
    drawFigure();
}

//Функция, выполняющая сохранения данных о вершинах фигуры
function savePrevVertexes() {
    var rows = vertexes.length;
    var columns = vertexes[0].length;
    prevVertexes = createMatrix(rows, columns);
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            prevVertexes[i][j] = vertexes[i][j];
        }
    }
}

//Функция, выполняющая вывод данных о текущих и предшествующих (до преобразования) вершинах фигуры
function printVertexes() {
    var count = vertexes.length;
    if (prevVertexes && prevVertexes.length == count) {
        appendRow("th", 6, '', 'Prev', '', '', 'Curr', '');
        appendRow("th", 6, 'x', 'y', 'z', 'x', 'y', 'z');
        for (var i = 0; i < count; i++) {
            var v = vertexes[i];
            var pv = prevVertexes[i];
            appendRow("td", 6, Math.round(pv[0]), Math.round(pv[1]), Math.round(pv[2]),
                    Math.round(v[0]), Math.round(v[1]), Math.round(v[2]));
        }
    } else {
        appendRow("th", 3, '', 'Curr', '');
        appendRow("th", 3, 'x', 'y', 'z');
        for (var j = 0; j < count; j++) {
            var vertex = vertexes[j];
            appendRow("td", 3, Math.round(vertex[0]), Math.round(vertex[1]), Math.round(vertex[2]));
        }
    }
}

//Функция, инициирующая начало работы с фигурой
function drawStartCube() {
    setLabMode(LAB_MODE.CUBE);
    getStartCubeCoords();
    canvasStep = CUBE_CANVAS_STEP;
    rotateCube(ROTATION.X);
    rotateCube(ROTATION.Y);
}
