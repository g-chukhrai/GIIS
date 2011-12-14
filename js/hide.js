var hideFieldSize;
var hideLinesCount;
var VIEW_VECTOR = [
    [0, 0, 1, 0]
];
var isVisible;

function checkPlanes() {
    var planesCount = planes.length;
    var bodyMatrix = createMatrix(4, planesCount);
    for (var j = 0; j < planesCount; j++) {
        var normal = getNormal(planes[j]);
        for (var i = 0; i < 4; i++) {
            bodyMatrix[i][j] = normal[i];
        }
    }
    var center = getFigureCenter();
    var visible = multiplyMatrix(center, bodyMatrix);
    for (var j = 0; j < planesCount; j++) {
        if (visible[0][j] > 0) {
            for (var i = 0; i < 4; i++) {
                bodyMatrix[i][j] *= -1;
            }
        }
    }

    visible = multiplyMatrix(VIEW_VECTOR, bodyMatrix);
    var visibleVector = new Array(planesCount);
    for (var j = 0; j < planesCount; j++) {
        visibleVector[j] = visible[0][j] < 0;
    }
    return visibleVector;
}

function getPt(p1, p2, t) {
	var x1 = p1.x;
	var x2 = p2.x;
	var y1 = p1.y;
	var y2 = p2.y;
	var z1 = p1.z;
	var z2 = p2.z;
	
	var x = x1 + t*(x2-x1);
	var y = y1 + t*(y2-y1);
	var z = z1 + t*(z2-z1);
	return {x:x, y:y, z:z};
}

//Функция получения случайной точки на грани (plane) фигуры 
function getRandomPlanePoint(plane) {
	var p1_index = plane[0];
	var p2_index = plane[2];
	var p1 = vertexes[p1_index];
	var p2 = vertexes[p2_index];
	
	var diagonal_x = (p1[0]+p2[0])/2;
	var diagonal_y = (p1[1]+p2[1])/2;
	var diagonal_z = (p1[2]+p2[2])/2;
	
	return {x:diagonal_x, y:diagonal_y, z:diagonal_z};
}


//Функция вычитания векторов
function vectorDifference(p1, p2) {
	var x = p1.x - p2.x;
	var y = p1.y - p2.y;
	var z = p1.z - p2.z;
	return {x:x, y:y, z:z};
}

//Функция деления векторов
function vectorDivision(v1, v2) {
    return v1.x / v2.x + v1.y / v2.y + v1.z / v2.z;
}

