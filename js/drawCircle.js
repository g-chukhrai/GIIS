function drawCircle() {
    var x = 0;
    var y = parseInt($("#radius").val());
    var lim = 0;
    var D = 2 - 2 * y;
    var it = 0;
    map = [];
    drawPoint(x, y);
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
        drawPoint(x, y);
    }
}

function drawParabola() {
    var pts = returnPoints(1);
    if (pts != null) {
        var x = 0;
        var y = 0;
        var p = parseInt($("#koef").val());
        var lim = (p != 0) ? -Math.abs(20 - pts.x1) : 0;
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