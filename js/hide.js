var VIEW_VECTOR = [
    [0],
    [0],
    [1000],
    [0]
];

function checkSide(a, b, c, vector) {
    var normal = getNormal(a, b, c);
    console.log("normal : " + normal + " vector :" + vector);
    return multiplyMatrix(normal, vector)[0][0] > 0;
}

function getNormal(p1, p2, p3) {
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
    normal[3] = (normal[0] * x1 + normal[1] * y1 + normal[2] * z1);
    return [normal];
}

function isPlaneVisible(plane) {
    //TODO:delete when working
//    return true;
    if (plane && plane.length >= 3) {
        var result = checkSide(vertexes[plane[0]], vertexes[plane[1]], vertexes[plane[2]], VIEW_VECTOR);
        console.log("plane : " + plane + " res :" + result);
        return result;
    }
}