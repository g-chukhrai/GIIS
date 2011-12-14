var planes;
var vertexes;
var vertexes2d;
var prevVertexes;

var DEFAULT_ZOOM_IN = 1.1;
var MOVE_STEP = 10;
var DEFAULT_ZOOM_OUT = 0.9;
var ANGLE_30 = Math.PI / 6;
var ANGLE_45 = Math.PI / 4;
var CS = 50;
var CUBE_CANVAS_STEP = 1;

var ROTATION = {
    X: "X",
    Y: "Y",
    Z: "Z"
};

var FIGURE = {
    CUBE: "CUBE",
    PYRAMID: "PYRAMID"
};

//Начальные углы наклона куба
var startTheta = 0;
var startPhi = 0;
// Расчет коэффициентов матрицы преобразования
var st = Math.sin(startTheta);
var ct = Math.cos(startTheta);
var sp = Math.sin(startPhi);
var cp = Math.cos(startPhi);
//Матрица преобразования
var projMatrix = [
    [-st, -cp * ct],
    [ct,-cp * st],
    [0,sp]
];

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
        [0, 0, 0 , 1 / d ],
        [0, 0, 0, 1]
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
function getStartCubeCords() {
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

function getStartPyramidCords() {
    prevVertexes = null;
    vertexes = [
        [0,0,CS,1],
        [CS,CS,-CS,1],
        [CS,-CS,-CS,1],
        [-CS,CS,-CS,1],
        [-CS,-CS,-CS,1]
    ];
    planes = [
        [1,2,4,3],
        [0,1,2],
        [0,3,4],
        [0,1,3],
        [0,2,4]
    ];
}

function drawFigure() {
    vertexes2d = [];
    if (labMode != LAB_MODE.HIDE_LINES_CYRUS) {
        canvasStep = CUBE_CANVAS_STEP;
        clearCanvas();
    }
	
    //Установка индикатора необходимости скрытия невидимых граней
    var hidePlanes = hidePlanesCheckBox.prop('checked');
	var isPerspective = perspectiveCheckBox.prop('checked');
    var visibleVector = hidePlanes ? checkPlanes() : null;
	
	context.strokeStyle = LINE_COLOR; //Установка цвета линии
    context.beginPath();  //Включить режим отрисовки
    for (var i = 0; i < planes.length; i++) {
        if (!hidePlanes || visibleVector[i]){
            var plane = planes[i];
            var length = plane.length;
            for (var j = 0; j < length; j++) {
				var v1_index = plane[j];
				var v2_index = plane[j == length - 1 ? 0 : j + 1];
                var v1 = vertexes[v1_index];
                var v2 = vertexes[v2_index];
								
				var x1 = v1[0];
				var x2 = v2[0];
				var y1 = v1[1];
				var y2 = v2[1];

				if (isPerspective) {
					var d = parseInt($("#d").val());
					d = -d;
					var z1 = v1[2];
					var z2 = v2[2];
					if (d < z1) z1 = d;
					if (d < z2) z2 = d;
					x1 *= d / (z1) ;
					y1 *= d / (z1) ;
					z1 = d;
				
					x2 *= d / (z2) ;
					y2 *= d / (z2) ;
					z2 = d;
				}
		
				context.moveTo(x1, y1);  //Установка инструмента рисования в начальную точку
                context.lineTo(x2, y2); //Отрисовка ребра
            }
        }
    }
    context.stroke(); //Выключить режим отрисовки
    if (labMode != LAB_MODE.HIDE_LINES_CYRUS) {
        printVertexes();
    }
}

var tempIsVisible;
function debugPoints(p1, p2) {
	tempIsVisible = isVisible;
    isVisible = false;
	var pmax = (p1.z > p2.z ? p1.z : p2.z);
	$.each(vertexes, function(i, val) {
		if (val[2] > pmax && tempIsVisible) {
			isVisible = true;
			//console.log("yes");
		}
	});
	
}

function make2DProjection() {
    //расчет видовых координат точек
    for (var i = 0; i < vertexes.length; i++) {
        var x = vertexes[i][0];
        var y = vertexes[i][1];
        var z = vertexes[i][2];

        var x2d = projMatrix[0][0] * x + projMatrix[1][0] * y + 1;
        var y2d = projMatrix[0][1] * x + projMatrix[1][1] * y + projMatrix[2][1] * z + 1;

        vertexes2d.push({'x' : Math.round(x2d), 'y' : Math.round(y2d)});
    }
}

function make2DProjection2Points(p1, p2) {
    //расчет видовых координат точек
    var p1x2d = projMatrix[0][0] * p1.x + projMatrix[1][0] * p1.y + 1;
    var p1y2d = projMatrix[0][1] * p1.x + projMatrix[1][1] * p1.y + projMatrix[2][1] * p1.z + 1;
    var p2x2d = projMatrix[0][0] * p2.x + projMatrix[1][0] * p2.y + 1;
    var p2y2d = projMatrix[0][1] * p2.x + projMatrix[1][1] * p2.y + projMatrix[2][1] * p2.z + 1;
    return get2PointMap({x : p1x2d, y : p1y2d}, {x:p2x2d,y:p2y2d});
}

//Функция нахождения центра фигуры
function findCenter() {
    var p1 = vertexes[0];
    var min_x = p1[0];
    var min_y = p1[1];
    var min_z = p1[2];
    var max_x = min_x;
    var max_y = min_y;
    var max_z = min_z;
    $.each(vertexes, function(i, p) {
        if (p[0] < min_x)    min_x = p[0];
        else if (p[0] > max_x)     max_x = p[0];
        if (p[1] < min_y)    min_y = p[1];
        else if (p[1] > max_y)    max_y = p[1];
        if (p[2] < min_z)    min_z = p[2];
        else if (p[2] > max_z)    max_z = p[2];
    });
    p1 = [(min_x + max_x ) / 2, (min_y + max_y) / 2, (min_z + max_z ) / 2, 1];
    return p1;
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
function rotateCube(rotation, mirror) {
    //Сохранение данных о предыдуших вершинах куба
    savePrevVertexes();
    //Нахождение центра фигуры
    var c = findCenter();
    //Применение преобразований к каждой вершине куба
    $.each(vertexes, function(i, val) {
        var start = [
            [
                val[0] - c[0],
                val[1] - c[1],
                val[2] - c[2],
                val[3]
            ]
        ];

        result = rotate(start, mirror ? -ANGLE_30 : ANGLE_30, rotation);

        vertexes[i] = [
            result[0][0] + c[0],
            result[0][1] + c[1],
            result[0][2] + c[2],
            result[0][3]
        ];
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
    if (arguments.length == 0) {
        d = parseInt($("#d").val());
    }
    //Сохранение данных о предыдуших вершинах куба
    savePrevVertexes();
    //Применение преобразований к каждой вершине куба
    $.each(vertexes, function(i, val) {
        var z = val[2];
        val[0] *= d / z + 1;
        val[1] *= d / z + 1;
        val[2] = d;
        val[3] = 1;
//        var point = new Array(val);
//        var result = projection(point, d);
//        vertexes[i] = result[0];
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
function drawStartFigure(figure) {
    setLabMode(LAB_MODE.CUBE);
    figure == FIGURE.CUBE ? getStartCubeCords() : getStartPyramidCords();
    canvasStep = CUBE_CANVAS_STEP;
//    drawFigure();
    rotateCube(ROTATION.X, false);
    rotateCube(ROTATION.Y, false);
}
