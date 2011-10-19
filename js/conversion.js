var ROTATE_X = 0;
var ROTATE_Y = 1;
var ROTATE_Z = 2;

function scale(pointMatrix, zoomX, zoomY, zoomZ) {
    var transform = [
        [zoomX, 0, 0, 0],
        [0, zoomY, 0, 0],
        [0, 0, zoomZ, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

function translate(pointMatrix, x, y, z) {
    var transform = [
        [x, y, z, 0]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

function rotate(pointMatrix, angle, direction) {
    var transform;
    if (direction == ROTATE_X) {
        transform = [
            [1, 0, 0, 0],
            [0, Math.cos(angle), Math.sin(angle), 0],
            [0, -Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    } else if (direction == ROTATE_Y) {
        transform = [
            [Math.cos(angle), 0, -Math.sin(angle), 0],
            [0, 1, 0, 0],
            [Math.sin(angle), 0, Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    } else if (direction == ROTATE_Z) {
        transform = [
            [Math.cos(angle), Math.sin(angle), 0, 0],
            [-Math.sin(angle), Math.cos(angle), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }
    return multiplyMatrix(pointMatrix, transform);
}

function projection(pointMatrix, d) {
    var transform = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 1 / d],
        [0, 0, 0, 0]
    ];
    return multiplyMatrix(pointMatrix, transform);
}
