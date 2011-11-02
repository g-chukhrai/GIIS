var vertices = [];

var Delaunay = Delaunay || {};

function reDraw(vertices) {
    clearContext();
    var delaunay = Delaunay.Triangulate(vertices);

    var L = delaunay.length;
    for (var i = 0; i < L; i++) {
        var t = delaunay[ i ];
        context.beginPath();
        context.moveTo(t.p1.x, t.p1.y);
        context.lineTo(t.p2.x, t.p2.y);
        context.lineTo(t.p3.x, t.p3.y);
        context.lineTo(t.p1.x, t.p1.y);
        context.stroke();
    }
}


function triangulationOn() {
    canvasStep = 1;
    clearContext();
    setMode(MODE.TRIANGULATION);
 }

Delaunay.Triangulate = function (vertices) {

    var i;
    var j;
    var nv = vertices.length;

    if (nv < 3) return [];

    var trimax = 4 * nv;

    // Find the maximum and minimum vertex bounds.
    // This is to allow calculation of the bounding supertriangle

    var xmin = vertices[0].x;
    var ymin = vertices[0].y;
    var xmax = xmin;
    var ymax = ymin;

    for (i = 1; i < nv; i++) {
        vertices[i].id = i;
        if (vertices[i].x < xmin) xmin = vertices[i].x;
        if (vertices[i].x > xmax) xmax = vertices[i].x;
        if (vertices[i].y < ymin) ymin = vertices[i].y;
        if (vertices[i].y > ymax) ymax = vertices[i].y;
    }

    var dx = xmax - xmin;
    var dy = ymax - ymin;
    var dmax = (dx > dy) ? dx : dy;
    var xmid = (xmax + xmin) * 0.5;
    var ymid = (ymax + ymin) * 0.5;

    // Set up the supertriangle
    // This is a triangle which encompasses all the sample points.
    // The supertriangle coordinates are added to the end of the
    // vertex list. The supertriangle is the first triangle in
    // the triangle list.

    vertices.push(new Delaunay.Point((xmid - 2 * dmax), (ymid - dmax), nv + 1));
    vertices.push(new Delaunay.Point(xmid, (ymid + 2 * dmax), nv + 2));
    vertices.push(new Delaunay.Point((xmid + 2 * dmax), (ymid - dmax), nv + 3));

    var triangles = []; //array type de triangles

    vertices[ nv ].id = nv;
    vertices[ nv + 1 ].id = nv + 1;
    vertices[ nv + 2 ].id = nv + 2;

    triangles.push(new Delaunay.Triangle(vertices[ nv ], vertices[ nv + 1 ], vertices[ nv + 2 ])); //SuperTriangle placed at index 0


    // Include each point one at a time into the existing mesh
    for (i = 0; i < nv; i++) {

        var Edges = []; // [trimax * 3];

        // Set up the edge buffer.
        // If the point (Vertex(i).x,Vertex(i).y) lies inside the circumcircle then the
        // three edges of that triangle are added to the edge buffer and the triangle is removed from list.
        for (j = 0; j < triangles.length; j++) {

            if (Delaunay.InCircle(vertices[ i ], triangles[ j ].p1, triangles[ j ].p2, triangles[ j ].p3)) {

                Edges.push(new Delaunay.Edge(triangles[j].p1, triangles[j].p2));
                Edges.push(new Delaunay.Edge(triangles[j].p2, triangles[j].p3));
                Edges.push(new Delaunay.Edge(triangles[j].p3, triangles[j].p1));

                triangles.splice(j, 1);

                j--;

            }

        }

        if (i >= nv) continue; //In case we the last duplicate point we removed was the last in the array


        // Remove duplicate edges
        // Note: if all triangles are specified anticlockwise then all
        // interior edges are opposite pointing in direction.

        for (j = Edges.length - 2; j >= 0; j--) {

            for (var k = Edges.length - 1; k >= j + 1; k--) {

                if (Edges[ j ].equals(Edges[ k ])) {

                    Edges.splice(k, 1);
                    Edges.splice(j, 1);
                    k--;
                    continue;

                }

            }

        }

        // Form new triangles for the current point
        // Skipping over any tagged edges.
        // All edges are arranged in clockwise order.
        for (j = 0; j < Edges.length; j++) {

            if (triangles.length >= trimax) {
                //	throw new ApplicationException("Exceeded maximum edges");
                DEBUG.warning("Exceeded maximum edges");
            }
            triangles.push(new Delaunay.Triangle(Edges[ j ].p1, Edges[ j ].p2, vertices[ i ]));

        }

        Edges = [];

    }


    // Remove triangles with supertriangle vertices
    // These are triangles which have a vertex number greater than nv


    for (i = triangles.length - 1; i >= 0; i--) {
        if (triangles[ i ].p1.id >= nv || triangles[ i ].p2.id >= nv || triangles[ i ].p3.id >= nv) {
            triangles.splice(i, 1);

        }
    }


    //Remove SuperTriangle vertices
    vertices.splice(vertices.length - 1, 1);
    vertices.splice(vertices.length - 1, 1);
    vertices.splice(vertices.length - 1, 1);


    return triangles.concat();

}


