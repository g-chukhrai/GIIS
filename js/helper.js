function addToMap(x, y, isState) {
	if (arguments.length == 3) {
		controlMap.push({'x' : x, 'y' : y, 'z' : 1});
	}
	else {
		map.push({'x' : x, 'y' : y, 'z' : 1});
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
}

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
function controlPointExists(x, y)
{
	var containPoint = false;
	$.each(controlMap, function() {
		if (this.x == x && this.y == y) {
			containPoint = true;
		}
	});
	return containPoint;
}

//Функция получения номера "контрольной точке" в массиве controlMap
function getPointNumber(x, y) {
	var pointNumber = 0;
	var i = 0;
	$.each(controlMap, function() {
		if (this.x == x && this.y == y) {
			pointNumber = i;
		}
		i++;
	});
	return pointNumber;
}

//Функция изменения положения точки с порядковым номером number в массиве controlMap
function changePointPosition(x, y, number) {
	controlMap[number] = {'x' : x, 'y' : y, 'z' : 1};
}

//Функция отрисовки алгоритма (используется во время перемещения "контрольной точки")
function drawAlgorythm() {
	clearStandartMap();
	switch(algorythmType) {
		case 1: {
			drawHermite();
			break;
		}
		case 2: {
			drawBezier();
			break;
		}
		case 3: {
			drawBSpline();
			break;
		}
	}
}