//Функция умножения векторов
function vectorMultiplication(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

//Функция отсечения линии, заданной точками p1, p2
function newAlgorithm3D(p1, p2) {
	var dirV = {x : p2.x - p1.x, y : p2.y - p1.y}; //длина линии
	context.fillStyle = POINT_COLOR;  //установка цвета линии
    drawFigure(); //отрисовка 3-хмерной фигуры, грани которой заданы в массиве planes
	
    context.strokeStyle = CORAL;//установка цвета линии
	//Отрисовка линии
	context.beginPath();
	context.moveTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.stroke();

	var tEntering = []; //массив "потенциально входящих в фигуру" t
	var tLeaving = []; //массив "потенциально выходящих из фигуры" t
	//Нахождение t для каждой грани фигуры
    $.each(planes, function(i, val) {
        var normal = getNormal(val); //нахождение нормали грани
		var P = getRandomPlanePoint(val); //нахождение случайной точки, расположенной на грани
		//Создание объекта типа map, содержащего значения координат нормали грани
		var N = normal; 
		N = {x:N[0], y:N[1], z:N[2]}; 
		/*
		if (normal[3] < 0)   {
		N = {x:-N[0], y:-N[1], z:-N[2]}; 
		}
		*/
		//Вычисление t  =  -  N * (p0  -  P)  /  N * (p1 - p0)  
		var firstVectorDif = vectorDifference(p1, P); //(p0  -  P)
		var secondVectorDif = vectorDifference(p2, p1); //(p1 - p0)
		var firstProduct = vectorMultiplication(N, firstVectorDif); // N * (p0  -  P)
		var firstDivisioner = firstProduct; 
		var secondDivisioner = vectorMultiplication(N, secondVectorDif); //N * (p1 - p0)

		var t = -(firstDivisioner/secondDivisioner) ;
	
		if (normal[3] < 0)   {
			secondDivisioner = -secondDivisioner;
			firstDivisioner = -firstDivisioner;
		}
	
		
		//Если 	N * (p1 - p0) < 0 добавление t в группу "потенциально входящих в фигуру" значений t
		//Иначе в группу "потенциально выходящих из фигуры" значений t
		if (t != Infinity && t != -Infinity) {
		if (secondDivisioner < 0) {
			 tEntering.push(t);
		}
		else {
			tLeaving.push(t);
		}
		}
		
    });
	/*
	var tNotInf = [];
	for (var i = 0; i < t_array.length; i++) {
		if (t_array[i] != Infinity && t_array[i] != -Infinity) {
			tNotInf.push(t_array[i]);
		}
	}
	tNotInf = tNotInf.sort();
	*/
	tEntering = tEntering.sort(); //сортировка значений t по возрастанию
	tLeaving = tLeaving.sort(); //сортировка значений t по возрастанию
	var tPE = tEntering[0] //получение значения tвх
	var tPL = tLeaving[tLeaving.length - 1]; //получение значения tвых
	//console.log("tPE: "+tPE+" tPL: "+tPL);
	
	var t1 = tPL;
	var t2 = tPE;
	//Проверка условия видимости линии
	isVisible = false;
	if (t1 < t2 && t1 >= 0 && t2 <= 1) isVisible = true;
	debugPoints(p1, p2);
	
	if (isVisible) {
		var p11 = {x: Math.round(p1.x + t1 * dirV.x), y: Math.round(p1.y + t1 * dirV.y)}; //точка начала видимой части
        var p22 = {x: Math.round(p1.x + t2 * dirV.x),y: Math.round(p1.y + t2 * dirV.y)}; //точка конца видимой части
		//Отрисовка видимой части линии
        context.strokeStyle = LINE_COLOR;
		context.beginPath();
		context.moveTo(p11.x, p11.y);
		context.lineTo(p22.x, p22.y);
		context.stroke();
		//console.log("ok");
    } 
	
}



function makePointPerspective(point) {
	d = 100;
	var x1 =  point.x*d / (point.z == 0 ? 1 : point.z) ;
	var y1 = point.y*d / (point.z == 0 ? 1 : point.z)  ;
	var z1 = d;
	
	return {x:x1, y:y1, z:z1};

}

function reDrawHideLinesCyrus3D() {
	
    var length = controlMap.length
	var tempCM = controlMap;
	clearCanvas();
	controlMap = tempCM;
	
    for (var i = 0; i < length - 1; i += 2) {
        var p1 = controlMap[i];
        var p2 = controlMap[i + 1];
        newAlgorithm3D(p1, p2);
    }
	/*
	p2 = {x:5, y:-70, z:0};
	p1 = {x:-5, y:117, z:0};
	
	newAlgorithm3D(p1, p2);
	printVertexes();
	*/
}

function drawHideLinesCyrus3D() {
    getStartCubeCords();
    var length = controlMap.length;
	
	
    for (var i = 0; i < length - 1; i += 2) {
        var p1 = controlMap[i];
		//p1 = {x: p1.x, y: -p1.y, z: p1.z};
        var p2 = controlMap[i + 1];
		//p2 = {x: p2.x, y: -p2.y, z: p2.z};
        newAlgorithm3D(p1, p2);
    }
	printVertexes();
	printLines();
	
	/*
	p2 = {x:5, y:-70, z:0};
	p1 = {x:-5, y:117, z:0};
	
	newAlgorithm3D(p1, p2);
	*/
}

function getRandomPointsNew(count) {
    if (arguments.length == 0) count = 4;
    clearCanvas();
    resetScale();
    var limit = 300;

    for (var i = 0; i < count; i++) {
        addToMap(Math.rand(-limit, limit), Math.rand(-limit/2, limit/2), Math.rand(-50, 50), true);
    }
    if (labMode != LAB_MODE.HIDE_LINES && labMode != LAB_MODE.HIDE_LINES_CYRUS) {
        drawAllPoints();
    }
}

//Функция получения нормали грани фигуры
function getNormal(plane) {
    var p1 = vertexes[plane[0]];
    var p2 = vertexes[plane[1]];
    var p3 = vertexes[plane[2]];
    var x1 = p1[0];
    var y1 = p1[1];
    var z1 = p1[2];
    var x2 = p2[0];
    var y2 = p2[1];
    var z2 = p2[2];
    var x3 = p3[0];
    var y3 = p3[1];
    var z3 = p3[2];
    var normal = new Array(4);
    normal[0] = y1 * (z2 - z3) + y2 * (z3 - z1) + y3 * (z1 - z2);
    normal[1] = z1 * (x2 - x3) + z2 * (x3 - x1) + z3 * (x1 - x2);
    normal[2] = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);
    normal[3] = -(normal[0] * x1 + normal[1] * y1 + normal[2] * z1);
    return normal;
}

