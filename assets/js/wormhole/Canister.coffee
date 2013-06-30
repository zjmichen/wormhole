#= require Weapon
#= require Bullet

class window.Canister extends Weapon
    constructor: (I, game) ->
        @type = "projectile"
        @subtype = "canister"
        @x = I.x
        @y = I.y
        @speed = I.speed ? 1
        @angle = I.angle
        @size = I.size ? 10
        @ttl = I.ttl ? 70
        @damage = I.damage ? 0
        @payload = I.payload ? 50
        @owner = I.owner ? ""
        @color = I.color ? "#fff"
        @sprite = I.sprite ? new Sprite "/images/bomb.png", 15, 15

    detonate: ->
        i = 0
        while i++ < @payload
            game.add new Bullet
                "x": @x,
                "y": @y,
                "ttl": 50,
                "speed": @speed + Math.random() * 4 - 2,
                "angle": Math.random() * Math.PI * 2,
                "owner": @owner,
                "color": @color,
            , game

        game.remove this
