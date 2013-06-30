#= require GameObject

class Weapon extends GameObject
    constructor: (I, game) ->
        @type = "none"
        @x = I.x ? 0
        @y = I.y ? 0
        @speed = I.speed ? 1
        @angle = I.angle ? 0
        @size = I.size ? 2
        @ttl = I.ttl ? 70
        @damage = I.damage ? 1
        @owner = I.owner ? ""
        @color = I.color ? "#fff"

    update: ->
        if this.ttl <= 0
            game.remove this
            return

        @ttl -= 1
        super.update()
