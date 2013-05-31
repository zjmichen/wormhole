$(document).ready(function() {
    var game = new Game();
    game.play();
});

function Game() {
    var width = 480
      , height = 320
      , canvasEl
      , canvas
      , ctx
      , frameRate = 30
      , gameLoop
      , ships = []
      , keystatus = {};

    canvasEl = $("canvas#wormhole");
    canvasEl.attr("width", width);
    canvasEl.attr("height", height);
    canvas = canvasEl.get(0).getContext("2d");

    ships.push(new Ship());
    ships.push(new Ship({
        "color": "red",
        "x": 50,
        "y": 40,
        "angle": 3,
    }));

    $(document).bind("keydown", "left", function() {
        keystatus.left = true;
    });
    $(document).bind("keyup", "left", function() {
        keystatus.left = false;
    });
    $(document).bind("keydown", "right", function() {
        keystatus.right = true;
    });
    $(document).bind("keyup", "right", function() {
        keystatus.right = false;
    });
    $(document).bind("keydown", "up", function() {
        keystatus.up = true;
        return false;
    });
    $(document).bind("keyup", "up", function() {
        keystatus.up = false;
    });
    $(document).bind("keydown", "down", function() {
        keystatus.down = true;
        return false;
    });
    $(document).bind("keyup", "down", function() {
        keystatus.down = false;
    });

    function update() {
        if (keystatus.left) {
            ships[0].turnLeft();
        }
        if (keystatus.right) {
            ships[0].turnRight();
        }
        if (keystatus.up) {
            ships[0].accelerate();
        }

        ships.forEach(function(ship) {
            ship.update();
        });
    }

    function draw() {
        canvas.clearRect(0, 0, width, height);

        ships.forEach(function(ship) {
            ship.draw();
        });
    }

    /** public members/methods */
    var _Game = {

        "play": function() {
            gameLoop = setInterval(function() {
                update();
                draw();
            }, 1000/frameRate);
        },

        "pause": function() {

        },

        "stop": function() {
            clearInterval(gameLoop);
        },

    };

    /** internal objects */
    function Ship(I) {
        I = I || {};

        var drag = 0.99
          , maxSpeed = 10;

        var _Ship = {
            "x": I.x || width / 2,
            "y": I.y || height  / 2,
            "width": I.width || 50,
            "height": I.height || 50,
            "angle": I.angle || 2,
            "color": I.color || "#00f",
            "speed": I.speed || 0,
            "thrust": I.thrust || 0.3,

            "update": function() {
                this.speed *= drag;
                this.x += this.speed*Math.cos(this.angle);
                this.y += this.speed*Math.sin(this.angle);

                this.x = ((this.x % width) + width) % width;
                this.y = ((this.y % height) + height) % height;
            },

            "draw": function() {
                canvas.save();
                canvas.translate(this.x, this.y);
                canvas.rotate(this.angle);
                canvas.translate(-0.5*this.width, -0.5*this.height);

                canvas.fillStyle = this.color;
                canvas.fillRect(0, 0, this.width, this.height);

                canvas.restore();
            },

            "turnLeft": function() {
                this.angle -= 0.1;
            },

            "turnRight": function() {
                this.angle += 0.1;
            },

            "accelerate": function() {
                this.speed += this.thrust;
                if (this.speed > maxSpeed) {
                    this.speed = maxSpeed;
                }
            },

        };

        return _Ship;
    }

    return _Game;
}

