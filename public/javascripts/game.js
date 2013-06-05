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
      , backgroundObjects = []
      , numStars = Math.floor(0.0001*width*height)
      , player
      , keystatus = {}
      , wormholes = {}
      , numWormholes = 0
      , weapons = new Arsenal();

    canvasEl = $("canvas#wormhole");
    canvasEl.attr("width", width);
    canvasEl.attr("height", height);
    canvas = canvasEl.get(0).getContext("2d");

    /** public members/methods */
    _Game = {
        "canvas": canvas,
        "width": width,
        "height": height,
        "won": false,

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
                data.ttl = 70;

                if (data.subtype in weapons) {
                    this.add(new weapons[data.subtype](data, this));
                }
                // if (data.subtype === "bullet") {
                //     this.add(new Bullet(data, this));
                // } else if (data.subtype === "canister") {
                //     this.add(new Canister(data, this));
                // }
            }
        },

        "removePlayer": function(player) {
            var that = this;
            wormholes[player].sprite.scaleTo(0, 1000, function() {
                that.remove(wormholes[player]);
                numWormholes -= 1;

                if (numWormholes <= 0) {
                    that.won = true;
                }
            });
        },

        "add": function(obj) {
            gameObjects.push(obj);
        },

        "remove": function(obj) {
            gameObjects.splice(gameObjects.indexOf(obj), 1);
            delete obj;
        },

    };

    for (var i = 0; i < numStars; i++) {
        backgroundObjects.push(new Star(_Game));
    }

    player = new Ship({
        "name": playerName,
    }, _Game);
    _Game.add(player);

    otherPlayers.forEach(function(opponent) {
        var newWormhole = new Wormhole({
            "name": opponent,
            "x": Math.random() * (width - 100) + 50,
            "y": Math.random() * (height - 50) + 50,
        }, _Game);
        wormholes[newWormhole.name] = newWormhole;
        numWormholes += 1;

        _Game.add(newWormhole);
    });

    $(document).bind("keydown", "left", function() {
        keystatus.left = true;
        return false;
    });
    $(document).bind("keyup", "left", function() {
        keystatus.left = false;
        return false;
    });
    $(document).bind("keydown", "right", function() {
        keystatus.right = true;
        return false;
    });
    $(document).bind("keyup", "right", function() {
        keystatus.right = false;
        return false;
    });
    $(document).bind("keydown", "up", function() {
        if (!keystatus.up) {
            keystatus.up = true;
        }
        return false;
    });
    $(document).bind("keyup", "up", function() {
        keystatus.up = false;
        return false;
    });
    $(document).bind("keydown", "down", function() {
        keystatus.down = true;
        return false;
    });
    $(document).bind("keyup", "down", function() {
        keystatus.down = false;
        return false;
    });
    $(document).bind("keydown", "space", function() {
        player.shoot();
        return false;
    });
    $(document).bind("keyup", "q", function() {
        player.die();
        return false;
    });
    $(document).bind("keyup", "c", function() {
        player.shoot("canister");
        return false;
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
                if (player.sprite.mode !== "thrusting") {
                    player.sprite.setMode("thrusting");
                }
                player.accelerate();
            } else {
                if (player.sprite.mode === "thrusting") {
                    player.sprite.setMode("default");
                }
            }
        }

        backgroundObjects.forEach(function(obj, i, objs) {
            obj.update();
        });

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

        backgroundObjects.forEach(function(obj) {
            obj.draw();
        });

        gameObjects.forEach(function(obj) {
            obj.draw();
        });

        drawFuel();
        drawHealth();

        if (_Game.won) {
            canvas.fillStyle = "#fff";
            canvas.font = "bold 72px sans-serif";
            canvas.textAlign = "center";
            canvas.shadowColor = "#000";
            canvas.shadowBlur = 4;
            canvas.fillText("You won!", 0.5*width, 0.5*height);
            canvas.font = "bold 12px sans-serif";
            canvas.fillText("But your friends are still dead.", 0.5*width, 0.5*height + 30);

            canvas.font = "normal 10px sans-serif";
            canvas.textAlign = "start";
        }
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
        "maxFuel": I.maxFuel || 20,
        "fuel": I.fuel || 20,
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
                game.remove(obj);
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

        "shoot": function(weapon) {
            var I = {
                "x": this.x + this.size*Math.cos(this.angle),
                "y": this.y + this.size*Math.sin(this.angle),
                "angle": this.angle,
                "speed": this.speed + 2,
                "owner": this.name,
            };

            weapon = weapon || "bullet";

            if (weapon in game.weapons) {
                game.add(new game.weapons[weapon](I, game));
            }
        },

        "die": function() {
            var that = this;
            this.alive = false;
            this.sprite.setMode("exploding");
            window.socket.quit();

            setTimeout(function() {
                that.sprite.scaleTo(0, 500, function() {
                    game.remove(that);
                });
            }, 500);
        },

    };

    return _Ship;
}