function getFigureCenter() {
    var startV = vertexes[0];
    var minCord = [startV[0],startV[1],startV[2]];
    var maxCord = [startV[0],startV[1],startV[2]];
    $.each(vertexes, function() {
        if (this[0] < minCord[0]) minCord[0] = this[0];
        if (this[1] < minCord[1]) minCord[1] = this[1];
        if (this[2] < minCord[2]) minCord[2] = this[2];
        if (this[0] > maxCord[0]) maxCord[0] = this[0];
        if (this[1] > maxCord[1]) maxCord[1] = this[1];
        if (this[2] > maxCord[2]) maxCord[2] = this[2];
    });
    return [
        [(maxCord[0] + minCord[0]) / 2, (maxCord[1] + minCord[1]) / 2, (maxCord[2] + minCord[2]) / 2, 1]
    ];
}

function paintField() {
    context.fillStyle = POINT_COLOR;
    drawBrez({x1 : -hideFieldSize, y1 : -hideFieldSize, x2: -hideFieldSize, y2: hideFieldSize});
    drawBrez({x1 : -hideFieldSize , y1 : hideFieldSize, x2: hideFieldSize, y2: hideFieldSize });
    drawBrez({x1 : hideFieldSize, y1 : hideFieldSize, x2: hideFieldSize, y2: -hideFieldSize});
    drawBrez({x1 : hideFieldSize, y1 : -hideFieldSize, x2: -hideFieldSize, y2: -hideFieldSize});
}

function drawRandomLines() {
    setLabMode(LAB_MODE.HIDE_LINES);
    hideFieldSize = parseInt($("#fieldSize").val());
    hideLinesCount = parseInt($("#linesCount").val());
    getRandomPoints(hideLinesCount * 2);
    drawHideLines();
}

function drawRandomCyrus() {
    setLabMode(LAB_MODE.HIDE_LINES_CYRUS);
    hideFieldSize = parseInt($("#fieldSize").val());
    hideLinesCount = parseInt($("#linesCount").val());
    getRandomPoints(hideLinesCount * 2);
    drawHideLinesCyrus();
}

function drawRandomCyrus3D() {
    setLabMode(LAB_MODE.HIDE_LINES_CYRUS);
    hideFieldSize = parseInt($("#fieldSize").val());
    hideLinesCount = parseInt($("#linesCount").val());
    getRandomPointsNew(hideLinesCount*2);
    drawHideLinesCyrus3D();
}



function printLines() {
    var count = controlMap.length;

        appendRow("th", 3, 'x', 'y', 'z');
        for (var i = 0; i < count; i++) {
            var v = controlMap[i];
            appendRow("td", 3, Math.round(v.x), Math.round(v.y), Math.round(v.z));
        }

}

function drawHideLines() {
    var length = controlMap.length;
    for (var i = 0; i < length - 1; i += 2) {
        var p1 = controlMap[i];
        var p2 = controlMap[i + 1];
        var isClipped = false;
        if (isTrivialVisible(p1, p2)) {
            context.fillStyle = CORAL;
        } else if (isTrivialInvisible(p1, p2)) {
            context.fillStyle = WHITE_SMOKE;
        } else {
            isClipped = true;
            drawClippedLine(p1, p2);
            context.fillStyle = WHITE_SMOKE;
        }
        drawBrez(get2PointMap(p1, p2), isClipped);
    }
    paintField();
    drawAllPoints();
}

