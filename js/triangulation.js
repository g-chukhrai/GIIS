var vertices = []; //Массив вершин триангуляции

var Delaunay = Delaunay || {}; //Создание объекта, реализующего операцию триангуляции

//Функция нахождения и отрисовки всех треугольников триангуляции
function reDraw(vertices) {
    clearContext(); //Очистка холста
	context.strokeStyle = LINE_COLOR; //Установка цвета линии
    var delaunay = Delaunay.Triangulate(vertices); //Получения списка треугольников триангуляции
    var L = delaunay.length; //Длина списка треугольников триангуляции
    for (var i = 0; i < L; i++) {
        var t = delaunay[ i ]; //Треугольник t рассматриваемый на итерации i
		//Отрисовка треугольника
        context.beginPath();
        context.moveTo(t.p1.x, t.p1.y);
        context.lineTo(t.p2.x, t.p2.y);
        context.lineTo(t.p3.x, t.p3.y);
        context.lineTo(t.p1.x, t.p1.y);
        context.stroke();
    }
}

//Функция, заполняющая массив вершин триангуляции случайными точками, количеством от 6 до 12
function triangulationTest() {
	clearVertices();
	var randomCount = Math.rand(6, 12);
	console.log(randomCount);
	for (var i = 0; i < randomCount; i++) {
        vertices.push(new Delaunay.Point(Math.rand(-halfHeight, halfHeight), Math.rand(-halfHeight, halfHeight)));
    }
	triangulationOn()
}

//Функция очистки массива вершин триангуляции
function clearVertices() {
	vertices = [];
}

//Функция запуска процесса триангуляции и отрисовки результата
function triangulationOn() {
    canvasStep = 1;
    clearContext();
    setMode(MODE.TRIANGULATION);
	/*
	//Занесение в массив вершин триангуляции четырех крайних точек холста
	vertices.push(new Delaunay.Point(-halfWidth, halfHeight));
	vertices.push(new Delaunay.Point(halfWidth, halfHeight));
	vertices.push(new Delaunay.Point(halfWidth, -halfHeight));
	vertices.push(new Delaunay.Point(-halfWidth, -halfHeight));
	*/
    reDraw(vertices);
 }

 /* Функция, выполняющая триангуляцию
 На вход подается массив вершин.
 Возвращает список треугольников.
 */
