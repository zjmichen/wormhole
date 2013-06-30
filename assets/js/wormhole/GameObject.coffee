#= require Sprite

class GameObject
    constructor: (I, game) ->
        @type = "none"
        @x = I.x ? 0
        @y = I.y ? 0
        @size = I.size ? 10
        @angle = I.angle ? 0
        @color = I.color ? "#fff"
        @speed = I.speed ? 0
        @sprite = I.sprite ? new Sprite()

    update: ->
        @x += @speed*Math.cos(@angle)
        @y += @speed*Math.sin(@angle)

        @x = ((@x % game.width) + game.width) % game.width
        @y = ((@y % game.height) + game.height) % game.height

    draw: ->
        canvas.save()
        canvas.translate @x, @y
        canvas.rotate @angle
        @sprite.draw canvas
        canvas.restore()

    collideWith: (obj, isReaction) ->
        if not isReaction
            obj.collideWith this, true