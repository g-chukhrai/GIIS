var ROTATE_X = 0;
var ROTATE_Y = 1;
var ROTATE_Z = 2;


function scale(pointMatrix, zoomX, zoomY, zoomZ) {
    if (arguments.length == 2) {
        zoomY = arguments[1];
        zoomZ = arguments[1];
    }
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
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 12]
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