//INCIRCLE
Delaunay.InCircle = function (p, p1, p2, p3) {

    //Return TRUE if the point (xp,yp) lies inside the circumcircle
    //made up by points (x1,y1) (x2,y2) (x3,y3)
    //NOTE: A point on the edge is inside the circumcircle

    var Epsilon = Number.MIN_VALUE;

    if (Math.abs(p1.y - p2.y) < Epsilon && Math.abs(p2.y - p3.y) < Epsilon) {
        //INCIRCUM - F - Points are coincident !!
        return false;
    }


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
        //Calculate CircumCircle center (xc,yc)
        xc = (p2.x + p1.x) * 0.5;
        yc = m2 * (xc - mx2) + my2;
    }
    else if (Math.abs(p3.y - p2.y) < Epsilon) {
        m1 = -(p2.x - p1.x) / (p2.y - p1.y);
        mx1 = (p1.x + p2.x) * 0.5;
        my1 = (p1.y + p2.y) * 0.5;
        //Calculate CircumCircle center (xc,yc)
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
        //Calculate CircumCircle center (xc,yc)
        xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
        yc = m1 * (xc - mx1) + my1;
    }

    var dx = p2.x - xc;
    var dy = p2.y - yc;
    var rsqr = dx * dx + dy * dy;
    //double r = Math.Sqrt(rsqr); //Circumcircle radius
    dx = p.x - xc;
    dy = p.y - yc;
    var drsqr = dx * dx + dy * dy;

    return ( drsqr <= rsqr );


}


//TRIANGLE
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


Delaunay.Triangle.prototype.getCenter = function () {
    if (this.center == null) center = new Delaunay.Point(0, 0);
    center.x = ( this.p1.x + this.p2.x + this.p3.x ) / 3;
    center.y = ( this.p1.y + this.p2.y + this.p3.y ) / 3;
    return center;

}


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

//POINT
Delaunay.Point = function (px, py) {
    var that = this;
    var ox = px;
    var yx = yx;

    this.id;
    this.x = px;
    this.y = py;
}


Delaunay.Point.prototype.distance = function (otherpoint) {
    return  Math.sqrt(((otherpoint.x - this.x) * (otherpoint.x - this.x)) + ((otherpoint.y - this.y) * (otherpoint.y - this.y)));
}

Delaunay.Point.prototype.equals2d = function (otherpoint) {
    return ( this.x == otherpoint.x && this.y == otherpoint.y );

}

//EDGE
Delaunay.Edge = function (point1, point2) {
    var that = this;

    this.p1 = point1;
    this.p2 = point2;
}

Delaunay.Edge.prototype.equals = function (otherEdge) {
    return ((this.p1 == otherEdge.p2) && (this.p2 == otherEdge.p1)) || ((this.p1 == otherEdge.p1) && (this.p2 == otherEdge.p2));
}