Delaunay.Triangulate = function (vertices) {
    var nv = vertices.length; //Длина массива вершин триангуляции
	//Если длина массива меньше трех, то выход из функции
    if (nv < 3) return [];

    var trimax = 4 * nv;

    // Поиск вершин с максимальными и минимальными координатами (необходимо для построения "супертреугольника")
    var xmin = vertices[0].x;
    var ymin = vertices[0].y;
    var xmax = xmin;
    var ymax = ymin;

    for (var i = 1; i < nv; i++) {
        vertices[i].id = i;
        if (vertices[i].x < xmin) xmin = vertices[i].x;
        if (vertices[i].x > xmax) xmax = vertices[i].x;
        if (vertices[i].y < ymin) ymin = vertices[i].y;
        if (vertices[i].y > ymax) ymax = vertices[i].y;
    }
	//Нахождение расстояния между вершинами с макс. и мин. координатами по осям ОХ и ОУ
    var dx = xmax - xmin;
    var dy = ymax - ymin;
	//Выбор наибольшего расстояния 
    var dmax = (dx > dy) ? dx : dy;
    var xmid = (xmax + xmin) * 0.5;
    var ymid = (ymax + ymin) * 0.5;

	//Определение и добавление вершин "супертреугольника" в список вершин
    vertices.push(new Delaunay.Point((xmid - 2 * dmax), (ymid - dmax), nv + 1));
    vertices.push(new Delaunay.Point(xmid, (ymid + 2 * dmax), nv + 2));
    vertices.push(new Delaunay.Point((xmid + 2 * dmax), (ymid - dmax), nv + 3));

    var triangles = []; //Инициализация списка треугольников.
	//Установка переменных идентификаторов
    vertices[ nv ].id = nv;
    vertices[ nv + 1 ].id = nv + 1;
    vertices[ nv + 2 ].id = nv + 2;
	//Добавление супертреугольника в список треугольников под индексом 0
    triangles.push(new Delaunay.Triangle(vertices[ nv ], vertices[ nv + 1 ], vertices[ nv + 2 ])); 

    //Добавление каждой точки из списка вершин триангуляции в существующую триангуляцию
    for (var i = 0; i < nv; i++) {
        var Edges = []; //Инициализация буфера ребер

		//Просмотр всех треугольников
        for (var j = 0; j < triangles.length; j++) {
			// Если рассматриваемая точка лежит на окружности треугольника, то
			// добавить три ребра треугольника в буфер ребер и удалить рассматриваемый треугольник из списка треугольников
            if (Delaunay.InCircle(vertices[ i ], triangles[ j ].p1, triangles[ j ].p2, triangles[ j ].p3)) {
                Edges.push(new Delaunay.Edge(triangles[j].p1, triangles[j].p2));
                Edges.push(new Delaunay.Edge(triangles[j].p2, triangles[j].p3));
                Edges.push(new Delaunay.Edge(triangles[j].p3, triangles[j].p1));

                triangles.splice(j, 1);
                j--;
            }
        }
        if (i >= nv) continue; 

		//Удаление дубликатов ребер из буфера ребер
        for (var j = Edges.length - 2; j >= 0; j--) {

            for (var k = Edges.length - 1; k >= j + 1; k--) {

                if (Edges[ j ].equals(Edges[ k ])) {

                    Edges.splice(k, 1);
                    Edges.splice(j, 1);
                    k--;
                    continue;
                }
            }
        }

		//Добавление в список треугольников всех треугольников,
		//образованные рассматриваемой точкой и краями охватывающего полигона
        for (var j = 0; j < Edges.length; j++) {

            if (triangles.length >= trimax) {
                console.log("Exceeded maximum edges");
            }
            triangles.push(new Delaunay.Triangle(Edges[j].p1, Edges[j].p2, vertices[i]));
        }
        Edges = []; //Очистка буфера ребер
    }

    // Удаление треугольников, построенных на вершинах "супертреугольника"
    for (var i = triangles.length - 1; i >= 0; i--) {
        if (triangles[ i ].p1.id >= nv || triangles[ i ].p2.id >= nv || triangles[ i ].p3.id >= nv) {
            triangles.splice(i, 1);
        }
    }
    //Удаление вершин "супертреугольника"
    vertices.splice(vertices.length - 1, 1);
    vertices.splice(vertices.length - 1, 1);
    vertices.splice(vertices.length - 1, 1);
    return triangles.concat();
}


//Функция, определяющая находится ли точка p в окружности построенной на точках p1, p2, p3
Delaunay.InCircle = function (p, p1, p2, p3) {

    var Epsilon = Number.MIN_VALUE; //Переменная, хранящая наименьшее положительное значение переменной
	//Если точки совпадают - выход из функции
    if (Math.abs(p1.y - p2.y) < Epsilon && Math.abs(p2.y - p3.y) < Epsilon) {
        return false;
    }
	//Декларация промежуточных переменных
    var m1;
    var m2;
    var mx1;
    var mx2;
    var my1;
    var my2;
    var xc;
    var yc;

    if (Math.abs(p2.y - p1.y) < Epsilon) {
        m2 = -(p3.x - p2.x) / (p3.y - p2.y);
        mx2 = (p2.x + p3.x) * 0.5;
        my2 = (p2.y + p3.y) * 0.5;
        //Вычисление центра окружности (xc, yc)
        xc = (p2.x + p1.x) * 0.5;
        yc = m2 * (xc - mx2) + my2;
    }
    else if (Math.abs(p3.y - p2.y) < Epsilon) {
        m1 = -(p2.x - p1.x) / (p2.y - p1.y);
        mx1 = (p1.x + p2.x) * 0.5;
        my1 = (p1.y + p2.y) * 0.5;
        //Вычисление центра окружности (xc, yc)
        xc = (p3.x + p2.x) * 0.5;
        yc = m1 * (xc - mx1) + my1;
    }
    else {
        m1 = -(p2.x - p1.x) / (p2.y - p1.y);
        m2 = -(p3.x - p2.x) / (p3.y - p2.y);
        mx1 = (p1.x + p2.x) * 0.5;
        mx2 = (p2.x + p3.x) * 0.5;
        my1 = (p1.y + p2.y) * 0.5;
        my2 = (p2.y + p3.y) * 0.5;
        //Вычисление центра окружности (xc, yc)
        xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
        yc = m1 * (xc - mx1) + my1;
    }

    var dx = p2.x - xc;
    var dy = p2.y - yc;
    var rsqr = dx * dx + dy * dy; //радиус окружности в квадрате
    dx = p.x - xc; //Расстояние от рассматриваемой точки до центра окружности по оси Х
    dy = p.y - yc; //Расстояние от рассматриваемой точки до центра окружности по оси Y
    var drsqr = dx * dx + dy * dy;

    return ( drsqr <= rsqr );


}


