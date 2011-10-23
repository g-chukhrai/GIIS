var edges = [];
var vertexes = [];
var prevVertexes;
var vertexes2d = [];

var DEFAULT_ZOOM_IN = 1.1;
var DEFAULT_ZOOM_OUT = 0.9;
var ANGLE_30 = Math.PI / 6;

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

function getStartCubeCoords() {
    prevVertexes = null;
    vertexes = [
        [0, 0, 0, 1],
        [100, 0, 0, 1],
        [100, 100, 0, 1],
        [0, 100, 0, 1],
        [0, 0, 100, 1],
        [100, 0, 100, 1],
        [100, 100, 100, 1],
        [0, 100, 100, 1]
    ];

    edges = [
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
    canvasStep = 1;
    clearCanvas();
    makeProjection();
    map = vertexes2d;

    for (var i = 0; i < edges.length; i++) {
        for (var j = 0; j < edges[i].length - 1; j++) {
            var v1 = vertexes2d[edges[i][j]];
            var v2 = vertexes2d[edges[i][j + 1]];
            drawBrez({x1:v1.x, y1:v1.y, x2:v2.x, y2:v2.y});
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
        console.log("point: " + point + " result: " + result);
        vertexes[i] = result[0];
    });
    drawFigure();
}

function projectionCube(d) {
    savePrevVertexes();
    $.each(vertexes, function(i, val) {
        var x = val[0];
        var y = val[1];
        var z = val[2];
        if (z > 1) {
            var w = z / d;
            x /= w;
            y /= w;
        }
        vertexes[i] = [Math.round(x), Math.round(y), d, 1];
//        console.log(i + ": " + vertexes[i]);
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
        for (var i = 0; i < count; i++) {
            var v = vertexes[i];
            appendRow("td", 3, Math.round(v[0]), Math.round(v[1]), Math.round(v[2]));
        }
    }
}
