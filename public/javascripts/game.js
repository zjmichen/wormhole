$(document).ready(function() {
    // var game = new Game();
    // game.play();
});

function Game(otherPlayers, socket) {
    socket.send(otherPlayers[0], {
        "asdf": "fdsa"
    });
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

    otherPlayers.forEach(function(opponent) {
        gameObjects.push(new Wormhole({
            "name": opponent,
            "x": Math.random() * width,
            "y": Math.random() * height,
        }));
    });

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

        gameObjects.forEach(function(obj, i, objs) {
            obj.update();

            for (var j = i + 1; j < objs.length; j++) {
                if (collides(objs[i], objs[j])) {
                    objs[i].collideWith(objs[j]);
                }
            }
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
        canvas.fillStyle = "#000";
        canvas.fillText("Fuel", width - 35, height - 5);
    }

    function collides(a, b) {
        return (Math.abs(a.x - b.x) < 0.5*a.width + 0.5*b.width &&
                Math.abs(a.y - b.y) < 0.5*a.height + 0.5*b.height);
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
            "type": "ship",
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

            "collideWith": function(obj) {
                if (obj.type !== "projectile") {
                    console.log("Collision with " + obj.type);
                }
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
            "type": "projectile",
            "x": I.x,
            "y": I.y,
            "width": 2,
            "height": 2,
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

            "collideWith": function(obj) {
                console.log("Bullet collided with " + obj.type);
                if (obj.type === "wormhole") {
                    obj.send(this);
                    gameObjects.splice(gameObjects.indexOf(this), 1);
                    delete this;
                }
            }
        };

        return _Bullet;
    }

    function Wormhole(I) {
        I = I || {};

        var _Wormhole = {
            "type": "wormhole",
            "name": I.name,
            "x": I.x || 0.5*width,
            "y": I.y || 0.5*height,
            "width": 50,
            "height": 50,
            "size": I.size || 50,

            "update": function() {

            },

            "draw": function() {
                canvas.fillStyle = "#f00";
                //canvas.arc(this.x, this.y, this.size, 0, 2*Math.PI, false);
                canvas.fillRect(this.x, this.y, this.size, this.size);
            },

            "collideWith": function(obj) {
                if (obj.type !== "wormhole") {
                    console.log("Wormhole " + this.name + "collided with " + obj.type);
                    if (obj.type === "projectile") {
                        this.send(obj);
                        gameObjects.splice(gameObjects.indexOf(obj), 1);
                        delete obj;
                    }
                }
            },

            "send": function(data) {
                socket.send(this.name, data);
            },
        };

        return _Wormhole;
    }

    return _Game;
}

