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

    $("#canvas").mousemove(function(e) {
        var offset = $("#canvas").offset();
        var x = Math.floor((e.pageX - offset.left - halfWidth) / DEFAULT_STEP);
        var y = Math.floor((e.pageY - offset.top - halfHeight) / DEFAULT_STEP);
        $("#info").html("x: " +  x +  " y: " + -y);
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
    $("#steps").html("");
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

    //draw X
    var leftWall = halfWidth - DEFAULT_STEP;
    context.beginPath();
    context.moveTo(-leftWall, DEFAULT_STEP);
    context.lineTo(0, DEFAULT_STEP);
    context.moveTo(DEFAULT_STEP, DEFAULT_STEP);
    context.lineTo(leftWall, DEFAULT_STEP);
    context.moveTo(leftWall - 5, 5 + DEFAULT_STEP);
    context.lineTo(leftWall, DEFAULT_STEP);
    context.lineTo(leftWall - 5, -5 + DEFAULT_STEP);

    //draw Y
    var topWall = halfHeight - DEFAULT_STEP;
    context.moveTo(5, -topWall + 5);
    context.lineTo(0, -topWall);
    context.lineTo(-5, -topWall + 5);
    context.moveTo(0, -topWall);
    context.lineTo(0, 0);
    context.moveTo(0, DEFAULT_STEP);
    context.lineTo(0, topWall);

    context.strokeStyle = "#000";
    context.stroke();

    var mapCopy = map;
    map = [];
    $.each(mapCopy, function() {
        drawPoint(this.x, this.y);
    });
    $("#info").html("");
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
        var startPoint = map[0].x > map[1].x ? map[1] : map[0];
        var endPoint = map[0].x > map[1].x ? map[0] : map[1];
        var x1 = startPoint.x, x2 = endPoint.x;
        var y1 = startPoint.y, y2 = endPoint.y;
        var length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        var dx = (x2 - x1) / length;
        var dy = (y2 - y1) / length;
        var x = x1 + 0.5 * sign(dx);
        var y = y1 + 0.5 * sign(dy);
        //header
        var resultString = "<table id='newspaper-b'>"
        resultString += createTableRow("th", 4, 'i', 'x', 'y', 'Point(x,y)');
        map = [];
        //algorithm
        resultString += createTableRow("td", 4, "", "", "start", "(" + x1 + ";" + y1 + ")");
        for (var i = 0; i <= length; i++) {
            var resultX = Math.floor(x);
            var resultY = Math.floor(y);
            resultString += createTableRow("td", 4, i, x.toFixed(4), y.toFixed(4), "(" + resultX + ";" + resultY + ")");
            drawPoint(resultX, resultY);
            x += dx;
            y += dy;
        }
        resultString += createTableRow("td", 4, "", "", "end", "(" + x2 + ";" + y2 + ")");

        //footer
        resultString += createTableRow("th", 4, "", "dx", "dy", "length");
        resultString += createTableRow("td", 4, "", dx.toFixed(2), dy.toFixed(2), length);
        resultString += "</table>";
        $("#steps").html(resultString);
    }
}

// th or td and count
function createTableRow(type, size) {
    if (arguments.length == size + 2) {
        var row = "<tr>";
        for (var i = 2; i < size + 2; i++) {
            row += "<" + type + ">" + arguments[i] + "</" + type + ">";
        }
        row += "</tr>";
    }
    return row;
}

function sign(value) {
    if (value < 0) return -1;
    else if (value == 0) return 0;
    else return 1;
}

function testCase1() {
    cleanCanvas();
    resetScale();
    drawPoint(0, 0);
    drawPoint(9, 4);
    drawPath();
}