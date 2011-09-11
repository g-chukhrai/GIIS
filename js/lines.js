function drawCDA() {
    var pts = returnPoints(2);
    if (pts != null) {
        var xLen = pts.x2 - pts.x1;
        var yLen = pts.y2 - pts.y1;
        var length = Math.max(Math.abs(xLen), Math.abs(yLen));
        var dx = xLen / length;
        var dy = yLen / length;
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
    var pts = returnPoints(2);
    if (pts != null) {
        var x = pts.x1;
        var y = pts.y1;
        var xLen = pts.x2 - pts.x1;
        var yLen = pts.y2 - pts.y1;
        var dx = Math.abs(xLen);
        var dy = Math.abs(yLen);
        var signX = Math.sign(xLen);
        var signY = Math.sign(yLen);

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

function drawWu() {
    var pts = returnPoints(2);
    if (pts != null) {
        var x1 = pts.x1, x2 = pts.x2;
        var y1 = pts.y1, y2 = pts.y2;

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

//        map = [];
//        steps.html("");
//        appendRow("th", 4, 'i', 'x', 'y', 'c');
        for (x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
            var ipa = ipart(intery);
            var rfpa = rfpart(intery);
            var fpa = fpart(intery);
//            appendRow("td", 4, x, swapAxes ? x : ipa, swapAxes ? ipa : x, Math.round(rfpa * 100));
//            appendRow("td", 4, x, swapAxes ? x : ipa + 1, swapAxes ? ipa + 1 : x, Math.round(fpa * 100));
            drawPointBrighter(swapAxes, x, ipa, rfpa);
            drawPointBrighter(swapAxes, x, ipa + 1, fpa);
            intery = intery + gradient;
        }
    }
}







