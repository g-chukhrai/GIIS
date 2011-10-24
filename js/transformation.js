var planes;
var vertexes;
var vertexes2d;
var prevVertexes;

var DEFAULT_ZOOM_IN = 1.1;
var DEFAULT_ZOOM_OUT = 0.9;
var ANGLE_30 = Math.PI / 6;
var CUBE_SIZE = 100;
var CUBE_CANVAS_STEP = 1;

//Начальные углы наклона куба
var startTheta = ANGLE_30;
var startPhi = ANGLE_30;
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

var ROTATION = {
    X: "X",
    Y: "Y",
    Z: "Z"
};

function scale(pointMatrix, zoomX, zoomY, zoomZ) {
    if (arguments.length == 2) {
        zoomY = arguments[1];
        zoomZ = arguments[1];
    }
    var transform = [
        [zoomX, 0, 0, 0],
        [0, zoomY, 0, 0],
        [0, 0, zoomZ, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

function translate(pointMatrix, x, y, z) {
    var transform = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

function projection(pointMatrix, d) {
    var transform = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1 / d],
        [0, 0, 0, 0]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

function rotate(pointMatrix, angle, direction) {
    var transform;
    if (direction == ROTATION.X) {
        transform = [
            [1, 0, 0, 0],
            [0, Math.cos(angle), Math.sin(angle), 0],
            [0, -Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    } else if (direction == ROTATION.Y) {
        transform = [
            [Math.cos(angle), 0, -Math.sin(angle), 0],
            [0, 1, 0, 0],
            [Math.sin(angle), 0, Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    } else if (direction == ROTATION.Z) {
        transform = [
            [Math.cos(angle), Math.sin(angle), 0, 0],
            [-Math.sin(angle), Math.cos(angle), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }
    return multiplyMatrix(pointMatrix, transform);
}

function getStartCubeCoords() {
    prevVertexes = null;
    vertexes = [
        [0, 0, 0, 1],
        [CUBE_SIZE, 0, 0, 1],
        [CUBE_SIZE, CUBE_SIZE, 0, 1],
        [0, CUBE_SIZE, 0, 1],
        [0, 0, CUBE_SIZE, 1],
        [CUBE_SIZE, 0, CUBE_SIZE, 1],
        [CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 1],
        [0, CUBE_SIZE, CUBE_SIZE, 1]
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
    makeProjection();
    map = vertexes2d;

    for (var i = 0; i < planes.length; i++) {
        var plane = planes[i];
        if (isPlaneVisible(plane)) {
            var length = plane.length;
            for (var j = 0; j < length ; j++) {
                var v1 = vertexes2d[plane[j]];
                var v2 = vertexes2d[plane[j == length - 1 ? 0 : j + 1]];
                drawBrez({x1:v1.x, y1:v1.y, x2:v2.x, y2:v2.y});
            }
        }
    }
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


function zoomCube(isZoomIn) {
    savePrevVertexes();
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = scale(point, isZoomIn ? DEFAULT_ZOOM_IN : DEFAULT_ZOOM_OUT);
        vertexes[i] = result[0];
    });
    drawFigure();
}

function rotateCube(rotation) {
    savePrevVertexes();
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = rotate(point, ANGLE_30, rotation);
        vertexes[i] = result[0];
    });
    drawFigure();
}

function translateCube(x, y, z) {
    savePrevVertexes();
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = translate(point, x, y, z);
        vertexes[i] = result[0];
    });
    drawFigure();
}

function projectionCube(d) {
    savePrevVertexes();
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = projection(point, d);
        vertexes[i] = result[0];
    });
    drawFigure();
}

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