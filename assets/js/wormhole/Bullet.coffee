#= require Weapon

class Bullet extends Weapon
    constructor: (I, game) ->
        super constructor
        @type = "projectile"
        @subtype = "bullet"
    
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
