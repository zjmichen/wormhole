#= require Weapon

class window.Bullet extends Weapon
    constructor: (I, game) ->
        super()
        @type = "projectile"
        @subtype = "bullet"

    draw: ->
        game.canvas.fillStyle = @color
        game.canvas.fillRect @x, @y, @size, @size
    
    collideWith: (obj, isReaction) ->
        if obj.type is "ship" and @owner isnt obj.name
            obj.health -= @damage
            game.remove this
        else if obj.type is "projectile"
            if obj.detonate
                obj.detonate()
                game.remove this

        if not isReaction
            obj.collideWith this, true
