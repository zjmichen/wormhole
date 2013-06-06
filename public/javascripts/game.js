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
        "weapons": weapons,
        "won": false,
        "player": undefined,
        "frameRate": frameRate,

        "play": function() {
            var that = this;

            gameLoop = setInterval(function() {
                update();
                draw();
            }, 1000/frameRate);

            cometLoop = setInterval(function() {
                var x = width
                  , y = height;

                if (Math.random() > 0.5) {
                    x = Math.random()*width;
                } else {
                    y = Math.random()*height;
                }
                backgroundObjects.push(new Comet({
                    "x": x,
                    "y": y,
                }, that));
            }, 5000);

            itemLoop = setInterval(function() {
                var types = Object.keys(weapons)
                  , weapon = "none"
                  , x = -20
                  , y = -20
                  , angle = Math.random()*Math.PI
                  , weaponChoice = Math.random()
                  , threshhold = 0;

                for (var curWeapon in weapons) {
                    threshhold += weapons[curWeapon].rarity;
                    if (weaponChoice < threshhold) {
                        console.log("Chose " + curWeapon);
                        weapon = curWeapon;
                        break;
                    }
                }

                switch(Math.floor(Math.random()*4)) {
                    case 0:
                        x = Math.random()*width;
                        break;
                    case 1:
                        y = Math.random()*height;
                        angle -= 0.5*Math.PI;
                        break;
                    case 2:
                        x = Math.random() * width;
                        y = height + 20;
                        angle += Math.PI;
                        break;
                    case 3:
                        x = width + 20;
                        y = Math.random() * height;
                        angle += 0.5*Math.PI;
                        break;
                }

                gameObjects.push(new Item({
                    "subtype": "weapon",
                    "x": x,
                    "y": y,
                    "angle": angle,
                    "payload": weapon,
                    "scale": 0.5,
                }, that));
            }, 5000);

        },

        "pause": function() {

        },

        "stop": function() {
            clearInterval(gameLoop);
            clearInterval(cometLoop);
            clearInterval(itemLoop);
        },

        "receiveData": function(data) {
            if (data.from && data.type) {
                data.x = wormholes[data.from].x + 0.5*wormholes[data.from].size;
                data.y = wormholes[data.from].y + 0.5*wormholes[data.from].size;
                data.color = "#f00";
                data.ttl = undefined;
                if (data.sprite) {
                    data.sprite = new Sprite(data.sprite.modeUrls,
                                             data.sprite.width, data.sprite.height);
                }

                if (data.subtype in weapons) {
                    this.add(new weapons[data.subtype].item(data, this));
                } else if (data.subtype === "bullet") {
                    this.add(new Bullet(data, this));
                }
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

        "addToBackground": function(obj) {
            backgroundObjects.push(obj);
        },

        "removeFromBackground": function(obj) {
            backgroundObjects.splice(backgroundObjects.indexOf(obj), 1);
            delete obj;
        },

    };

    for (var i = 0; i < numStars; i++) {
        backgroundObjects.push(new Star(_Game));
    }

    player = new Ship({
        "name": playerName,
    }, _Game);
    _Game.player = player;
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
        keystatus.up = true;
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
    $(document).bind("keyup", "x", function() {
        player.shoot("missile");
        return false;
    });
    $(document).bind("keyup", "z", function() {
        player.shoot("nuke");
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
        drawInventory();

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

    function drawInventory() {
        player.weapons.forEach(function(weapon, i) {
            var x = i * 32 + 24;

            canvas.save();
            canvas.translate(x, height - 24);
            weapon.draw();
            canvas.restore();
        });
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
        "size": I.size || 32,
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
        "weapons": [],
        "maxWeapons": I.maxWeapons || 10,
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
                "/images/ship_explosion1.png",
                "/images/ship_explosion2.png",
            ],
        }, 150, 64),

        "update": function() {
            if (this.health <= 0) {
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

        "collideWith": function(obj, isReaction) {
            if (!isReaction) {
                obj.collideWith(this, true);
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

            if (this.weapons.length > 0) {
                weapon = this.weapons.pop().payload;

                if (weapon in game.weapons) {
                    game.add(new game.weapons[weapon].item(I, game));
                }
            } else {
                game.add(new Bullet(I, game));
            }

        },

        "pickUp": function(item) {

            if (item.subtype === "weapon" && 
                    this.weapons.length < this.maxWeapons) {
                item.x = 0;
                item.y = 0;
                item.scale = 1;
                this.weapons.push(item);
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

        "collideWith": function(obj, isReaction) {
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
        "payload": I.payload || 50,
        "owner": I.owner || "",
        "color": I.color || "#fff",
        "sprite": I.sprite || new Sprite("/images/bomb.png", 15, 15),

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
            game.canvas.save();
            game.canvas.translate(this.x, this.y);
            game.canvas.rotate(this.angle);

            this.sprite.draw(canvas);

            game.canvas.restore();
        },

        "collideWith": function(obj, isReaction) {
            if (!isReaction) {
                obj.collideWith(this, true);
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

function Missile(I, game) {
    var _Missile;

    _Missile = {
        "type": "projectile",
        "subtype": "missile",
        "x": I.x,
        "y": I.y,
        "speed": I.speed || 1,
        "angle": I.angle,
        "size": I.size || 5,
        "ttl": I.ttl || 150,
        "damage": I.damage || 0,
        "payload": I.payload || 10,
        "owner": I.owner || "",
        "color": I.color || "#fff",
        "sprite": I.sprite || new Sprite({
            "default": [
                "/images/missile1.png",
                "/images/missile2.png",
            ],
        }, 50, 13),

        "update": function() {
            if (this.ttl <= 0) {
                this.detonate();
                return;
            }

            this.ttl -= 1;

            // heat seeking
            if (this.owner !== game.player.name) {
                var playerAngle = Math.atan( (game.player.y - this.y) / 
                                             (game.player.x - this.x) );
                if (game.player.x - this.x < 0) {
                    playerAngle += Math.PI;
                }

                this.angle += 0.5*(playerAngle - this.angle);
            }

            this.x += this.speed*Math.cos(this.angle);
            this.y += this.speed*Math.sin(this.angle);

            this.x = ((this.x % game.width) + game.width) % game.width;
            this.y = ((this.y % game.height) + game.height) % game.height;
        },

        "draw": function() {
            game.canvas.save();
            game.canvas.translate(this.x, this.y);
            game.canvas.rotate(this.angle);

            this.sprite.draw(game.canvas);

            game.canvas.restore();
        },

        "collideWith": function(obj, isReaction) {
            if (obj.type === "ship" && this.owner !== obj.name) {
                this.detonate();
            }

            if (!isReaction) {
                obj.collideWith(this, true);
            }
        },

        "detonate": function() {
            game.add(new Explosion({
                "x": this.x + this.size*Math.cos(this.angle),
                "y": this.y + this.size*Math.sin(this.angle),
                "ttl": 50,
                "damage": this.payload,
                "owner": this.owner,
            }, game));

            game.remove(this);
        },


    };

    return _Missile;
}

function Nuke(I, game) {
    var _Nuke;

    _Nuke = {
        "type": "projectile",
        "subtype": "nuke",
        "x": I.x,
        "y": I.y,
        "speed": I.speed || 1,
        "angle": I.angle,
        "size": I.size || 5,
        "ttl": I.ttl || 150,
        "damage": I.damage || 20,
        "payload": I.payload || 100,
        "owner": I.owner || "",
        "color": I.color || "#fff",
        "sprite": I.sprite || new Sprite("/images/nuke.png", 50, 50),

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
            game.canvas.save();
            game.canvas.translate(this.x, this.y);
            game.canvas.rotate(this.angle);

            this.sprite.draw(game.canvas);

            game.canvas.restore();
        },

        "collideWith": function(obj, isReaction) {
            if (obj.type === "ship" && this.owner !== obj.name) {
                this.detonate();
            }

            if (!isReaction) {
                obj.collideWith(this, true);
            }
        },

        "detonate": function() {
            var x, y
              , theta, dist;
            for (var i = 0; i < this.payload; i++) {
                theta = Math.random()*Math.PI*2;
                dist = Math.random()*250;
                x = (this.x + dist*Math.cos(theta)) % game.width;
                y = (this.y + dist*Math.sin(theta)) % game.height;
                game.add(new Explosion({
                    "x": x,
                    "y": y,
                    "ttl": 100,
                    "damage": this.damage,
                    "owner": this.owner,
                }, game));
            }

            game.remove(this);
        },


    };

    return _Nuke;
}

function Mine(I, game) {
    var sprite = new Sprite({
        "default": [
            "/images/mine1.png",
            "/images/mine3.png",
        ],
        "active": [
            "/images/mine1.png",
            "/images/mine2.png",
        ],
    }, 50, 50);

    if (I.owner !== game.player.name) {
        sprite.mode = "active";
    }
    console.log("Owner: " + I.owner + ", player: " + game.player.name);

    var _Mine = {
        "type": "projectile",
        "subtype": "mine",
        "x": I.x,
        "y": I.y,
        "speed": I.speed || 1,
        "angle": I.angle,
        "size": I.size || 5,
        "ttl": I.ttl || 100000,
        "damage": I.damage || 20,
        "payload": I.payload || 20,
        "owner": I.owner || "",
        "color": I.color || "#fff",
        "sprite": sprite,

        "update": function() {
            if (this.ttl <= 0) {
                game.remove(this);
            }

            this.ttl -= 1;
            this.x += this.speed*Math.cos(this.angle);
            this.y += this.speed*Math.sin(this.angle);
            this.x = ((this.x % game.width) + game.width) % game.width;
            this.y = ((this.y % game.height) + game.height) % game.height;
        },

        "draw": function() {
            game.canvas.save();
            game.canvas.translate(this.x, this.y);

            this.sprite.draw(canvas);

            game.canvas.restore();
        },

        "collideWith": function(obj, isReaction) {
            if (obj.type === "ship" && obj.name !== this.owner) {
                this.detonate();
            }

            if (!isReaction) {
                obj.collideWith(this, true);
            }
        },

        "detonate": function() {
            game.add(new Explosion({
                "x": this.x + this.size*Math.cos(this.angle),
                "y": this.y + this.size*Math.sin(this.angle),
                "ttl": 50,
                "damage": this.payload,
                "owner": this.owner,
            }, game));

            game.remove(this);
        },

    };

    return _Mine;
}

function Explosion(I, game) {
    var _Explosion;

    _Explosion = {
        "type": "explosion",
        "x": I.x,
        "y": I.y,
        "ttl": I.ttl || 20,
        "damage": I.damage || 10,
        "owner": I.owner || "",
        "size": 25,
        "sprite": I.sprite || new Sprite({
            "default": [
                "/images/explosion1.png",
                "/images/explosion2.png",
            ],
        }, 50, 50),

        "update": function() {
            var that = this;
            this.ttl -= 1;
            if (this.ttl === 0) {
                this.sprite.scaleTo(0, 1000, function() {
                    game.remove(that);
                });
            }
        },

        "draw": function() {
            game.canvas.save();
            game.canvas.translate(this.x, this.y);

            this.sprite.draw(game.canvas);

            game.canvas.restore();
        },

        "collideWith": function(obj, isReaction) {
            if (this.owner !== obj.name && this.damage > 0 && obj.health > 0) {
                obj.health -= 1;
                this.damage -= 1;
            }

            if (!isReaction) {
                obj.collideWith(this, true);
            }
        },
    };

    return _Explosion;
}

function Arsenal() {
    var _Arsenal = {
        "canister": {
            "item": Canister,
            "rarity": 0.42,
        },
        "mine": {
            "item": Mine,
            "rarity": 0.42,
        },
        "missile": {
            "item": Missile,
            "rarity": 0.15,
        },
        "nuke": {
            "item": Nuke,
            "rarity": 0.01,
        },
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
        "size": I.size || 30,
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

        "collideWith": function(obj, isReaction) {
            var timeToCenter
              , distToCenter
              , framesToCenter
              , that = this;
            if (obj.type === "projectile" && obj.owner !== this.name) {
                if (obj.sprite && !obj.sprite.scaling) {
                    distToCenter = Math.sqrt(Math.pow(this.x - obj.x, 2) +
                                             Math.pow(this.y - obj.y, 2));
                    framesToCenter = (1/obj.speed)*distToCenter;
                    timeToCenter = framesToCenter*game.frameRate;

                    obj.sprite.scaleTo(0, timeToCenter, function() {
                        that.send(obj);
                        game.remove(obj);
                    });
                } else if (!obj.sprite) {
                    this.send(obj);
                    game.remove(obj);
                }
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
        "modeUrls": modeUrls,
        "framesPerImage": 3,
        "modes": modes,
        "mode": "default",
        "scale": 1.0,
        "targetScale": 1.0,
        "scaleChange": 0,
        "scaling": false,

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
                this.scale += this.scaleChange;
                this.width = this.scale * width;
                this.height = this.scale * height;
            } else {
                this.scaling = false;
            }
            if ((this.scaleChange > 0 && this.scale >= this.targetScale) ||
                (this.scaleChange < 0 && this.scale <= this.targetScale)) {

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
            if (this.scaling) {
                return;
            }

            this.scaling = true;
            time = time || 1000;
            var frames = 0.03*time
              , direction = (newScale > this.scale) ? 1 : -1;
            this.scaleChange = direction*(Math.abs(this.scale - newScale) / frames);
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

function Comet(I, game) {
    var _Comet = {
        "x": I.x || game.width,
        "y": I.y || game.height,
        "angle": I.angle || (Math.random()*0.5 + 1)*Math.PI,
        "speed": I.speed || Math.floor(Math.random()*5) + 5,
        "animationStep": 0,
        "sprite": new Sprite({
            "default": [
                "/images/missile1.png",
                "/images/missile2.png",
            ],
        }, 50, 13),

        "update": function() {
            this.x += this.speed*Math.cos(this.angle);
            this.y += this.speed*Math.sin(this.angle);

            if (this.x < 0 || this.y < 0) {
                game.removeFromBackground(this);
            }
        },

        "draw": function() {
            game.canvas.save();
            game.canvas.translate(this.x, this.y);
            game.canvas.rotate(this.angle);

            var tailEnd = this.animationStep === 0 ? -30 : -28;
            this.animationStep = (this.animationStep + 1) % 3;

            game.canvas.beginPath();
            game.canvas.strokeStyle = "#111";
            game.canvas.moveTo(0, 1);
            game.canvas.lineTo(tailEnd, 2);
            game.canvas.moveTo(0, 2);
            game.canvas.lineTo(tailEnd, 2);
            game.canvas.strokeStyle = "#333";
            game.canvas.moveTo(0, 1.5);
            game.canvas.lineTo(-20, 2);
            game.canvas.stroke();

            game.canvas.fillStyle = "#777";
            game.canvas.fillRect(0, 0, 3, 3);

            game.canvas.restore();
        },
    };

    return _Comet;
}

function Item(I, game) {
    var spriteUrl = "/images/item_none.png";
    if (!I.sprite && I.payload) {
        spriteUrl = "/images/item_" + I.payload + ".png";
    }

    var _Item = {
        "type": "item",
        "subtype": I.subtype || "nothing",
        "x": I.x || 0,
        "y": I.y || 0,
        "angle": I.angle || Math.random()*Math.PI*0.5,
        "speed": I.speed || 2,
        "scale": I.scale || 1,
        "ttl": I.ttl || 1000,
        "size": 12,
        "payload": I.payload,
        "sprite": I.sprite || new Sprite(spriteUrl, 48, 48),

        "update": function() {
            if (this.ttl <= 0) {
                game.remove(this);
                return;
            }

            this.ttl -= 1;
            this.x += this.speed*Math.cos(this.angle);
            this.y += this.speed*Math.sin(this.angle);
        },

        "draw": function() {
            game.canvas.save();
            game.canvas.translate(this.x, this.y);
            game.canvas.scale(this.scale, this.scale);

            this.sprite.draw(canvas);

            game.canvas.restore();
        },

        "collideWith": function(obj, isReaction) {
            if (obj.type === "ship") {
                obj.pickUp(this);
                game.remove(this);
            }

            if (!isReaction) {
                obj.collideWith(this, true);
            }
        },
    };

    return _Item;
}