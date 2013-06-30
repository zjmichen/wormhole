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
        if @ttl <= 0
            @detonate()
            return
        @ttl -= 1
        super.update()

    detonate: ->
        game.remove this

    collideWith: (obj, isReaction) ->
        if obj.type is "ship" and @owner isnt obj.name
            @detonate()
        super.collideWith obj, isReaction
