#= require Weapon
#= require Explosion

class window.Mine extends Weapon
    constructor: (I, game) ->
        @sprite = new Sprite(
            "normal": [
                "/images/mine1.png",
                "/images/mine3.png",
            ],
            "active": [
                "/images/mine1.png",
                "/images/mine2.png",
            ],
        , 50, 50)

        if I.owner isnt game.player.name
            sprite.mode = "active"

        @type = "projectile"
        @subtype = "mine"
        @x = I.x
        @y = I.y
        @speed = I.speed || 1
        @angle = I.angle
        @size = I.size || 5
        @ttl = I.ttl || 100000
        @damage = I.damage || 20
        @payload = I.payload || 20
        @owner = I.owner || ""
        @color = I.color || "#fff"

        detonate: ->
            game.add new Explosion(
                "x": this.x + this.size*Math.cos(this.angle),
                "y": this.y + this.size*Math.sin(this.angle),
                "ttl": 50,
                "damage": this.payload,
                "owner": this.owner,
            , game)

            game.remove this
