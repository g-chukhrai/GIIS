function addToMap(x, y, isState) {
    if (arguments.length == 3) {
        controlMap.push({'x' : x, 'y' : y, 'z' : 1});
    } else {
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

//Функция изменения положения точки с порядковым номером number в массиве controlMap
function changePointPosition(x, y, number) {
    controlMap[number] = {'x' : x, 'y' : y, 'z' : 1};
}

//Функция отрисовки алгоритма (используется во время перемещения "контрольной точки")
function drawAlgorithm(isRandom) {
    clearStandartMap();
    if (algorithmType == 1) {
        drawHermite(isRandom);
    } else if (algorithmType == 2) {
        drawBezier(isRandom);
    } else if (algorithmType == 3) {
        drawBSpline(isRandom);
    }
}

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