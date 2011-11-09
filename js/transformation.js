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

function drawFigure() {
    vertexes2d = [];
    canvasStep = CUBE_CANVAS_STEP;
    clearCanvas();
    //Установка индикатора необходимости скрытия невидимых граней
    var hidePlanes = hidePlanesCheckBox.prop('checked');
    var visibleVector = hidePlanes ? checkPlanes() : null;
    makeProjection();
    map = vertexes2d;
    context.strokeStyle = LINE_COLOR; //Установка цвета линии
    context.beginPath();  //Включить режим отрисовки
    for (var i = 0; i < planes.length; i++) {
        if (!hidePlanes || visibleVector[i]) {
            var lastIndex = planes[i].length - 1;
            for (var j = 0; j < lastIndex + 1; j++) {
                var v1 = vertexes2d[planes[i][j]];
                var v2 = vertexes2d[planes[i][j == lastIndex ? 0 : j + 1]];
                context.moveTo(v1.x, v1.y);  //Установка инструмента рисования в начальную точку
                context.lineTo(v2.x, v2.y); //Отрисовка ребра
//            drawBrez({x1:v1.x, y1:v1.y, x2:v2.x, y2:v2.y});
            }
        }
    }
    context.stroke(); //Выключить режим отрисовки
    printVertexes();
}

function makeProjection() {
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
function rotateCube(rotation) {
    //Сохранение данных о предыдуших вершинах куба
    savePrevVertexes();
    //Нахождение центра фигуры
    var c = findCenter();
    //Применение преобразований к каждой вершине куба
    $.each(vertexes, function(i, val) {
        var start = [];
        start[0] = val[0] - c[0];
        start[1] = val[1] - c[1];
        start[2] = val[2] - c[2];
        start[3] = val[3];

        result = rotate(new Array(start), ANGLE_30, rotation);

        vertexes[i][0] = result[0][0] + c[0];
        vertexes[i][1] = result[0][1] + c[1];
        vertexes[i][2] = result[0][2] + c[2];
        vertexes[i][3] = result[0][3];
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
        var z = vertexes[i][2];
        vertexes[i][0] *= d / z + 1;
        vertexes[i][1] *= d / z + 1;
        vertexes[i][2] = d;
        vertexes[i][3] = 1;
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
function drawStartCube() {
    setLabMode(LAB_MODE.CUBE);
    getStartCubeCoords();
    canvasStep = CUBE_CANVAS_STEP;
    drawFigure();
}
