var canvas, context;
var width, height, halfWidth, halfHeight;
var DEFAULT_STEP = 20;
var map = [];
var canvasElem,info, steps;
var moveCanvas = false;
var oldPosX,oldPosY;

$(function() {
    initCanvas()
});

function initCanvas() {
    canvas = document.getElementById("canvas");
    canvasElem = $("#canvas");
    info = $("#info");
    steps = $("#steps");
    context = canvas.getContext('2d');

    setCtxCenter();
    width = canvas.width;
    halfWidth = width / 2;
    height = canvas.height;
    halfHeight = height / 2;
    context.fillStyle = "blue";

    drawField();
    initEvents();
}

var tid = 0;
var speed = 100;
function toggleOff() {
    if (tid != 0) {
        clearInterval(tid);
        tid = 0;
        moveCanvas = false;
        oldPosX = oldPosY = null;
    }
}

function initEvents() {
    canvasElem.mousedown(function() {
        if (tid == 0)
            tid = setInterval(function() {
                moveCanvas = true;
            }, speed);
    });

    canvasElem.mouseup(function(e) {
        if (!moveCanvas)
            drawPoint(mouseLocalCord(e).x, mouseLocalCord(e).y);
        toggleOff();
    });

    canvasElem.mousemove(function(e) {
        if (moveCanvas) {
            if (oldPosX != null && oldPosY != null) {
                context.translate(e.pageX - oldPosX, e.pageY - oldPosY);
                clearContext();
                drawField();
            }
            oldPosX = e.pageX;
            oldPosY = e.pageY;
        }
        else info.html("x: " + mouseLocalCord(e).x + " y: " + mouseLocalCord(e).y);
    });

    canvasElem.scroll(function() {
        info.html('<div>Handler for .scroll() called.</div>');
    });

    window.addEventListener('keydown', move, true);
    canvas.addEventListener('DOMMouseScroll', scroll, false);
}

function scroll(e) {
    var rolled = ('wheelDelta' in e) ? e.wheelDelta : -40 * e.detail;
    if (rolled > 0)
        upScale();
    else
        downScale();
    console.log(rolled);
}

function move(e) {
    var keyCode = e.keyCode;
    if (keyCode == 38)
        context.translate(0, -DEFAULT_STEP);
    else if (keyCode == 40)
        context.translate(0, +DEFAULT_STEP);
    else if (keyCode == 37)
        context.translate(- DEFAULT_STEP, 0);
    else if (keyCode == 39)
        context.translate(DEFAULT_STEP, 0);
    else
        return;
    clearContext();
    drawField();
}

function mouseLocalCord(e) {
    var offset = canvasElem.offset();
    var x = Math.floor((e.pageX - offset.left - halfWidth) / DEFAULT_STEP);
    var y = Math.floor((e.pageY - offset.top - halfHeight) / DEFAULT_STEP);
    return {"x" : x, "y" : -y};
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
        info.html("Draw point on [" + x + "; " + y + "]");
    } else {
        map.splice(removeId, 1);
        context.clearRect(x * DEFAULT_STEP, -y * DEFAULT_STEP, DEFAULT_STEP, DEFAULT_STEP);
        info.html("Remove point on [" + x + "; " + y + "]");
    }
}

function setCtxCenter() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(canvas.width / 2, canvas.height / 2);
}

function clearCanvas() {
    map = [];
    resetScale();
    steps.html("");
}

function clearContext() {
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
    info.html("");
}

function upScale() {
    clearContext();
    context.scale(1.1, 1.1);
    drawField();
}

function resetScale() {
    clearContext();
    setCtxCenter();
    drawField();
}

function downScale() {
    clearContext();
    context.scale(0.9, 0.9);
    drawField();
}