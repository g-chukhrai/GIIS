var edges = [];
var vertexes = [];
var edges2d = [];

var Percpective_x = 0;
var Percpective_y = 0;
var Percpective_z = 0;
var Percpective_rho = 50000;
var Percpective_theta = 30;
//var	Percpective_theta=0.0;  
var Percpective_phi = 30;
//var	Percpective_phi=0.0;
var Percpective_d = 25000;
var Percpective_with_perspective = false;
var Percpective_dx = 0;
var Percpective_dy = 0;

function nullVars() {
    Percpective_x = 0;
    Percpective_y = 0;
    Percpective_z = 0;
    Percpective_rho = 50000;
    Percpective_theta = 30;
    //Percpective_theta=0.0;
    Percpective_phi = 30;
    //Percpective_phi=0.0;
    Percpective_d = 25000;
    Percpective_with_perspective = false;
    Percpective_dx = 0;
    Percpective_dy = 0;
}

function getFileData() {
    vertexes = [
        [0, 0, 0, 1],
        [50, 0, 0, 1],
        [50, 50, 0, 1],
        [0, 50, 0, 1],
        [0, 0, 50, 1],
        [50, 0, 50, 1],
        [50, 50, 50, 1],
        [0, 50, 50, 1]
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
    edges2d = [];
    canvasStep = 3;
    clearCanvas();
    nullVars();
    if (vertexes.length == 0) {
        getFileData();
    }
    MakeProjection();

    map = edges2d;
    //drawAllPoints();
    var cda_points = [];
    var current_vertex1;
    var current_vertex2;

    for (var i = 0; i < edges.length; i++) {
        for (var j = 0; j < edges[i].length - 1; j++) {
            cda_points = [];
            current_vertex1 = edges[i][j];
            current_vertex2 = edges[i][j + 1];
            cda_points.push(edges2d[current_vertex1]);
            cda_points.push(edges2d[current_vertex2]);
            drawBrez(cda_points);
        }
    }
}


function MakeProjection() {
    // Перевод в радианы
    Percpective_theta = Percpective_theta * Math.atan(1.0) / 45.0;
    Percpective_phi = Percpective_phi * Math.atan(1.0) / 45.0;
    // Расчет коэффициентов матрицы преобразования
    var st = Math.sin(Percpective_theta), ct = Math.cos(Percpective_theta), sp = Math.sin(Percpective_phi), cp = Math.cos(Percpective_phi),
            v11 = -st,    v12 = -cp * ct,    v13 = -sp * ct,
            v21 = ct,        v22 = -cp * st,    v23 = -sp * st,
            v32 = sp,        v33 = -cp,
            v41 = Percpective_dx,    v42 = Percpective_dy,    v43 = Percpective_rho;
    var x, y, z;
    var x2d, y2d;
    var TempZ = 0;
    //расчет видовых координат точек
    for (var i = 0; i < vertexes.length; i++) {
        x = vertexes[i][0] - Percpective_x;
        y = vertexes[i][1] - Percpective_y;
        z = vertexes[i][2] - Percpective_z;

        TempZ = v13 * x + v23 * y + v33 * z + v43;
        x2d = (v11 * x + v21 * y + v41 + 0.5);
        y2d = (v12 * x + v22 * y + v32 * z + v42 + 0.5);

        // Перспективные преобразования
        if (Percpective_with_perspective) {
            x2d = (Percpective_d * x2d / TempZ + 0.5);
            y2d = (Percpective_d * y2d / TempZ + 0.5);
        }
        x2d += (Percpective_x + 0.5);
        y2d += (Percpective_y + 0.5);

        edges2d.push({'x' : Math.round(x2d), 'y' : Math.round(y2d)});
    }
}


var DEFAULT_ZOOM_IN = 1.1;
var DEFAULT_ZOOM_OUT = 0.9;
var ROTATION_ANGLE = Math.PI / 6;

function zoomCube(isZoomIn) {
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = scale(point, isZoomIn ? DEFAULT_ZOOM_IN : DEFAULT_ZOOM_OUT);
        vertexes[i] = result[0];
    });
    drawFigure();
}

function rotateCube(rotation) {
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = rotate(point, ROTATION_ANGLE, rotation);
        vertexes[i] = result[0];
    });
    drawFigure();
}

function translateCube(x, y, z) {
    $.each(vertexes, function(i, val) {
        var point = new Array(val);
        var result = translate(point, x, y, z);
        vertexes[i] = result[0];
    });
    drawFigure();
}

function projectionCube(d) {
    $.each(vertexes, function(i, val) {
        var w = val[2]/d;
        val[0]/=w;
        val[1]/=w;
        val[2]=d;
        vertexes[i] = val;
    });
    drawFigure();
}
