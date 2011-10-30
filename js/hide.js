var VIEW_VECTOR = [
    [0, 0, 1, 0]
];

function checkPlanes() {
    var planesCount = planes.length;
    var bodyMatrix = createMatrix(4, planesCount);
    for (var j = 0; j < planesCount; j++) {
        var normal = getNormal(planes[j]);
        for (var i = 0; i < 4; i++) {
            bodyMatrix[i][j] = normal[i];
        }
    }
    var center = getFigureCenter();
    var visible = multiplyMatrix(center, bodyMatrix);
    for (var j = 0; j < planesCount; j++) {
        if (visible[0][j] > 0) {
            for (var i = 0; i < 4; i++) {
                bodyMatrix[i][j] *= -1;
            }
        }
    }

    visible = multiplyMatrix(VIEW_VECTOR, bodyMatrix);
    var visibleVector = new Array(planesCount);
    for (var j = 0; j < planesCount; j++) {
        visibleVector[j] = visible[0][j] < 0;
    }
    return visibleVector;
}

function getNormal(plane) {
    var p1 = vertexes[plane[0]];
    var p2 = vertexes[plane[1]];
    var p3 = vertexes[plane[2]];
    var x1 = p1[0];
    var y1 = p1[1];
    var z1 = p1[2];
    var x2 = p2[0];
    var y2 = p2[1];
    var z2 = p2[2];
    var x3 = p3[0];
    var y3 = p3[1];
    var z3 = p3[2];
    var normal = new Array(4);
    normal[0] = y1 * (z2 - z3) + y2 * (z3 - z1) + y3 * (z1 - z2);
    normal[1] = z1 * (x2 - x3) + z2 * (x3 - x1) + z3 * (x1 - x2);
    normal[2] = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);
    normal[3] = -(normal[0] * x1 + normal[1] * y1 + normal[2] * z1);
    return normal;
}

function getFigureCenter() {
    var startV = vertexes[0];
    var minCord = [startV[0],startV[1],startV[2]];
    var maxCord = [startV[0],startV[1],startV[2]];
    $.each(vertexes, function() {
        if (this[0] < minCord[0]) minCord[0] = this[0];
        if (this[1] < minCord[1]) minCord[1] = this[1];
        if (this[2] < minCord[2]) minCord[2] = this[2];
        if (this[0] > maxCord[0]) maxCord[0] = this[0];
        if (this[1] > maxCord[1]) maxCord[1] = this[1];
        if (this[2] > maxCord[2]) maxCord[2] = this[2];
    });
    return [
        [(maxCord[0] + minCord[0]) / 2, (maxCord[1] + minCord[1]) / 2, (maxCord[2] + minCord[2]) / 2, 1]
    ];
}