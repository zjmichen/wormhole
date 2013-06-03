$(document).ready(function() {
    // var game = new game();
    // game.play();
});

function Game(playerName, otherPlayers) {
    var width = 480
      , height = 320
      , canvasEl
      , canvas
      , ctx
      , frameRate = 30
      , gameLoop
      , gameObjects = []
      , player
      , keystatus = {}
      , wormholes = {};

    canvasEl = $("canvas#wormhole");
    canvasEl.attr("width", width);
    canvasEl.attr("height", height);
    canvas = canvasEl.get(0).getContext("2d");

    player = new Ship({
        "name": playerName,
    });
    gameObjects.push(player);

    otherPlayers.forEach(function(opponent) {
        var newWormhole = new Wormhole({
            "name": opponent,
            "x": Math.random() * (width - 50),
            "y": Math.random() * (height - 50),
        });
        console.log("Wormhole positioned at (" + newWormhole.x + 
                ", " + newWormhole.y + ")");
        wormholes[newWormhole.name] = newWormhole;
        gameObjects.push(newWormhole);
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
        canvas.fillStyle = "#000";
        canvas.fillRect(0, 0, width, height);

        gameObjects.forEach(function(obj) {
            obj.draw();
        });

        drawFuel();
        drawHealth();
    }

    function drawFuel() {
        var fuelLevel = height * (player.fuel / player.maxFuel);
        canvas.fillStyle = "#0f0";
        canvas.fillRect(width - 10, height - fuelLevel, 5, fuelLevel);
        canvas.fillStyle = "#0f0";
        canvas.fillText("Fuel", width - 35, height - 15);
    }

    function drawHealth() {
        var healthLevel = height * (player.health / player.maxHealth);
        canvas.fillStyle = "#f00";
        canvas.fillRect(width - 5, height - healthLevel, 5, healthLevel);
        canvas.fillStyle = "#f00";
        canvas.fillText("Health", width - 47, height - 3);
    }

    function collides(a, b) {
        return (Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) 
                < a.size + b.size);
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

        "receiveData": function(data) {
            if (data.from && data.type) {
                console.log("Got something");

                data.x = wormholes[data.from].x + 0.5*wormholes[data.from].size;
                data.y = wormholes[data.from].y + 0.5*wormholes[data.from].size;
                data.color = "#f00";
                data.ttl = 50;
                gameObjects.push(new Bullet(data));
            }
        },

        "removePlayer": function(player) {
            gameObjects = gameObjects.filter(function(obj) {
                return (obj.type !== "wormhole" && obj.name !== player);
            });
            delete wormholes[player];
        },

    };

    /** internal objects:
     *  - Ship
     *  - Bullet
     *  - Wormhole
     */
    function Ship(I) {
        I = I || {};

        var drag = 0.99
          , driftAngle = I.angle || 0;

        var sprite = new Image();
        sprite.onload = function() {
            _Ship.sprite = sprite;
        };
        sprite.src = I.sprite || "/images/ship1.png";

        var _Ship = {
            "type": "ship",
            "name": I.name || "",
            "x": I.x || width / 2,
            "y": I.y || height  / 2,
            "size": I.size || 25,
            "angle": driftAngle,
            "color": I.color || "#00f",
            "speed": I.speed || 0,
            "thrust": I.thrust || 0.3,
            "maxFuel": I.maxFuel || 10,
            "fuel": I.fuel || 10,
            "recharge": I.recharge || 0.1,
            "maxHealth": I.maxHealth || 100,
            "health": I.health || 100,

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
                canvas.translate(-this.size, -this.size);

                canvas.drawImage(this.sprite, 0, 0);

                canvas.restore();
            },

            "collideWith": function(obj) {
                if (obj.type === "projectile" && obj.owner !== this.name) {
                    this.health -= obj.damage;
                    console.log("Ouch! " + this.health);
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
                var frontX = this.x + this.size*Math.cos(this.angle)
                  , frontY = this.y + this.size*Math.sin(this.angle);

                gameObjects.push(new Bullet({
                    "x": frontX,
                    "y": frontY,
                    "angle": this.angle,
                    "speed": this.speed + 2,
                    "owner": this.name,
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
            "speed": I.speed || 1,
            "angle": I.angle,
            "size": I.size || 2,
            "ttl": I.ttl || 70,
            "damage": I.damage || 1,
            "owner": I.owner || "",
            "color": I.color || "#fff",

            "update": function() {
                if (this.ttl <= 0) {
                    gameObjects.splice(gameObjects.indexOf(this), 1);
                    delete this;
                    return;
                }

                this.ttl -= 1;

                this.x += this.speed*Math.cos(this.angle);
                this.y += this.speed*Math.sin(this.angle);

                this.x = ((this.x % width) + width) % width;
                this.y = ((this.y % height) + height) % height;
            },

            "draw": function() {
                canvas.fillStyle = this.color;
                //canvas.arc(this.x, this.y, this.size, 0, 2*Math.PI, false);
                canvas.fillRect(this.x, this.y, this.size, this.size);
            },

            "collideWith": function(obj) {
                if (obj.type === "wormhole") {
                    if (this.owner !== obj.name) {
                        obj.send(this);
                        gameObjects.splice(gameObjects.indexOf(this), 1);
                        delete this;
                    }
                }

                if (obj.type === "ship" && this.owner !== obj.name) {
                    obj.health -= this.damage;
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
            "angle": 0,
            "size": I.size || 50,
            "sprite": I.sprite || new Sprite("/images/wormhole.png"),

            "update": function() {
                this.angle -= 0.01;
            },

            "draw": function() {
                canvas.save();
                canvas.translate(this.x, this.y);
                canvas.rotate(this.angle);
                canvas.translate(-0.5*this.size, -0.5*this.size);

                canvas.drawImage(this.sprite.getImage(), 0, 0);

                canvas.restore();
            },

            "collideWith": function(obj) {
                if (obj.type === "projectile" && obj.owner !== this.name) {
                    this.send(obj);
                    gameObjects.splice(gameObjects.indexOf(obj), 1);
                    delete obj;
                }
            },

            "send": function(data) {
                window.socket.send(this.name, data);
            },
        };

        return _Wormhole;
    }

    function Sprite(urls) {
        var _Sprite = {}
          , imgs = []
          , curImg = 0
          , firstImg = 0
          , imgRange = 1;

        if (!Array.isArray(urls)) {
            urls = [urls];
        }

        urls.forEach(function(url, i) {
            var image = new Image();
            image.onload = function() {
                imgs[i] = image;
                console.log(imgs);
            }
            image.src = url;
        });

        console.log(imgs);

        _Sprite = {

            "getImage": function() {
                var img = imgs[curImg];
                curImg += 1;
                if (curImg >= firstImg + imgRange) {
                    curImg = firstImg;
                }

                return img;
            },

            "setToDefault": function() {
                curImg = 0;
            },

            "setToRange": function(low, high) {
                if (high <= low) {
                    console.error("Sprite: bad range set");
                    return;
                }

                firstImg = low;
                imgRange = high - low;
                curImg = firstImg;
            },

        }

        return _Sprite;
    }

    return _Game;
}

