$(document).ready(function() {
    // var game = new game();
    // game.play();
});

function Game(playerName, otherPlayers) {
    var _Game
      , width = window.innerWidth
      , height = window.innerHeight
      , nextId = 0
      , canvasEl
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

    /** public members/methods */
    _Game = {
        "canvas": canvas,
        "width": width,
        "height": height,

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
                data.x = wormholes[data.from].x + 0.5*wormholes[data.from].size;
                data.y = wormholes[data.from].y + 0.5*wormholes[data.from].size;
                data.color = "#f00";
                data.ttl = 50;
                this.add(new Bullet(data, this));
            }
        },

        "removePlayer": function(player) {
            gameObjects = gameObjects.filter(function(obj) {
                return (obj.type !== "wormhole" && obj.name !== player);
            });
            delete wormholes[player];
        },

        "add": function(obj) {
            gameObjects.push(obj);
        },

        "remove": function(obj) {
            gameObjects.splice(gameObjects.indexOf(obj), 1);
            delete obj;
        },

    };

    player = new Ship({
        "name": playerName,
    }, _Game);
    _Game.add(player);

    otherPlayers.forEach(function(opponent) {
        var newWormhole = new Wormhole({
            "name": opponent,
            "x": Math.random() * (width - 50),
            "y": Math.random() * (height - 50),
        }, _Game);
        wormholes[newWormhole.name] = newWormhole;
        _Game.add(newWormhole);
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
        if (!keystatus.up) {
            keystatus.up = true;
            player.sprite.setMode("thrusting");
        }
        return false;
    });
    $(document).bind("keyup", "up", function() {
        player.sprite.setMode("default");
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
    $(document).bind("keyup", "q", function() {
        player.die();
    });

    function update() {
        if (player.alive) {
            if (keystatus.left) {
                player.turnLeft();
            }
            if (keystatus.right) {
                player.turnRight();
            }
            if (keystatus.up) {
                player.accelerate();
            }
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

    return _Game;
}

function Ship(I, game) {
    I = I || {};

    var drag = 0.99
      , driftAngle = I.angle || 0;

    var _Ship = {
        "type": "ship",
        "name": I.name || "",
        "x": I.x || game.width / 2,
        "y": I.y || game.height  / 2,
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
        "alive": true,
        "sprite": new Sprite({
            "default": [
                "/images/ship_default.png",
            ],
            "thrusting": [
                "/images/ship_fire1.png",
                "/images/ship_fire2.png",
                "/images/ship_fire3.png",
            ],
            "exploding": [
                "/images/ship_die1.png",
                "/images/ship_die2.png",
                "/images/ship_die3.png",
                "/images/ship_die4.png",
            ]
        }, 126, 50),

        "update": function() {
            if (this.health < 0) {
                this.die();
            }

            if (this.fuel < this.maxFuel) {
                this.fuel += this.recharge;
            }

            this.speed *= drag;
            this.x += this.speed*Math.cos(driftAngle);
            this.y += this.speed*Math.sin(driftAngle);

            this.x = ((this.x % game.width) + game.width) % game.width;
            this.y = ((this.y % game.height) + game.height) % game.height;
        },

        "draw": function() {
            canvas.save();
            canvas.translate(this.x, this.y);
            canvas.rotate(this.angle);

            this.sprite.draw(canvas);

            canvas.restore();
        },

        "collideWith": function(obj) {
            if (obj.type === "projectile" && obj.owner !== this.name) {
                this.health -= obj.damage;
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
                this.sprite.setMode("default");
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

            game.add(new Bullet({
                "x": frontX,
                "y": frontY,
                "angle": this.angle,
                "speed": this.speed + 2,
                "owner": this.name,
            }, game));
        },

        "die": function() {
            console.log("Player died.");
            this.alive = false;
            this.sprite.setMode("exploding");
            window.socket.quit();
            setTimeout(function() {
                game.remove(this);
            }, 2000);
        },

    };

    return _Ship;
}

function Bullet(I, game) {
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
                game.remove(this);
                return;
            }

            this.ttl -= 1;

            this.x += this.speed*Math.cos(this.angle);
            this.y += this.speed*Math.sin(this.angle);

            this.x = ((this.x % game.width) + game.width) % game.width;
            this.y = ((this.y % game.height) + game.height) % game.height;
        },

        "draw": function() {
            game.canvas.fillStyle = this.color;
            game.canvas.fillRect(this.x, this.y, this.size, this.size);
        },

        "collideWith": function(obj) {
            if (obj.type === "wormhole") {
                if (this.owner !== obj.name) {
                    obj.send(this);
                    game.remove(this);
                }
            }

            if (obj.type === "ship" && this.owner !== obj.name) {
                obj.health -= this.damage;
            }
        }
    };

    return _Bullet;
}

function Wormhole(I, game) {
    I = I || {};

    var _Wormhole = {
        "type": "wormhole",
        "name": I.name,
        "x": I.x || 0.5*game.width,
        "y": I.y || 0.5*game.height,
        "angle": 0,
        "size": I.size || 50,
        "sprite": I.sprite || new Sprite("/images/wormhole.png", 50, 50),

        "update": function() {
            this.angle -= 0.01;
        },

        "draw": function() {
            game.canvas.save();
            game.canvas.translate(this.x, this.y);
            game.canvas.rotate(this.angle);

            this.sprite.draw(canvas);

            game.canvas.restore();
        },

        "collideWith": function(obj) {
            if (obj.type === "projectile" && obj.owner !== this.name) {
                this.send(obj);
                game.remove(obj);
            }
        },

        "send": function(data) {
            window.socket.send(this.name, data);
        },
    };

    return _Wormhole;
}

function Sprite(modeUrls, width, height) {
    var _Sprite = {}
      , modes = {}
      , curMode = "default"
      , curImgIndex = 0
      , curImg
      , curFrame = 0;

    if (typeof modeUrls === "string") {
        modeUrls = {
            "default": [modeUrls],
        }
    }

    for (var mode in modeUrls) {
        modes[mode] = [];
        modeUrls[mode].forEach(function(url, i) {
            var image = new Image();
            image.onload = function() {
                modes[mode][i] = image;
            }
            image.src = url;

            modes[mode][i] = image;
        });
    }

    curImg = modes.default[0];

    _Sprite = {
        "framesPerImage": 3,
        "modes": modes,

        "draw": function(canvas) {
            canvas.save();
            canvas.translate(-0.5*width, -0.5*height);
            canvas.drawImage(this.getImage(), 0, 0);
            canvas.restore();
        },

        "getImage": function() {
            curFrame += 1;

            if (curFrame > this.framesPerImage) {
                curFrame = 0;
                curImgIndex = (curImgIndex + 1) % modes[curMode].length;
            }

            return modes[curMode][curImgIndex] || modes.default[0];
        },

        "setMode": function(newMode) {
            curMode = newMode;
            curImg = 0;
        },

    }

    return _Sprite;
}

