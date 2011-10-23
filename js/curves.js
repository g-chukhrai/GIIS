//Функция отрисовки круга
function drawCircle() {
    var x = 0; //x-координата точки
    /*
	y-координата точки
	parseInt() - функция получения значения параметра в поле ввода
	*/
    var y = parseInt($("#radius").val());
    var lim = 0; //предел отрисовки первого октанта
    var D; //переменная, хранящая значение ошибки на шаге i
    var D_next = 2 - 2 * y; //переменная, хранящая значение ошибки на шаге i+1
    var iteration_step = 0; //номер итерации
    var pixel_type; //переменная, хранящая строковое значение типа пикселя (h/v/d)
    map = []; //очистка контейнера, содержащего точки холста
    addToMap(x, y); //добавление на холст начальной точки
    //Вывод промежуточной информации
    appendRow("th", 9, 'i', '&#916;i', '&#948;', '&#948;*', 'Pixel', 'x', 'y', '&#916;i+1', 'Point(x,y)');
    appendRow("td", 9, 0, '&#160;', '&#160;', '&#160;', '&#160;', x, y, '&#160;', x+','+y);
    //Цикл отрисовки окружности
    while (y > lim) {
        D = D_next;
        iteration_step++;
        var d='-'; //расстояние до пикселя (случай А)
        var d2='-'; //расстояние до пикселя (случай Б)
        //Условие определяющее положение пикселя
        if (D < 0) {
            //Ошибка < 0, случай А (выбор между горизонтальным и диагональным пикселем)
            d = 2 * D + 2 * y - 1; //вычисление значения тета
            if (d <= 0) {
                //Тета < 0, выбор горизонтального пикселя
                pixel_type = "H";
                x++;
                D_next = D+2 * x + 1;
            } else {
                //Тета > 0, выбор диагонального пикселя
                pixel_type = "D";	
                x++;
                y--;
                D_next = D+2 * x - 2 * y + 2; //вычисление значения ошибки
            }
        } 
        //Ошибка > 0, случай Б (выбор между вертикальным и диагональным пикселем)
        else if (D > 0) {
            d2 = 2 * D - 2 * x - 1; //вычисление значения тета
            //Тета > 0, выбор вертикального пикселя
            if (d2 > 0) {
                pixel_type = "V";
                y--;
                D_next = D+1 - 2 * y; //вычисление значения ошибки
            } else {
                //Тета < 0, выбор диагонального пикселя
                pixel_type = "D";
                x++;
                y--;
                D_next= D+2 * x - 2 * y + 2; //вычисление значения ошибки
            }
        } 
        //Ошибка = 0, случай В
        else if (D == 0) {
            //Выбор диагонального пикселя
            pixel_type = "D";
            x++;
            y--;
            D_next= D+2 * x - 2 * y + 2; //вычисление значения ошибки
        }
        //Добавление на холст точки
        addToMap(x, y);
        //Вывод отладочной информации
        appendRow("td", 9, iteration_step, D, d, d2, pixel_type, x, y, D_next, x+','+y);
    }
    //Отражение изображения
    $.each(map, function() {
        var x = this.x, y = this.y;
        addToMap(-x, y);
        addToMap(-x, -y);
        addToMap(x, -y);
    });
    //Отрисовка всех точек
    drawAllPoints();
}
//Функция отрисовки круга со случайными значениями параметров
function drawCircleRandom() {
    //Задание случайных параметров
    var limit = (halfWidth / canvasStep) - 10;
    var radius = Math.floor(Math.random() * limit);
    $("#radius").val(radius);
    //Очистка холста
    clearCanvas();
    //Отрисовка круга
    drawCircle();
}

//Функция отрисовки параболы
function drawParabola() {
    var x1 = 0;
    var y1 = 0;
    //х - х-координата точки
    var x = 0;
    //y - y-координата точки
    var y = 0;
    //Коэффициент параболы
    var p = parseInt($("#koef").val());
    //Переменная, хранящая границы холста
    var lim = (p != 0) ? -Math.abs(x1 + halfWidth / canvasStep) : 0;
    //Первоначальное значение ошибки на шаге i+1
    var D_next = 1 - 2*p;
    //Переменная, хранящая значение ошибки
    var D;
    //Номер итерации
    var iteration_step = 0;
    map = []; //очистка контейнера, содержащего точки холста
    //Отрисовка начальной точки
    drawPoint(x1, y1);
    var pixel_type; //переменная, хранящая строковое значение типа пикселя (h/v/d)
    //Вывод промежуточной информации
    appendRow("th", 8, 'i', '&#916;i', '&#948;', 'Pixel', 'x', 'y', '&#916;i+1', 'Point(x,y)');
    appendRow("td", 8, 0, '&#160;', '&#160;', '&#160;',  x1, y1, '&#160;', x+','+y);
    //Цикл прорисовки параболы
    while (x >= lim) {
        iteration_step++; 
        D = D_next;
        //Отрисовка точки
        var dx =  x1 + p >= 0 ? x : -x;
        drawPoint(y + y1, dx);
        drawPoint(-y + y1, dx);
        //Переменная, хранящая значение тета
        var d;
        //Условие определяющее положение пикселя (горизонтальное\вертикальное\диагональное)
        if (D_next > 0) {
            //Ошибка > 0, случай А (выбор между горизонтальным и диагональным пикселем)
            d = (2 * (D - 2 * p + y)) +  1; //вычисление значения тета
            if (d > 0) {
                //Тета > 0, выбор горизонтального пикселя
                pixel_type = "H";
                x--;
                D_next -= (2 * p);
            } else {
                //Тета < 0, выбор диагонального пикселя
                pixel_type = "D";
                x--;
                y++;
                D_next += (2 * y - 2 * p + 1);
            }
        } 
        //Ошибка < 0, случай Б (выбор между вертикальным и диагональным пикселем)
        else if (D_next < 0) {
            d = 2 * (D + 2 * y + 1 - p);
            if (d < 0) {
                //Тета < 0, выбор вертикального пикселя
                pixel_type = "V";
                y++;
                D_next += 2 * y + 1;
            } else {
                //Тета > 0, выбор диагонального пикселя
                pixel_type = "D";
                x--;
                y++;
                D_next += (2 * y - 2 * p + 1);
            }
        } 
        //Ошибка = 0, случай В
        else {
            //Выбор диагонального пикселя
            pixel_type = "D";
            x--;
            y++;
            D_next += (2 * y - 2 * p + 1);
        }
        //Вывод отладочной информации
        appendRow("td", 8, iteration_step, D, d, pixel_type, y + y1, dx, D_next, y + y1+','+dx);
    }
}

