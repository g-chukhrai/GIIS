function addToMap(x, y) {
    map.push({'x' : x, 'y' : y, 'z' : 1});
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

