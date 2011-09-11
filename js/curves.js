function drawCircle() {
    var x = 0;
    var y = parseInt($("#radius").val());
    var lim = 0;
    var D = 2 - 2 * y;
    var it = 0;
    map = [];
    addToMap(x, y);
    while (y > lim) {
        var d;
        if (D < 0) {
            d = 2 * D + 2 * y - 1;
            if (d <= 0) {
                x++;
                D += 2 * x + 1;
            } else {
                x++;
                y--;
                D += 2 * x - 2 * y + 2;
            }
        } else if (D > 0) {
            d = 2 * D - 2 * x - 1;
            if (d > 0) {
                y--;
                D += 1 - 2 * y;
            } else {
                x++;
                y--;
                D += 2 * x - 2 * y + 2;
            }
        } else if (D == 0) {
            x++;
            y--;
            D += 2 * x - 2 * y + 2;
        }
        addToMap(x, y);
    }
    //reflection
    $.each(map, function() {
        var x = this.x, y = this.y;
        addToMap(-x, y);
        addToMap(-x, -y);
        addToMap(x, -y);
    });
    drawAllPoints();
}

function drawCircleRandom() {
    var limit = (halfWidth / canvasStep) - 10;
    var radius = Math.floor(Math.random() * limit);
    $("#radius").val(radius);
    clearCanvas();
    drawCircle();
}

function drawParabola() {
    var pts = returnPoints(1);
    if (pts != null) {
        var x = 0;
        var y = 0;
        var p = parseInt($("#koef").val());
        var lim = (p != 0) ? -Math.abs(pts.x1 + halfWidth / canvasStep) : 0;
        var D = p == 1 ? 0 : -1;
        var it = 0;
        while (x >= lim) {
            if (p >= 0) {
                drawPoint(x + pts.x1, y + pts.y1);
                drawPoint(x + pts.x1, -y + pts.y1);
            } else {
                drawPoint(-x + pts.x1, y + pts.y1);
                drawPoint(-x + pts.x1, -y + pts.y1);
            }
            var d;
            if (D > 0) {
                d = (2 * (D - 2 * p + y)) + 1;
                if (d > 0) {
                    x--;
                    D -= (2 * p);
                } else {
                    x--;
                    y++;
                    D += (2 * y - 2 * p + 1);
                }
            } else if (D < 0) {
                d = 2 * (D + 2 * y + 1 - p);
                if (d < 0) {
                    y++;
                    D += 2 * y + 1;
                } else {
                    x--;
                    y++;
                    D += (2 * y - 2 * p + 1);
                }
            } else {
                x--;
                y++;
                D += (2 * y - 2 * p + 1);
            }
        }
    }
}

function drawParabolaRandom() {
    var limit = (halfWidth / canvasStep) - 10;
    var koef = Math.floor(Math.random() * limit);
    $("#koef").val(koef);
    clearCanvas();
    drawRandomPoint(-limit, limit);
    drawParabola();
}

function drawEllipse() {
    var pts = returnPoints(1);
    if (pts != null) {
        var a = parseInt($("#a").val());
        var b = parseInt($("#b").val());
        for (var i = 0; i < 360; i++) {
            var alpha = i * (Math.PI / 180);
            var sinAlpha = Math.sin(alpha);
            var cosAlpha = Math.cos(alpha);
            var x = Math.floor(pts.x1 + (a * cosAlpha));
            var y = Math.floor(pts.y1 + (b * sinAlpha));
            addToMap(x, y);
        }
        drawAllPoints();
    }
}

function drawEllipseRandom() {
    var limit = (halfWidth / canvasStep) - 10;
    var a = Math.floor(Math.random() * limit);
    var b = Math.floor(Math.random() * limit);
    $("#a").val(a);
    $("#b").val(b);
    clearCanvas();
    drawRandomPoint(-limit, limit);
    drawEllipse();
}