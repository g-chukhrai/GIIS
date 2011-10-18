var l3_points = [];
var step;

function getPoints() {

	for (var i = 0; i < controlMap.length; i++) {
		l3_points[i] = [controlMap[i].x, controlMap[i].y];
	}	
/*
	l3_points = returnPoints(4);
	var count = map.length;

	if (count < 4) {
		clearCanvas();
		
		var p1x = parseInt($("#p1x").val());
		var p1y = parseInt($("#p1y").val());
		var p4x = parseInt($("#p4x").val()); 
		var p4y = parseInt($("#p4y").val());
		var r1x = parseInt($("#r1x").val());
		var r1y = parseInt($("#r1y").val());
		var r4x = parseInt($("#r4x").val());
		var r4y = parseInt($("#r4y").val());
	
		l3_points = [[p1x, p1y],
                [p4x, p4y],
                [r1x, r1y],
                [r4x, r4y]];
		addToMap(p1x, p1y);
		addToMap(p4x, p4y);
		addToMap(r1x, r1y);
		addToMap(r4x, r4y);
	}
	else {
		for (var i = 0; i < count; i++) {
			l3_points[i] = [map[i].x, map[i].y];
		}
	}
	*/
}

function getRandomPoints(count) {
	var count;
	if (arguments.length == 0) count = 4; 
	clearCanvas();
    resetScale();
    var limit = (halfWidth / canvasStep) - 10;
	
	for (var i = 0; i < count; i++) {
		addToMap(Math.rand(-limit, limit), Math.rand(-limit, limit), true);
	}
	drawAllPoints();
}

function drawHermite(isRandom)
{
    step = 0.001;
	if (isRandom) getRandomPoints();
	getPoints();

    var G = l3_points;
 
    var M = [[2, -2, 1, 1],[-3, 3, -2, -1],[0, 0, 1, 0],[1, 0, 0, 0]];
	
        for (var t = 0; t <= 1; t += step) {
            var T = [[t * t * t, t * t, t, 1]];
            var result = multiplyMatrix(multiplyMatrix(T, M), G);
	    addToMap(Math.round(result[0][0]), Math.round(result[0][1]));
        }
 
	drawAllPoints();
 
}


function drawBezier(isRandom) {
	step = 0.001;

    var M = [[-1, 3, -3, 1],[3, -6, 3, 0],[-3, 3, 0, 0],[1, 0, 0, 0]];
	
	if (isRandom) getRandomPoints();
	getPoints();
 
    var G = l3_points;
 
    var C = multiplyMatrix(M, G);
 
    for (var t = 0; t <= 1; t += step) {
        var T = [[t * t * t, t * t, t, 1]];
        var result = multiplyMatrix(T, C);
	    addToMap(Math.round(result[0][0]), Math.round(result[0][1]));
    }

	drawAllPoints();
}


function drawBSpline(isRandom) {
	step = 0.001;
    var M = [[-1, 3, -3, 1],[3, -6, 3, 0],[-3, 0, 3, 0],[1, 4, 1, 0]];
	
	if (isRandom) getRandomPoints(4);
	/*
	l3_points = [[-7, 6],
				[4, 6],
				[4, -7],
				[-7, -7],
				[-3, -2],
				[1, 1],
				[-3, 2],
				[2, -3]];
	*/	   
    var count = controlMap.length;
	  
    for (var i = 0; i < count - 3; i++) {
        var px1 = controlMap[i].x,
        py1 = controlMap[i].y,
        px2 = controlMap[i+1].x,
        py2 = controlMap[i+1].y,
        px3 = controlMap[i+2].x,
        py3 = controlMap[i+2].y,
        px4 = controlMap[i+3].x,
        py4 = controlMap[i+3].y;
 
        var G = [[px1, py1],
                [px2, py2],
                [px3, py3],
                [px4, py4]];
 
        var r = multiplyMatrix(M, G);
 
        for (var t = 0; t <= 1; t += step*canvasStep) {
            var T = [[t * t * t, t * t, t, 1]];
            var result = multiplyMatrix(T, r);
            //result = multiplyMatrix(1./6., result);
			addToMap(Math.round(result[0][0]/6.), Math.round(result[0][1]/6.));
        }
	}
	drawAllPoints();
}


function multiplyMatrix(m1,m2) {
	var mm = m1.length;
	var nn = m1[0].length;
	var qq = m2[0].length;
	var result = createMatrix(mm,qq);
	for (var m = 0; m < mm; m++){
		for (var q = 0; q < qq; q++){
			for (var n = 0; n < nn; n++){
				result[m][q] += m1[m][n] * m2[n][q];
			} 
		}
	} 
	return result;
}

function createMatrix(mm,qq) {
	var result = new Array(mm);
	for (var m = 0 ; m < mm ; m++) {
		result[m] = new Array(qq);
		for (var q = 0 ; q < qq ; q++) {
			result[m][q] = 0;
		}
	}
	return result;
}

function test(){
		var m1 = [[1,2,3,4], [5,6,7,8],[1,2,3,4],[5,6,7,8]];
		var m2 = [[1,4], [4,2], [5,5], [2,1]];
		var m2 = multiplyMatrix(m1,m2);
}