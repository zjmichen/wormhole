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
      , gameObjects = []
      , player
      , keystatus = {};

    canvasEl = $("canvas#wormhole");
    canvasEl.attr("width", width);
    canvasEl.attr("height", height);
    canvas = canvasEl.get(0).getContext("2d");

    player = new Ship();
    gameObjects.push(player);

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
    $(document).bind("keydown", "space", function() {
        player.shoot();
        return false;
    });

    function update() {
        if (keystatus.left) {
            player.turnLeft();
        }
        if (keystatus.right) {
            player.turnRight();
        }
        if (keystatus.up) {
            player.accelerate();
        }

        gameObjects.forEach(function(obj) {
            obj.update();
        });
    }

    function draw() {
        canvas.clearRect(0, 0, width, height);

        gameObjects.forEach(function(obj) {
            obj.draw();
        });

        var fuelLevel = height * (player.fuel / player.maxFuel);
        canvas.fillStyle = "#0f0";
        canvas.fillRect(width - 10, height - fuelLevel, 10, fuelLevel);
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
          , driftAngle = I.angle || 0;

        var _Ship = {
            "x": I.x || width / 2,
            "y": I.y || height  / 2,
            "width": I.width || 50,
            "height": I.height || 50,
            "angle": driftAngle,
            "color": I.color || "#00f",
            "speed": I.speed || 0,
            "thrust": I.thrust || 0.3,
            "maxFuel": I.maxFuel || 10,
            "fuel": I.fuel || 10,
            "recharge": I.recharge || 0.1,

            "update": function() {
                if (this.fuel < this.maxFuel) {
                    this.fuel += this.recharge;
                }

                this.speed *= drag;
                this.x += this.speed*Math.cos(driftAngle);
                this.y += this.speed*Math.sin(driftAngle);

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
                canvas.fillStyle = "#000";
                canvas.fillRect(0, 0, 0.1*this.width, 0.1*this.height);

                canvas.restore();
            },

            "turnLeft": function() {
                this.angle -= 0.1;
            },

            "turnRight": function() {
                this.angle += 0.1;
            },

            "accelerate": function() {
                this.fuel -= this.thrust;

                if (this.fuel <= 0) {
                    this.fuel = 0;
                    return;
                }

                var driftX = this.speed*Math.cos(driftAngle)
                  , driftY = this.speed*Math.sin(driftAngle)
                  , thrustX = this.thrust*Math.cos(this.angle)
                  , thrustY = this.thrust*Math.sin(this.angle);

                driftX += thrustX;
                driftY += thrustY;

                this.speed = Math.sqrt(Math.pow(driftX, 2) + Math.pow(driftY, 2));

                driftAngle = Math.acos(driftX / this.speed);
                if (Math.asin(driftY / this.speed) < 0) {
                    driftAngle *= -1;
                }
            },

            "shoot": function() {
                console.log("Shooting!!!");

                var frontX = this.x + 0.5*this.width*Math.cos(this.angle)
                  , frontY = this.y + 0.5*this.height*Math.sin(this.angle);

                gameObjects.push(new Bullet({
                    "x": frontX,
                    "y": frontY,
                    "angle": this.angle,
                    "speed": this.speed + 2,
                }));
            },

        };

        return _Ship;
    }

    function Bullet(I) {
        I = I || {};

        var _Bullet = {
            "x": I.x,
            "y": I.y,
            "speed": I.speed || 1,
            "angle": I.angle,
            "size": I.size || 2,
            "ttl": I.ttl || 70,

            "update": function() {
                if (this.ttl <= 0) {
                    gameObjects.splice(gameObjects.indexOf(this), 1);
                    delete this;
                    return;
                }

                this.ttl -= 1;

                this.x += this.speed*Math.cos(this.angle);
                this.y += this.speed*Math.sin(this.angle);
            },

            "draw": function() {
                canvas.fillStyle = "#000";
                //canvas.arc(this.x, this.y, this.size, 0, 2*Math.PI, false);
                canvas.fillRect(this.x, this.y, this.size, this.size);
            },
        };

        return _Bullet;
    }

    return _Game;
}

