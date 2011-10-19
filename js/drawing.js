function drawAllPoints() {
    context.fillStyle = POINT_COLOR;
    $.each(map, function() {
        drawPoint(this);
    });

    context.fillStyle = POINT_CONTROL_COLOR;
    $.each(controlMap, function() {
        drawPoint(this);
    });
    context.fillStyle = POINT_COLOR;
    info.html("");
}

function drawField() {
    context.strokeStyle = "#000";
    context.strokeRect(-halfWidth, -halfHeight, width, height);

    for (var x = -halfWidth; x < halfWidth; x += canvasStep) {
        context.moveTo(x, -halfHeight);
        context.lineTo(x, halfHeight);
    }

    for (var y = -halfHeight; y < halfHeight; y += canvasStep) {
        context.moveTo(halfWidth, y);
        context.lineTo(-halfWidth, y);
    }
    context.strokeStyle = "#eee";
    context.stroke();

    //draw X
    var leftWall = halfWidth - canvasStep;
    context.beginPath();
    context.moveTo(-leftWall, canvasStep);
    context.lineTo(leftWall, canvasStep);
    context.moveTo(leftWall - 5, 5 + canvasStep);
    context.lineTo(leftWall, canvasStep);
    context.lineTo(leftWall - 5, -5 + canvasStep);

    //draw Y
    var topWall = halfHeight - canvasStep;
    context.moveTo(5, -topWall + 5);
    context.lineTo(0, -topWall);
    context.lineTo(-5, -topWall + 5);
    context.moveTo(0, -topWall);
    context.lineTo(0, topWall);

    context.strokeStyle = "#000";
    context.stroke();
    drawAllPoints();
}

function drawPoint(x, y) {
    if (arguments.length == 0) {
        x = parseInt($("#xPos").val());
        y = parseInt($("#yPos").val());
    } else if (arguments.length == 1) {
        var point = arguments[0];
        x = point.x;
        y = point.y;
        context.fillRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        return;
    }
    var removeId;
    $.each(map, function(i, val) {
        if (val.x == x && val.y == y) {
            removeId = i;
            return false;
        }
    });
    if (removeId == null) {
        addToMap(x, y);
        context.fillRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        info.html("Draw point on [" + x + "; " + y + "]");
    } else {
        map.splice(removeId, 1);
        context.clearRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        info.html("Remove point on [" + x + "; " + y + "]");
    }
}

function returnPoints(count) {
    if (map.length != count) {
        info.html("Canvas should contains " + count + " points (add/remove by click)");
        return null;
    } else {
        var result = [];
        $.each(map, function(i, val) {
            var alias = (i + 1).toString();
            result["x" + alias] = val.x;
            result["y" + alias] = val.y;
            result["z" + alias] = 1;
        });
        return result;
    }
}

function showPoint(pointId) {
    drawAllPoints();
    var id = parseInt(pointId);
    if (id >= 0 && map.length > id) {
        context.fillStyle = POINT_HOVER_COLOR;
        drawPoint(map[id]);
    }
}

function drawPointBrighter(swapAxes, x, y, c) {
    var increasePercent = Math.round(100 * (1 - c));
    context.fillStyle = increase_brightness(POINT_COLOR, increasePercent);
    if (swapAxes) drawPoint(y, x);
    else drawPoint(x, y);
}

function increase_brightness(hex, percent) {
    if (percent == 100) return "#fff";

    var r = parseInt(hex.substr(1, 2), 16),
            g = parseInt(hex.substr(3, 2), 16),
            b = parseInt(hex.substr(5, 2), 16);

    return '#' +
            ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

function draw2Points() {
    clearCanvas();
    resetScale();
    var limit = (halfWidth / canvasStep) - 10;
    drawRandomPoint(-limit, limit);
    drawRandomPoint(-limit, limit);
}

function drawRandomPoint(from, to) {
    drawPoint(Math.rand(from, to), Math.rand(from, to));
}

//Функция отрисовки алгоритма (используется во время перемещения "контрольной точки")
function drawAlgorithm(isRandom) {
    clearStandartMap();
    if (algorithmType == 1) {
        drawHermite(isRandom);
    } else if (algorithmType == 2) {
        drawBezier(isRandom);
    } else if (algorithmType == 3) {
        drawBSpline(isRandom);
    }
}