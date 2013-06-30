#= require Weapon
#= require Explosion

class Nuke extends Weapon
    constructor: (I, game) ->
        @type = "projectile"
        @subtype = "nuke"
        @x = I.x
        @y = I.y
        @speed = I.speed ? 1
        @angle = I.angle
        @size = I.size ? 5
        @ttl = I.ttl ? 150
        @damage = I.damage ? 20
        @payload = I.payload ? 100
        @blastRadius = 250
        @owner = I.owner ? ""
        @color = I.color ? "#fff"
        @sprite = I.sprite ? new Sprite("/images/nuke.png", 50, 50)

        detonate: ->
            x = 0
            y = 0
            theta = 0
            dist = 0
            i = 0
            while i++ < @payload
                theta = Math.random()*Math.PI*2
                dist = Math.random()*@blastRadius
                x = (@x + dist*Math.cos(theta)) % game.width
                y = (@y + dist*Math.sin(theta)) % game.height
                game.add new Explosion(
                    "x": x,
                    "y": y,
                    "ttl": 100,
                    "damage": @damage,
                    "owner": @owner,
                , game)

            game.remove this
