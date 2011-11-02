var hideFieldSize;
var hideLinesCount;
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

function paintField() {
    context.fillStyle = POINT_COLOR;
    drawBrez({x1 : -hideFieldSize, y1 : -hideFieldSize, x2: -hideFieldSize, y2: hideFieldSize});
    drawBrez({x1 : -hideFieldSize, y1 : hideFieldSize, x2: hideFieldSize, y2: hideFieldSize});
    drawBrez({x1 : hideFieldSize, y1 : hideFieldSize, x2: hideFieldSize, y2: -hideFieldSize});
    drawBrez({x1 : hideFieldSize, y1 : -hideFieldSize, x2: -hideFieldSize, y2: -hideFieldSize});
}

function drawRandomLines() {
    setLabMode(LAB_MODE.HIDE_LINES);
    hideFieldSize = parseInt($("#fieldSize").val());
    hideLinesCount = parseInt($("#linesCount").val());
    getRandomPoints(hideLinesCount * 2);
    drawHideLines();
}

function drawHideLines() {
    var length = controlMap.length;
    for (var i = 0; i < length - 1; i += 2) {
        var p1 = controlMap[i];
        var p2 = controlMap[i + 1];
        var isClipped = false;
        if (isTrivialVisible(p1, p2)) {
            context.fillStyle = WHITE_SMOKE;
        } else if (isTrivialInvisible(p1, p2)) {
            context.fillStyle = CORAL;
        } else {
            isClipped = true;
            drawClippedLine(p1, p2);
            context.fillStyle = POINT_COLOR;
        }
        drawBrez(get2PointMap(p1, p2), isClipped);
    }
    paintField();
    drawAllPoints();
}

function classify(p) {
    if (p.x < -hideFieldSize) {
        if (p.y < -hideFieldSize)
            return 1 << 3 | 1;
        else if (p.y > hideFieldSize)
            return 1 << 4 | 1;
        else
            return 1;
    }
    else if (p.x > hideFieldSize) {
        if (p.y < -hideFieldSize)
            return 1 << 3 | 1 << 2;
        else if (p.y > hideFieldSize)
            return 1 << 4 | 1 << 2;
        else
            return 1 << 2;
    }
    else {
        if (p.y < -hideFieldSize)
            return 1 << 3;
        else if (p.y > hideFieldSize)
            return 1 << 4;
        else
            return 0;
    }
}

function isPointInsideClipRect(p) {
    return !(p.x < -hideFieldSize || p.x > hideFieldSize || p.y < -hideFieldSize || p.y > hideFieldSize);
}

function isTrivialVisible(p1, p2) {
    return isPointInsideClipRect(p1) && isPointInsideClipRect(p2);
}

function isTrivialInvisible(p1, p2) {
    return (classify(p1) & classify(p2)) != 0;
}

function drawClippedLine(p1, p2) {
    context.fillStyle = WHITE_SMOKE;
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    if (dx == 0 || dy == 0) {
        drawBrez(get2PointMap(p1, p2));
        return;
    }

    var m = dy / dx;
    var p = [];
    if (isPointInsideClipRect(p1)) {
        console.log("p1: " + p1.x + ":" + p1.y + " in clip");
        p.push(p1);
    }
    if (isPointInsideClipRect(p2)) {
        console.log("p2: " + p2.x + ":" + p2.y + " in clip");
        p.push(p2);
    }


    var yLeft = m * (-hideFieldSize - p1.x) + p1.y;
    var left = {x:  -hideFieldSize, y : Math.floor(yLeft) };
    printPoint(left, "left");
    if (( left.x >= p1.x || left.x >= p2.x ) && isPointInsideClipRect(left))
        p.push(left);

    var yRight = m * (hideFieldSize - p1.x) + p1.y;
    var right = {x: hideFieldSize, y : Math.floor(yRight)};
    printPoint(right, "right");
    if (( right.x <= p1.x || right.x <= p2.x ) && isPointInsideClipRect(right))
        p.push(right);

    var xDown = p1.x + (-hideFieldSize - p1.y ) / m;
    var down = {x: Math.floor(xDown) , y :  -hideFieldSize };
    printPoint(down, "down");
    if (( down.y >= p1.y || down.y >= p2.y ) && isPointInsideClipRect(down))
        p.push(down);

    var xUp = p1.x + ( hideFieldSize - p1.y ) / m;
    var up = {x: Math.floor(xUp), y : hideFieldSize };
    printPoint(up, "up");
    if (( up.y <= p1.y || up.y <= p2.y ) && isPointInsideClipRect(up))
        p.push(up);

    if (p.length > 1) {
        p1 = {x:p[0].x, y: p[0].y};
        p2 = {x:p[1].x, y: p[1].y};
        printPoint(p1, "p1");
        printPoint(p2, "p2");
        drawBrez(get2PointMap(p1, p2));
    }
}

