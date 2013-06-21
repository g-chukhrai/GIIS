function addToMap(x, y, z, isState) {
    if (arguments.length == 4) {
        controlMap.push({'x' : x, 'y' : y, 'z' : z});
    } else {
        map.push({'x' : x, 'y' : y, 'z' : 1});
		if (pixelMatrix != null) pixelMatrix[x+HALF_PIXEL_COUNT][y+HALF_PIXEL_COUNT] = 1;
    }
}

// th or td and count
function appendRow(type, size) {
    if (arguments.length == size + 2) {
        var row = "<tr onmouseover=\"showPoint('" + arguments[2] + "');\">";
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
};

Math.rand = function(from, to) {
    return Math.floor(Math.random() * (from - to + 1)) + to;
};

function ipart(x) {
    return Math.floor(x);
}

function fpart(x) {
    return x - Math.floor(x);
}

function rfpart(x) {
    return 1 - fpart(x);
}

//Функция проверки существования "контрольной точки" в координатах х,у
function controlPointExists(x, y) {
    var index = null;
    $.each(controlMap, function(i,val) {
        if (val.x == x && val.y == y) {
            index = i;
            return false;
        }
    });
    return index;
}

//Функция проверки существования точки в координатах х,у
/*
function pointExists(x, y) {
    var index = null;
    $.each(map, function(i,val) {
        if (val.x == x && val.y == y) {
            index = i;
            return false;
        }
    });
    return index;
}
*/
function pointExists(x, y) {
	return pixelMatrix[x+HALF_PIXEL_COUNT][y+HALF_PIXEL_COUNT];
}


//Функция изменения положения точки с порядковым номером number в массиве controlMap
function changePointPosition(x, y, number) {
    controlMap[number] = {'x' : x, 'y' : y, 'z' : 1};
}

//Функция создания матрицы размера mm*qq
function createMatrix(mm, qq) {
    var result = new Array(mm);
    for (var m = 0; m < mm; m++) {
        result[m] = new Array(qq);
        for (var q = 0; q < qq; q++) {
            result[m][q] = 0;
        }
    }
    return result;
}

//Функция, выполняющая умножение матриц m1 и m2
function multiplyMatrix(m1, m2) {
    var mm = m1.length;
    var nn = m1[0].length;
    var qq = m2[0].length;
    var result = createMatrix(mm, qq);
    for (var m = 0; m < mm; m++) {
        for (var q = 0; q < qq; q++) {
            for (var n = 0; n < nn; n++) {
                result[m][q] += m1[m][n] * m2[n][q];
            }
        }
    }
    return result;
}

function getPoints() {
    for (var i = 0; i < controlMap.length; i++) {
        l3_points[i] = [controlMap[i].x, controlMap[i].y];
    }
}

function getRandomPoints(count) {
    if (arguments.length == 0) count = 4;
    clearCanvas();
    resetScale();
    var limit = (halfWidth / canvasStep) - 10;

    for (var i = 0; i < count; i++) {
        addToMap(Math.rand(-limit, limit), Math.rand(-limit, limit),Math.rand(-limit, limit), true);
    }
    if (labMode != LAB_MODE.HIDE_LINES && labMode != LAB_MODE.HIDE_LINES_CYRUS) {
        drawAllPoints();
    }
}

//Функция объединения двух массивов
function union_maps(first, second) {
	var i = first.length;
	var j = second.length;
	var res = first;
	for (var k = 0; k < j; k++) {
		res[i] = second[k];
		i++;
	}
	return res;
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

function get2PointMap(p1,p2){
    return {x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y};
}

function printPoint(p, name){
    console.log("point " + name + ": " + p.x + ":" + p.y );
}