function Bullet(I, game) {
    I = I || {};

    var _Bullet = {
        "type": "projectile",
        "subtype": "bullet",
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
                game.remove(this);
            }
        }
    };

    return _Bullet;
}

function Canister(I, game) {
   var _Canister;

   I = I || {};
   
   _Canister = {
        "type": "projectile",
        "subtype": "canister",
        "x": I.x,
        "y": I.y,
        "speed": I.speed || 1,
        "angle": I.angle,
        "size": I.size || 10,
        "ttl": I.ttl || 70,
        "damage": I.damage || 0,
        "payload": I.payload || 10,
        "owner": I.owner || "",
        "color": I.color || "#fff",

        "update": function() {
            if (this.ttl <= 0) {
                this.detonate();
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
        },

        "detonate": function() {
            for (var i = 0; i < this.payload; i++) {
                game.add(new Bullet({
                    "x": this.x,
                    "y": this.y,
                    "ttl": 50,
                    "speed": this.speed + Math.random() * 4 - 2,
                    "angle": Math.random() * Math.PI * 2,
                    "owner": this.owner,
                    "color": this.color,
                }, game));
            }

            game.remove(this);
        },

   };

   return _Canister; 
}

function Arsenal() {
    var _Arsenal = {
        "bullet": Bullet,
        "canister": Canister,
    };

    return _Arsenal;
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
        "width": width,
        "height": height,
        "framesPerImage": 3,
        "modes": modes,
        "mode": "default",
        "scale": 1.0,
        "targetScale": 1.0,
        "scaleChange": 0,

        "draw": function(canvas) {
            canvas.save();
            canvas.translate(-0.5*this.width, -0.5*this.height);
            canvas.scale(this.scale, this.scale);
            canvas.drawImage(this.getImage(), 0, 0);
            canvas.restore();
        },

        "getImage": function() {
            curFrame += 1;

            if (this.scaleChange != 0) {
                console.log(this.scale + " (" + this.scaleChange + ")");
                this.scale += this.scaleChange;
                this.width = this.scale * width;
                this.height = this.scale * height;
            }
            if ((this.scaleChange > 0 && this.scale >= this.targetScale) ||
                (this.scaleChange < 0 && this.scale <= this.targetScale)) {

                console.log("Scale reached.");
                this.scale = this.targetScale;
                this.scaleChange = 0;
            }

            if (curFrame > this.framesPerImage) {
                curFrame = 0;
                curImgIndex = (curImgIndex + 1) % modes[this.mode].length;
            }

            return modes[this.mode][curImgIndex] || modes.default[0];
        },

        "scaleTo": function(newScale, time, callback) {
            console.log("Scaling to " + newScale);
            time = time || 1000;
            var frames = 0.03*time
              , direction = (newScale > this.scale) ? 1 : -1;
            console.log("in " + frames + " frames");
            this.scaleChange = direction*(Math.abs(this.scale - newScale) / frames);
            console.log("adjusting scale by " + this.scaleChange + " each frame");
            this.targetScale = newScale;

            if (callback) {
                setTimeout(callback, time);
            }
        },

        "setMode": function(newMode) {
            this.mode = newMode;
            curImg = 0;
        },

    }

    return _Sprite;
}

function Star(game) {
    var chars = "123456789abcdef"
      , value = chars[Math.floor(Math.random()*chars.length)];
    var distance = Math.floor(Math.random() * 255);

    var _Star = {
        "color": "rgb(" + distance + "," + distance + "," + distance + ")",
        "x": Math.floor(Math.random()*game.width),
        "y": Math.floor(Math.random()*game.height),

        "update": function() {
            this.x -= distance / 1000;
            if (this.x < 0) {
                this.x = game.width;
            }

            this.y -= distance / 1500;
            if (this.y < 0) {
                this.y = game.height;
            }
        },

        "draw": function() {
            game.canvas.fillStyle = this.color;
            game.canvas.fillRect(this.x, this.y, 2, 2);
        },
    };

    return _Star;
}