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
    if (pointId != null) {
        if (map && map.length > pointId) {
            context.fillStyle = "red";
            drawPoint(map[pointId]);
        }
    }
}

// th or td and count
function appendRow(type, size) {
    if (arguments.length == size + 2) {

        var row = "<tr onclick=\"showPoint(" + arguments[2] + ");\">";
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