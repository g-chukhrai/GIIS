var l3_points = [];
var step;

function drawHermite(isRandom) {
    step = 0.001;
    if (isRandom) getRandomPoints();
    getPoints();

    var M = [
        [2, -2, 1, 1],
        [-3, 3, -2, -1],
        [0, 0, 1, 0],
        [1, 0, 0, 0]
    ];

    for (var t = 0; t <= 1; t += step) {
        var T = [
            [t * t * t, t * t, t, 1]
        ];
        var result = multiplyMatrix(multiplyMatrix(T, M), l3_points);
        addToMap(Math.round(result[0][0]), Math.round(result[0][1]));
    }
    drawAllPoints();
}


function drawBezier(isRandom) {
    step = 0.001;

    var M = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 3, 0, 0],
        [1, 0, 0, 0]
    ];

    if (isRandom) getRandomPoints();
    getPoints();

    var C = multiplyMatrix(M, l3_points);

    for (var t = 0; t <= 1; t += step) {
        var T = [
            [t * t * t, t * t, t, 1]
        ];
        var result = multiplyMatrix(T, C);
        addToMap(Math.round(result[0][0]), Math.round(result[0][1]));
    }

    drawAllPoints();
}


function drawBSpline(isRandom) {
    step = 0.001;
    var M = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 0, 3, 0],
        [1, 4, 1, 0]
    ];

    if (isRandom) getRandomPoints(4);
    var count = controlMap.length;

    for (var i = 0; i < count - 3; i++) {
        var px1 = controlMap[i].x,
                py1 = controlMap[i].y,
                px2 = controlMap[i + 1].x,
                py2 = controlMap[i + 1].y,
                px3 = controlMap[i + 2].x,
                py3 = controlMap[i + 2].y,
                px4 = controlMap[i + 3].x,
                py4 = controlMap[i + 3].y;

        var G = [
            [px1, py1],
            [px2, py2],
            [px3, py3],
            [px4, py4]
        ];

        var r = multiplyMatrix(M, G);

        for (var t = 0; t <= 1; t += step * canvasStep) {
            var T = [
                [t * t * t, t * t, t, 1]
            ];
            var result = multiplyMatrix(T, r);
            addToMap(Math.round(result[0][0] / 6.), Math.round(result[0][1] / 6.));
        }
    }
    drawAllPoints();
}



