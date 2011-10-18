function changeStep() {
    var newStep = parseInt($("#step").val());
    if (newStep > 0 && newStep <= 25)
        canvasStep = newStep;
    clearCanvas();
}

function toggleOff() {
    if (tid != 0) {
        clearInterval(tid);
        tid = 0;
        moveCanvas = false;
        oldPosX = oldPosY = null;
    }
}

function scroll(e) {
    var rolled = ('wheelDelta' in e) ? e.wheelDelta : -40 * e.detail;
    if (rolled > 0) upScale();
    else downScale();
}

function move(e) {
    var keyCode = e.keyCode;
    if (keyCode == 38)
        context.translate(0, -canvasStep);
    else if (keyCode == 40)
        context.translate(0, +canvasStep);
    else if (keyCode == 37)
        context.translate(- canvasStep, 0);
    else if (keyCode == 39)
        context.translate(canvasStep, 0);
    else
        return;
    clearContext();
    drawField();
}

function mouseLocalCord(e) {
    var offset = canvasElem.offset();
    var x = Math.floor((e.pageX - offset.left - halfWidth) / canvasStep / scaleFactor);
    var y = Math.floor((e.pageY - offset.top - halfHeight) / canvasStep / scaleFactor);
    return {"x" : x, "y" : -y};
}

function setCtxCenter() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(canvas.width / 2, canvas.height / 2);
}

function clearCanvas() {
    map = [];
	controlMap = [];
    resetScale();
    steps.html("");
}

function clearStandartMap() {
	map = [];
	resetScale();
}

function clearContext() {
    context.save();
    context.beginPath();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function upScale() {
    clearContext();
    scaleFactor += 0.1;
    context.scale(1.1, 1.1);
    drawField();
}

function resetScale() {
    clearContext();
    scaleFactor = 1;
    setCtxCenter();
    drawField();
}

function downScale() {
    clearContext();
    context.scale(0.9, 0.9);
    scaleFactor -= 0.1;
    drawField();
}