//Функция, инициализирующая объект типа "треугольник"
Delaunay.Triangle = function (point1, point2, point3) {
    var that = this;

    this.p1 = point1;
    this.p2 = point2;
    this.p3 = point3;

    this.center;

    this.mid0; //p0 > p1
    this.mid1; //p1 > p2
    this.mid2; //p2 > p0
}

//Функция определения центра треугольника
Delaunay.Triangle.prototype.getCenter = function () {
    if (this.center == null) center = new Delaunay.Point(0, 0);
    center.x = ( this.p1.x + this.p2.x + this.p3.x ) / 3;
    center.y = ( this.p1.y + this.p2.y + this.p3.y ) / 3;
    return center;

}

//Функция определения центров ребер треугольника
Delaunay.Triangle.prototype.getSidesCenters = function () {
    if (this.mid0 == null || this.mid1 == null || this.mid2 == null) {
        mid0 = new Delaunay.Point(0, 0);
        mid1 = new Delaunay.Point(0, 0);
        mid2 = new Delaunay.Point(0, 0);
    }

    this.mid0.x = this.p1.x + ( this.p2.x - this.p1.x ) / 2;
    this.mid0.y = this.p1.y + ( this.p2.y - this.p1.y ) / 2;

    this.mid1.x = this.p2.x + ( this.p3.x - this.p2.x ) / 2;
    this.mid1.y = this.p2.y + ( this.p3.y - this.p2.y ) / 2;

    this.mid2.x = this.p3.x + ( this.p1.x - this.p3.x ) / 2;
    this.mid2.y = this.p3.y + ( this.p1.y - this.p3.y ) / 2;
}

//Функция, инициализирующая объект типа "точка"
Delaunay.Point = function (px, py) {
    var that = this;
    var ox = px;
    var yx = yx;

    this.id;
    this.x = px;
    this.y = py;
}

//Функция, возвращающая расстояние от рассматриваемой точки до otherpoint
Delaunay.Point.prototype.distance = function (otherpoint) {
    return  Math.sqrt(((otherpoint.x - this.x) * (otherpoint.x - this.x)) + ((otherpoint.y - this.y) * (otherpoint.y - this.y)));
}

//Функция проверки эквивалентности рассматриваемой точки и otherpoint
Delaunay.Point.prototype.equals2d = function (otherpoint) {
    return ( this.x == otherpoint.x && this.y == otherpoint.y );

}

//Функция, инициализирующая объект типа "ребро"
Delaunay.Edge = function (point1, point2) {
    var that = this;

    this.p1 = point1;
    this.p2 = point2;
}

//Функция проверки эквивалентности двух ребер
Delaunay.Edge.prototype.equals = function (otherEdge) {
    return ((this.p1 == otherEdge.p2) && (this.p2 == otherEdge.p1)) || ((this.p1 == otherEdge.p1) && (this.p2 == otherEdge.p2));
}