function drawHideLinesCyrus() {
    var clipRect = [
        {x: -hideFieldSize, y: -hideFieldSize},
        {x: -hideFieldSize + 5, y:  hideFieldSize},
        {x:  hideFieldSize, y:  hideFieldSize + 5},
        {x:  hideFieldSize + 5, y: -hideFieldSize + 5}
    ];
    var length = controlMap.length;
    for (var i = 0; i < length - 1; i += 2) {
        var p1 = controlMap[i];
        var p2 = controlMap[i + 1];
        algorithm(clipRect, p1, p2);
    }
    context.fillStyle = POINT_COLOR;
    drawBrez(get2PointMap(clipRect[0], clipRect[1]));
    drawBrez(get2PointMap(clipRect[1], clipRect[2]));
    drawBrez(get2PointMap(clipRect[2], clipRect[3]));
    drawBrez(get2PointMap(clipRect[3], clipRect[0]));
    drawAllPoints();
}



function classify(p) {
    if (p.x < -hideFieldSize) {
        if (p.y < -hideFieldSize)
            return 1 << 3 | 1;
        else if (p.y > hideFieldSize)
            return 1 << 4 | 1;
        else
            return 1;
    }
    else if (p.x > hideFieldSize) {
        if (p.y < -hideFieldSize)
            return 1 << 3 | 1 << 2;
        else if (p.y > hideFieldSize)
            return 1 << 4 | 1 << 2;
        else
            return 1 << 2;
    }
    else {
        if (p.y < -hideFieldSize)
            return 1 << 3;
        else if (p.y > hideFieldSize)
            return 1 << 4;
        else
            return 0;
    }
}

function isPointInsideClipRect(p) {
    return !(p.x < -hideFieldSize || p.x > hideFieldSize || p.y < -hideFieldSize || p.y > hideFieldSize);
}

function isTrivialVisible(p1, p2) {
    return isPointInsideClipRect(p1) && isPointInsideClipRect(p2);
}

function isTrivialInvisible(p1, p2) {
    return (classify(p1) & classify(p2)) != 0;
}

function drawClippedLine(p1, p2) {
    context.fillStyle = CORAL;
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    if (dx == 0 || dy == 0) {
        drawBrez(get2PointMap(p1, p2));
        return;
    }

    var m = dy / dx;
    var p = [];
    if (isPointInsideClipRect(p1)) {
        p.push(p1);
    }
    if (isPointInsideClipRect(p2)) {
        p.push(p2);
    }

    var yLeft = m * (-hideFieldSize - p1.x) + p1.y;
    var left = {x:  -hideFieldSize, y : Math.floor(yLeft) };
    if (( left.x >= p1.x || left.x >= p2.x ) && isPointInsideClipRect(left))
        p.push(left);

    var yRight = m * (hideFieldSize - p1.x) + p1.y;
    var right = {x: hideFieldSize, y : Math.floor(yRight)};
    if (( right.x <= p1.x || right.x <= p2.x ) && isPointInsideClipRect(right))
        p.push(right);

    var xDown = p1.x + (-hideFieldSize - p1.y ) / m;
    var down = {x: Math.floor(xDown) , y :  -hideFieldSize };
    if (( down.y >= p1.y || down.y >= p2.y ) && isPointInsideClipRect(down))
        p.push(down);

    var xUp = p1.x + ( hideFieldSize - p1.y ) / m;
    var up = {x: Math.floor(xUp), y : hideFieldSize };
    if (( up.y <= p1.y || up.y <= p2.y ) && isPointInsideClipRect(up))
        p.push(up);

    if (p.length > 1) {
        p1 = {x:p[0].x, y: p[0].y};
        p2 = {x:p[1].x, y: p[1].y};
        drawBrez(get2PointMap(p1, p2));
    }
}

