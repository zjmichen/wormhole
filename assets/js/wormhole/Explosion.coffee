#= require GameObject

class Explosion extends GameObject
    constructor: (I, game) ->
        @type = "explosion"
        @x = I.x
        @y = I.y
        @ttl = I.ttl ? 20
        @damage = I.damage ? 10
        @owner = I.owner ? ""
        @size = 25
        @sprite = I.sprite ? new Sprite(
            "normal": [
                "/images/explosion1.png",
                "/images/explosion2.png",
            ],
        , 50, 50)

        update: ->
            @ttl -= 1
            if @ttl is 0
                @sprite.scaleTo 0, 1000, ->
                    game.remove this

        collideWith: (obj, isReaction) ->
            if @owner isnt obj.name and @damage > 0 and obj.health > 0
                obj.health -= 1
                @damage -= 1
            super.collideWith(obj, isReaction)
