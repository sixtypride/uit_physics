/**
 * Created by sixtypride on 2016. 2. 17..
 */
function windowToCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {x: x - bbox.left, y: y - bbox.top}
}
// Point
function Point(x, y) {
    this.x = x;
    this.y = y;
}
// Vector2d
function Vector2d(vx, vy) {
    this.vx = vx;
    this.vy = vy;
}

Vector2d.prototype = {
    add : function (vec) {
        return new Vector2d(this.vx + vec.vx, this.vy + vec.vy);
    },
    sub : function (vec) {
        return new Vector2d(this.vx - vec.vx, this.vy - vec.vy);
    },
    dot : function (vec) {
        return this.vx * vec.vx + this.vy * vec.vy;
    },
    scale : function (scale) {
        return new Vector2d(this.vx * scale, this.vy * scale);
    },
    length : function () {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    },
    normalize : function () {
        var len = this.length();
        return new Vector2d(this.vx / len, this.vy / len);
    },
    normal : function () {
        return new Vector2d(-this.vy, this.vx);
    }
};
// Matrix
function Matrix(a, b, c, d, tx, ty) {
    this.list = [ [a,c,tx],
                  [b,d,ty],
                  [0,0,1] ];

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
}
Matrix.prototype = {
    concat : function(matrix) {
        var temp = [ [ 0,0,0 ],
            [ 0,0,0 ],
            [ 0,0,0 ] ];

        for( var i = 0; i < 3; i++) {
            for(var j = 0; j < 3; j++) {
                for(var k = 0; k < 3; k++) {
                    temp[i][j] += (matrix.list[i][k] * this.list[k][j]);
                }
            }
        }

        return new Matrix(temp[0][0], temp[1][0], temp[0][1], temp[1][1], temp[0][2], temp[1][2]);
    }
}

// Ball
function Ball() {
    this.radius = 10;
    this.x = 0;
    this.y = 0;
    this.vec = new Vector2d(0,0);
    this.color = "black";
}
Ball.prototype = {
    draw : function () {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }
};

function Box(x, y, width, height, anchorX, anchorY, cw) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.anchorX = width * anchorX;
    this.anchorY = height * anchorY;

    this.points = [];

    this.lt = new Point(x, y);
    this.points.push(this.lt);

    this.rt = new Point(x + width, y);
    this.points.push(this.rt);

    this.lb = new Point(x, y + height);
    this.points.push(this.lb);

    this.rb = new Point(x + width, y + height);
    this.points.push(this.rb);

    if(cw)
    {
        this.lines = [new Line(this.lt, this.rt),
            new Line(this.rt, this.rb),
            new Line(this.rb, this.lb),
            new Line(this.lb, this.lt)];
    }
    else
    {
        this.lines = [new Line(this.rt, this.lt),
            new Line(this.rb, this.rt),
            new Line(this.lb, this.rb),
            new Line(this.lt, this.lb)];
    }


}

Box.prototype = {
    draw: function () {
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].draw();
        }
    },

    translate: function (dx, dy) {

        var mat = new Matrix(1,0,0,1,dx, dy);
        this.transformMatrix(mat);
    },

    scale: function (sx, sy) {

        var offsetX = this.lt.x + this.anchorX;
        var offsetY = this.lt.y + this.anchorY;

        var a = new Matrix(1,0,0,1,-offsetX,-offsetY);
        var b = new Matrix(sx,0,0,sy,0,0);
        var c = new Matrix(1,0,0,1,offsetX,offsetY);

        this.transformMatrix(a.concat(b).concat(c));
    },

    rotate: function (radian) {

        var offsetX = this.x + this.anchorX;
        var offsetY = this.y + this.anchorY;

        var cos = Math.cos(radian);
        var sin = Math.sin(radian);

        var a = new Matrix(1,0,0,1,-offsetX,-offsetY);
        var b = new Matrix(cos,sin,-sin,cos,0,0);
        var c = new Matrix(1,0,0,1,offsetX,offsetY);

        this.transformMatrix(a.concat(b).concat(c));

    },

    transform: function (a, b, c, d, e, f) {
        for (var i = 0; i < this.points.length; i++) {
            var x = this.points[i].x;
            var y = this.points[i].y;

            this.points[i].x = a * x + c * y + e;
            this.points[i].y = b * x + d * y + f;
        }
    },

    transformMatrix: function (matrix) {
        for (var i = 0; i < this.points.length; i++) {
            var x = this.points[i].x;
            var y = this.points[i].y;

            this.points[i].x = matrix.a * x + matrix.c * y + matrix.tx;
            this.points[i].y = matrix.b * x + matrix.d * y + matrix.ty;
        }
    }
}

function Line(sPt, ePt) {
    this.sPt = sPt;
    this.ePt = ePt;
}

Line.prototype = {
    draw: function () {
        context.save();

        context.beginPath();
        context.moveTo(this.sPt.x, this.sPt.y);
        context.lineTo(this.ePt.x, this.ePt.y);
        context.stroke();

        context.restore();
    }
}