function algorithm(p, p1, p2) {
    // calculate normals
    context.fillStyle = WHITE_SMOKE;
    drawBrez(get2PointMap(p1, p2));
    var normals = getNormals(p);

    // start largest at smallest legal value and smallest
    // at largest legal value
    var t1 = 0;
    var t2 = 1;

    // compute the direction vector
    var dirV = {x : p2.x - p1.x, y : p2.y - p1.y};
    var visible = true;
    var i = 0;
    while (i < p.length && visible) {

        var q0 = {x: p1.x - p[i].x, y: p1.y - p[i].y};
        var qi = dotProduct(normals[i], q0);
        var pi = dotProduct(normals[i], dirV);

        if (pi == 0) {          // Parallel or Point
            // parallel - if outside then forget the line; if inside then there are no
            // intersections with this side
            // but there may be with other edges, so in this case just keep going
            if (qi > 0) {
                visible = false;   //   Parallel and outside or point (p1 == p2) and outside
            }
        } else {
            var t = -(qi / pi);
            if (pi < 0) {       // entering
                if (t > t1) {
                    t1 = t;
                }
            } else {
                if (t < t2) {   // exiting
                    t2 = t;
                }
            }
        }
        i++;
    }
//    console.log("init: (" + t1 + ";" + t2 + ")");
    if (t1 <= t2 && t1 >= 0 && t2 <= 1) {
        var p11 = {x: Math.round(p1.x + t1 * dirV.x), y: Math.round(p1.y + t1 * dirV.y)};
        var p22 = {x: Math.round(p1.x + t2 * dirV.x),y: Math.round(p1.y + t2 * dirV.y)};
        context.fillStyle = CORAL;
        drawBrez(get2PointMap(p11, p22));
//        console.log("init: (" + p1.x + ";" + p1.y + ")-(" + p2.x + ";" + p2.y + ")" + " res: (" + p11.x + ";" + p11.y + ")-(" + p22.x + ";" + p22.y + ")");
    } else {
        visible = false;
    }
}

function algorithm3D(p1, p2) {
    // calculate normals
    context.fillStyle = WHITE_SMOKE;

    drawBrez(make2DProjection2Points(p1, p2));
    var normals = new Array(planes.length);
    $.each(planes, function(i, val) {
        var normal = getNormal(val);
        var koef = 1;
        normals[i] = {x:normal[0]/koef,y:normal[1]/koef,z:normal[2]/koef};
    });
    var t1 = 0;
    var t2 = 1;

    // compute the direction vector
    var dirV = {x : p2.x - p1.x, y : p2.y - p1.y, z: p2.z - p1.z};
    var visible = true;
    var i = 0;
    while (i < planes.length && visible) {

        var vertex = vertexes[planes[i][0]];
        var q0 = {x: p1.x - vertex[0], y: p1.y - vertex[1], z: p1.z - vertex[2]};
        var qi = dotProduct3D(normals[i], q0);
        var pi = dotProduct3D(normals[i], dirV);

        if (pi == 0) {
            if (qi > 0) {
                visible = false;
            }
        } else {
            var t = -(qi / pi);
            if (pi < 0) {       // entering
                if (t > t1) {
                    t1 = t;
                }
            } else {
                if (t < t2) {   // exiting
                    t2 = t;
                }
            }
        }
        i++;
    }
    //console.log("init: (" + t1 + ";" + t2 + ")");
    if (t1 <= t2 && t1 >= 0 && t2 <= 1) {
        var p11 = {x: Math.round(p1.x + t1 * dirV.x), y: Math.round(p1.y + t1 * dirV.y), z: Math.round(p1.z + t1 * dirV.z)};
        var p22 = {x: Math.round(p1.x + t2 * dirV.x), y: Math.round(p1.y + t2 * dirV.y), z: Math.round(p1.z + t2 * dirV.z)};
        context.fillStyle = CORAL;
        drawBrez(make2DProjection2Points(p11, p22));
        //console.log("init: (" + p1.x + ";" + p1.y + ";" + p1.z + ")-(" + p2.x + ";" + p2.y + ";" + p2.z + ")" +  " res: (" + p11.x + ";" + p11.y + ";" + p11.z + ")-(" + p22.x + ";" + p22.y + ";" + p22.z + ")");
    } else {
        visible = false;
    }
}

function getNormals(p) {
    var normals = new Array(4);
    var lastPoint = p.length;
    for (var i = 0; i < lastPoint; i++) {
        var j = (i + 1) % lastPoint;
        var k = (i + 2) % lastPoint;
        // make vector be -1/mI + 1J
        var p1 = {x : -(p[j].y - p[i].y) / (p[j].x - p[i].x), y:  1};
        var v1 = {x : p[k].x - p[i].x, y : p[k].y - p[i].y};
        // inner normal
        var koef = dotProduct(p1, v1) > 0 ? -1 : 1;
        normals[i] = {x : koef * p1.x, y : koef};
    }
    return normals;
}

function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function dotProduct3D(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