//Функция задания случайных параметров для отрисовки параболы
function drawParabolaRandom() {
    var limit = (halfWidth / canvasStep) - 10;
    var koef = Math.floor(Math.random() * limit) + 1;
    $("#koef").val(koef);
    clearCanvas(); // Очистка холста
    drawParabola(); //Отрисовка параболы
}

//Функция отрисовки эллипса
function drawEllipse() {
    var x, y, a, b;
    //Получение значений параметров эллипса из полей ввода
    a =  parseInt($("#a").val());
    b = parseInt($("#b").val());
    x = 0;
    y = b;
    var D_next = b*b-a*a*(2*b-1); // Вычисление значения ошибки
    var lim = 0;
    var D = 0;
    var iteration_step = 0; //шаг итерации
    var pixel_type; //тип пикселя
    map = []; //очистка контейнера элементов холста
    //Добавление на холст начальной точки
    addToMap(x, y);
    //Вывод таблицы отладочной информации
    appendRow("th", 9, 'i', '&#916;i', '&#948;', '&#948;*', 'Pixel', 'x', 'y', '&#916;i+1', 'Point(x,y)');
    appendRow("td", 9, 0, '&#160;', '&#160;', '&#160;', '&#160;', x, y, '&#160;', x+','+y);
    //Цикл отрисовки эллипса
    while (y > lim) {
        D = D_next;
        iteration_step++;
        var d='-'; //тета
        var d2='-'; //тета*
        //Ошибка < 0, случай А (выбор между горизонтальным и диагональным пикселем)
        if (D < 0) {
            d = 2*D+a*a*(2*y-1);
            if (d <= 0) {
                //Тета < 0, выбор горизонтального пикселя
                pixel_type = "H";
                x++;
                D_next = D + b*b*(2 * x + 1); //вычисление значения ошибки
            } else {
                //Тета > 0, выбор диагонального пикселя
                pixel_type = "D";	
                x++;
                y--;
                D_next =  D+b*b*(2*x+1)+a*a*(1-2*y); //вычисление значения ошибки
            }
        } 
        //Ошибка > 0, случай Б (выбор между вертикальным и диагональным пикселем)
        else if (D > 0) {
            d2 = 2*(D-b*b*x)-1;
            if (d2 > 0) {
                //Тета > 0, выбор вертикального пикселя
                pixel_type = "V";
                y--;
                D_next = D+a*a*(1 - 2 * y); //вычисление значения ошибки
            } else {
                //Тета < 0, выбор диагонального пикселя
                pixel_type = "D";
                x++;
                y--;
                D_next= D+b*b*(2*x+1)+a*a*(1-2*y); //вычисление значения ошибки
            }
        } 
        //Ошибка = 0, случай В (отрисовка диагонального пикселя)
        else if (D == 0) {
            pixel_type = "D";
            x++;
            y--;
            D_next = D+b*b*(2*x+1)+a*a*(1-2*y); //вычисление значения ошибки
        }
        //Добавление точки на холст
        addToMap(x, y);
        //Вывод промежуточной информации
        appendRow("td", 9, iteration_step, D, d, d2, pixel_type, x, y, D_next, x+','+y);
    }
    //Отражение изображения
    $.each(map, function() {
        var x = this.x, y = this.y;
        addToMap(-x, y);
        addToMap(-x, -y);
        addToMap(x, -y);
    });
    //Отрисовка всех точек
    drawAllPoints();
}

//Функция отрисовки эллипса со случайными параметрами
function drawEllipseRandom() {
    //Задание параметров случайными значениями
    var limit = (halfWidth / canvasStep) - 10;
    var a = Math.floor(Math.random() * limit)+1;
    var b = Math.floor(Math.random() * limit)+1;
    $("#a").val(a);
    $("#b").val(b);
    //Очистка холста
    clearCanvas();
    //Отрисока эллипса
    drawEllipse();
}