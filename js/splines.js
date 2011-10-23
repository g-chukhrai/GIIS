var l3_points = []; //Переменная, хранящая массив координат точек
var step;
var showInfoTable = true; //Переменная, указывающая требуется ли вывод отладочной информации

/*	Функция отрисовки кривой Эрмита
	@param isRandom - параметр, указывающий - отрисовка будет производиться по заданному или случайному набору точек
*/
function drawHermite(isRandom) {
	var showInfoTable=$('input[name="showInfo"]').prop('checked');
    if (isRandom) getRandomPoints(); // Отрисовка на холсте четырех точек со случайными координатами
    getPoints(); //Получение координат четырех точек с холста
	
	//Переменная, хранящая матрицу Эрмита M
    var M = [
        [2, -2, 1, 1],
        [-3, 3, -2, -1],
        [0, 0, 1, 0],
        [1, 0, 0, 0]
    ];
	
	//Переменная, хранящая матрицу G (массив опорных и контрольных точек)
	var G = l3_points;
	
	step = canvasStep/(halfWidth*4); // Установка шага изменения t
	if (showInfoTable) {
		steps.html(""); //Очистка таблицы отладочной информации
		appendRow("th", 3, 't', 'x', 'y'); //Вывод отладочной информации
	}
	//Цикл расчет точек кривой
    for (var t = 0; t <= 1; t += step) {
		//Матрица T
        var T = [
            [t * t * t, t * t, t, 1]
        ];
		//Вычисление координат точки путем перемножения матриц T, M и G
        var result = multiplyMatrix(multiplyMatrix(T, M), G);
		var x = Math.round(result[0][0]);
		var y = Math.round(result[0][1]);
		//Добавление точки на холст
        if (!pointExists(x,y)) {
			addToMap(x, y);
			if (showInfoTable) appendRow("td", 3, Math.round(t*100)/100, x, y); //Вывод отладочной информации
		}
    }
	//Отрисовка всех точек холста
    drawAllPoints();
}

/*	Функция отрисовки кривой Безье
	@param isRandom - параметр, указывающий - отрисовка будет производиться по заданному или случайному набору точек
*/
function drawBezier(isRandom) {
	var showInfoTable=$('input[name="showInfo"]').prop('checked');
    if (isRandom) getRandomPoints(); // Отрисовка на холсте четырех точек со случайными координатами
    getPoints(); //Получение координат четырех точек с холста
	
	//Переменная, хранящая матрицу Безье M
	var M = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 3, 0, 0],
        [1, 0, 0, 0]
    ];

	step = canvasStep/(halfWidth*4); // Установка шага изменения t
	if (showInfoTable) {
		steps.html(""); //Очистка таблицы отладочной информации
		appendRow("th", 3, 't', 'x', 'y'); //Вывод отладочной информации
	}
	//Переменная, хранящая матрицу G (массив опорных и контрольных точек)
	var G = l3_points;
	//Расчет матрицы С = M*G
    var C = multiplyMatrix(M, G);
	//Цикл расчет точек кривой
    for (var t = 0; t <= 1; t += step) {
		//Матрица Т
        var T = [
            [t * t * t, t * t, t, 1]
        ];
		//Вычисление результата путем перемножения матриц Т и С
        var result = multiplyMatrix(T, C);
		var x = Math.round(result[0][0]);
		var y = Math.round(result[0][1]);
		//Добавление точки на холст
		if (!pointExists(x,y)) {
			addToMap(x, y);
			if (showInfoTable) appendRow("td", 3, Math.round(t*100)/100, x, y); //Вывод отладочной информации
		}
    }
	//Отрисовка всех точек холста
    drawAllPoints();
}

/*	Функция отрисовки кривой Эрмита
	@param isRandom - параметр, указывающий - отрисовка будет производиться по заданному или случайному набору точек
*/
function drawBSpline(isRandom) {
	var showInfoTable=$('input[name="showInfo"]').prop('checked');
    step = canvasStep/(halfWidth*4); // Установка шага изменения t
	//Матрица М
    var M = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 0, 3, 0],
        [1, 4, 1, 0]
    ];

    if (isRandom) getRandomPoints(); // Отрисовка на холсте четырех точек со случайными координатами
    getPoints(); //Получение координат четырех точек с холста
	
    var count = controlMap.length; //Переменная, хранящая количество контрольных точек установленных на холсте
	if (showInfoTable) {
		steps.html(""); //Очистка таблицы отладочной информации
		appendRow("th", 3, 't', 'x', 'y'); //Вывод отладочной информации
	}
	//Цикл построения кривой
    for (var i = 0; i < count - 3; i++) {
		//Получение координат четырех точек
        var px1 = controlMap[i].x,
                py1 = controlMap[i].y,
                px2 = controlMap[i + 1].x,
                py2 = controlMap[i + 1].y,
                px3 = controlMap[i + 2].x,
                py3 = controlMap[i + 2].y,
                px4 = controlMap[i + 3].x,
                py4 = controlMap[i + 3].y;
				
		//Переменная, хранящая матрицу G (массив контрольных точек)
        var G = [
            [px1, py1],
            [px2, py2],
            [px3, py3],
            [px4, py4]
        ];
		//Переменная, хранящая матрицу С как произведение матриц М и G
        var C = multiplyMatrix(M, G);

        for (var t = 0; t <= 1; t += step) {
			//Матрица Т
            var T = [
                [t * t * t, t * t, t, 1]
            ];
			//Расчет результата путем перемножения матриц Т, М и G
            var result = multiplyMatrix(T, C);
			var x = Math.round(result[0][0] / 6.);
			var y = Math.round(result[0][1] / 6.);
			//Добавление точки на холст
			if (!pointExists(x,y)) {
				addToMap(x, y);
				if (showInfoTable) appendRow("td", 3, Math.round(t*100)/100, x, y); //Вывод отладочной информации
			}
        }
    }
	//Отрисовка всех точек
    drawAllPoints();
}


