#= require GameObject

class Item extends GameObject
    constructor: (I, game) ->
        spriteUrl = "/images/item_none.png"
        if not I.sprite and I.payload
            spriteUrl = "/images/item_" + I.payload + ".png"

        @type = "item"
        @subtype = I.subtype ? "nothing"
        @x = I.x ? 0
        @y = I.y ? 0
        @angle = I.angle ? Math.random()*Math.PI*0.5
        @speed = I.speed ? 2
        @scale = I.scale ? 1
        @ttl = I.ttl ? 1000
        @size = 12
        @payload = I.payload
        @sprite = I.sprite ? new Sprite(spriteUrl, 48, 48)

    collideWith: (obj, isReaction) ->
        if obj.type is "ship"
            obj.pickUp this
            game.remove this
        super.collideWith(obj, isReaction)
