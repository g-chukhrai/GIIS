function drawCDA() {
    var pts = returnPoints();
    if (pts != null) {
        var length = Math.max(Math.abs(pts.xLen), Math.abs(pts.yLen));
        var dx = pts.xLen / length;
        var dy = pts.yLen / length;
        var x = pts.x1 + 0.5 * Math.sign(dx);
        var y = pts.y1 + 0.5 * Math.sign(dy);
        map = [];
        steps.html("");
        appendRow("th", 4, 'i', 'x', 'y', 'Point(x,y)');
        appendRow("td", 4, "", "", "start", "(" + pts.x1 + ";" + pts.y1 + ")");
        for (var i = 0; i <= length; i++) {
            var resultX = Math.floor(x);
            var resultY = Math.floor(y);
            appendRow("td", 4, i, x.toFixed(4), y.toFixed(4), "(" + resultX + ";" + resultY + ")");
            drawPoint(resultX, resultY);
            x += dx;
            y += dy;
        }
        appendRow("td", 4, "", "", "end", "(" + pts.x2 + ";" + pts.y2 + ")");
        appendRow("th", 4, "", "dx", "dy", "length");
        appendRow("td", 4, "", dx.toFixed(2), dy.toFixed(2), length);
    }
}

function drawBrez() {
    var pts = returnPoints();
    if (pts != null) {
        var x = pts.x1;
        var y = pts.y1;
        var dx = Math.abs(pts.xLen);
        var dy = Math.abs(pts.yLen);
        var signX = Math.sign(pts.xLen);
        var signY = Math.sign(pts.yLen);

        var reverse = dy > dx;
        if (reverse) {
            var temp = dx;
            dx = dy;
            dy = temp;
        }
        var e = 2 * dy - dx;
        map = [];
        steps.html("");
        appendRow("th", 6, 'i', 'e', 'x', 'y', "e'", 'Point(x,y)');
        appendRow("td", 6, "", "", "", "", "start", "(" + pts.x1 + ";" + pts.y1 + ")");
        appendRow("td", 6, 0, "", pts.x1, pts.y1, e, "(" + pts.x1 + ";" + pts.y1 + ")");
        drawPoint(x, y);
        for (var i = 1; i <= dx; i++) {
            var oldE = e;
            if (e >= 0) {
                if (reverse) x += signX;
                else y += signY;
                e -= 2 * dx;
            }
            if (reverse) y += signY;
            else x += signX;
            e += 2 * dy;
            appendRow("td", 6, i, oldE, x, y, e, "(" + x + ";" + y + ")");
            drawPoint(x, y);
        }
        appendRow("td", 6, "", "", "", "", "end", "(" + pts.x2 + ";" + pts.y2 + ")");
        appendRow("th", 6, "", "", "", "dx", "dy", "");
        appendRow("td", 6, "", "", "", dx.toFixed(2), dy.toFixed(2), "");
    }
}

function drawAllPoints() {
    context.fillStyle = POINT_COLOR;
    $.each(map, function() {
        drawPoint(this);
    });
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
    context.lineTo(0, canvasStep);
    context.moveTo(canvasStep, canvasStep);
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
    context.lineTo(0, 0);
    context.moveTo(0, canvasStep);
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
        map.push({'x' : x, 'y' : y, 'z' : 1});
        context.fillRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        info.html("Draw point on [" + x + "; " + y + "]");
    } else {
        map.splice(removeId, 1);
        context.clearRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        info.html("Remove point on [" + x + "; " + y + "]");
    }
}

function returnPoints() {
    if (map.length != 2) {
        info.html("Stay only two points on canvas (points removed by click)");
        return null;
    } else {
        var startPoint = map[0];
        var endPoint = map[1];
        return {
            x1 : startPoint.x,
            x2 : endPoint.x,
            y1 : startPoint.y,
            y2 : endPoint.y,
            xLen : endPoint.x - startPoint.x,
            yLen : endPoint.y - startPoint.y
        };
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

// th or td and count
function appendRow(type, size) {
    if (arguments.length == size + 2) {

        var row = "<tr onmouseover=\"showPoint('" + arguments[2] + "');\">";
        for (var i = 2; i < size + 2; i++) {
            row += "<" + type + ">" + arguments[i] + "</" + type + ">";
        }
        row += "</tr>";
    }
    steps.append(row);
}

Math.sign = function (value) {
    if (value == 0) return 0;
    else return value > 0 ? 1 : -1;
}

function draw2Points() {
    clearCanvas();
    resetScale();
    drawPoint(0, 0);
    drawPoint(9, 4);
}

function testCase1() {
    draw2Points();
    drawCDA();
}

function testCase2() {
    draw2Points();
    drawBrez();
}

function testCase3() {
    draw2Points();
    drawWu();
}

function ipart(x) {
    return Math.floor(x);
}

function fpart(x) {
    return x - Math.floor(x);
}

function rfpart(x) {
    return 1 - fpart(x);
}

function drawWu() {
    var pts = returnPoints();
    if (pts != null) {
        iteratorWu(pts.x1, pts.y1, pts.x2, pts.y2);
    }
}

function drawPointBrighter(swapAxes, x, y, c) {
    if (c > 0 && c < 1)
        context.fillStyle = increase_brightness(POINT_COLOR, 100 * (1 - c));
    if (swapAxes) drawPoint(y, x);
    else drawPoint(x, y);
};

function iteratorWu(x1, y1, x2, y2) {

    var dx = x2 - x1;
    var dy = y2 - y1;
    var swapAxes = false;

    if (Math.abs(dx) < Math.abs(dy)) {
        swapAxes = true;
        var t;
        t = x1;
        x1 = y1;
        y1 = t;
        t = x2;
        x2 = y2;
        y2 = t;
        t = dx;
        dx = dy;
        dy = t;
    }
    if (x2 < x1) {
        t = x1;
        x1 = x2;
        x2 = t;
        t = y1;
        y1 = y2;
        y2 = t;
    }
    var gradient = dy / dx;

    // handle first endpoint
    var xend = Math.round(x1);
    var yend = y1 + gradient * (xend - x1);
    var xgap = rfpart(x1 + 0.5);
    var xpxl1 = xend;  // this will be used in the main loop
    var ypxl1 = ipart(yend);

    drawPointBrighter(swapAxes, xpxl1, ypxl1, rfpart(yend) * xgap);
    drawPointBrighter(swapAxes, xpxl1, ypxl1 + 1, fpart(yend) * xgap);
    var intery = yend + gradient; // first y-intersection for the main loop

    // handle second endpoint
    xend = Math.round(x2);
    yend = y2 + gradient * (xend - x2);
    xgap = fpart(x2 + 0.5);
    var xpxl2 = xend;  // this will be used in the main loop
    var ypxl2 = ipart(yend);
    drawPointBrighter(swapAxes, xpxl2, ypxl2, rfpart(yend) * xgap);
    drawPointBrighter(swapAxes, xpxl2, ypxl2 + 1, fpart(yend) * xgap);

    // main loop
    for (x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
        drawPointBrighter(swapAxes, x, ipart(intery), rfpart(intery));
        drawPointBrighter(swapAxes, x, ipart(intery) + 1, fpart(intery));
        intery = intery + gradient;
    }
}

function increase_brightness(hex, percent) {
    var r = parseInt(hex.substr(1, 2), 16),
            g = parseInt(hex.substr(3, 2), 16),
            b = parseInt(hex.substr(5, 2), 16);

    return '#' +
            ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}


