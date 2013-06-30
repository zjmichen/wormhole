#= require Weapon
#= require Explosion

class window.Missile extends Weapon
    constructor: (I, game) ->
        @type = "projectile"
        @subtype = "missile"
        @x = I.x
        @y = I.y
        @speed = I.speed ? 1
        @angle = I.angle
        @size = I.size ? 5
        @ttl = I.ttl ? 150
        @damage = I.damage ? 0
        @payload = I.payload ? 10
        @owner = I.owner ? ""
        @color = I.color ? "#fff"
        @sprite = I.sprite ? new Sprite(
            "normal": [
                "/images/missile1.png",
                "/images/missile2.png",
            ],
        , 50, 13)

    update: ->
        # heat seeking
        if @owner isnt game.player.name
            playerAngle = Math.atan( (game.player.y - @y) / 
                                     (game.player.x - @x) )
            if game.player.x - @x < 0)
                playerAngle += Math.PI

            @angle += 0.5*(playerAngle - @angle)

        super.update()

    detonate: ->
        game.add new Explosion(
            "x": @x + @size*Math.cos(@angle),
            "y": @y + @size*Math.sin(@angle),
            "ttl": 50,
            "damage": @payload,
            "owner": @owner,
        , game)

        game.remove this
