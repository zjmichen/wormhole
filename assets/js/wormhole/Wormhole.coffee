#= require GameObject

class Wormhole
    constructor: (I, game) ->
        @type = "wormhole"
        @name = I.name
        @x = I.x ? 0.5*game.width
        @y = I.y ? 0.5*game.height
        @angle = 0
        @size = I.size ? 30
        @sprite = I.sprite ? new Sprite("/images/wormhole.png", 50, 50)

        update: ->
            @angle -= 0.01

        collideWith: (obj, isReaction) ->
            if obj.type is "projectile" and obj.owner isnt @name
                if obj.sprite and not obj.sprite.scaling
                    distToCenter = Math.sqrt(Math.pow(@x - obj.x, 2) +
                                             Math.pow(@y - obj.y, 2))
                    framesToCenter = (1/obj.speed)*distToCenter
                    timeToCenter = framesToCenter*game.frameRate

                    obj.sprite.scaleTo 0, timeToCenter, ->
                        that.send obj
                        game.remove obj
                else if not obj.sprite
                    @send obj
                    game.remove obj
                    
        send: (data) ->
            window.socket.send @name, data
