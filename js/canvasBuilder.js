var canvas, context;
var width, height, halfWidth, halfHeight;
var DEFAULT_STEP = 20;
var map = [];

$(function() {
    initCanvas()
});

function initCanvas() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    setCtxCenter();
    width = canvas.width;
    halfWidth = width / 2;
    height = canvas.height;
    halfHeight = height / 2;
    context.fillStyle = "blue";
    drawField();

    $("#canvas").click(function(e) {
        var offset = $("#canvas").offset();
        var x = Math.floor((e.pageX - offset.left - halfWidth) / DEFAULT_STEP);
        var y = Math.floor((e.pageY - offset.top - halfHeight) / DEFAULT_STEP);
        drawPoint(x, -y);
    });
}

function drawPoint(x, y) {
    if (arguments.length == 0) {
        x = parseInt($("#xPos").val());
        y = parseInt($("#yPos").val());
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
        context.fillRect(x * DEFAULT_STEP, -y * DEFAULT_STEP, DEFAULT_STEP, DEFAULT_STEP);
        $("#info").html("Draw point on [" + x + "; " + y + "]");
    } else {
        map.splice(removeId, 1);
        context.clearRect(x * DEFAULT_STEP, -y * DEFAULT_STEP, DEFAULT_STEP, DEFAULT_STEP);
        $("#info").html("Remove point on [" + x + "; " + y + "]");
    }
}

function setCtxCenter() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(canvas.width / 2, canvas.height / 2);
}

function cleanCanvas() {
    clearCanvas();
    map = [];
    drawField();
}

function clearCanvas() {
    context.save();
    context.beginPath();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function drawField() {
    context.strokeStyle = "#000";
    context.strokeRect(-halfWidth, -halfHeight, width, height);

    for (var x = -halfWidth; x < halfWidth; x += DEFAULT_STEP) {
        context.moveTo(x, -halfHeight);
        context.lineTo(x, halfHeight);
    }

    for (var y = -halfHeight; y < halfHeight; y += DEFAULT_STEP) {
        context.moveTo(halfWidth, y);
        context.lineTo(-halfWidth, y);
    }
    context.strokeStyle = "#eee";
    context.stroke();
    var mapCopy = map;
    map = [];
    $.each(mapCopy, function() {
        drawPoint(this.x, this.y);
    });
    $("#info").html("");
    $("#steps").html("");
}

function upScale() {
    clearCanvas();
    context.scale(1.1, 1.1);
    drawField();
}

function resetScale() {
    clearCanvas();
    setCtxCenter();
    drawField();
}

function downScale() {
    clearCanvas();
    context.scale(0.9, 0.9);
    drawField();
}

function drawPath() {
    if (map.length != 2) {
        $("#info").html("Stay only two points on canvas (points removed by click)");
    } else {
        var startPoint = map[0];
        var endPoint = map[1];
        var x1 = startPoint.x, x2 = endPoint.x;
        var y1 = startPoint.y, y2 = endPoint.y;
        var length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        var dx = (x2 - x1) / length;
        var dy = (y2 - y1) / length;
        var x = x1 + 0.5 * sign(dx);
        var y = y1 + 0.5 * sign(dy);
        var resultString = "<table id='newspaper-b'><tr><th>i</th><th>x</th><th>y</th><th>Point(x;y)</th></tr>";
        for (var i = 0; i <= length; i++) {
            resultString += "<tr><td>" + i + "</td><td>" + x + "</td><td>" + y + "</td><td>(" + Math.round(x) + ";" + Math.round(y) + ")</td></tr>";
            drawPoint(Math.round(x), Math.round(y));
            x += dx;
            y += dy;
        }
        resultString += "</table>";
        $("#steps").html(resultString);
    }
}

function sign(value) {
    if (value < 0) return -1;
    else if (value == 0) return 0;
    else return 1;
}