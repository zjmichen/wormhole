#= require Sprite

class window.Comet
    constructor: (I, game) ->
        @x = I.x || game.width
        @y = I.y || game.height
        @angle = I.angle || (Math.random()*0.5 + 1)*Math.PI
        @speed = I.speed || Math.floor(Math.random()*5) + 5
        @animationStep = 0
        sprite = new Sprite(
            "normal": [
                "/images/missile1.png",
                "/images/missile2.png",
            ],
        , 50, 13)

        update: ->
            @x += @speed*Math.cos(@angle)
            @y += @speed*Math.sin(@angle)

            if @x < 0 or @y < 0
                game.removeFromBackground this

        draw: ->
            game.canvas.save()
            game.canvas.translate @x, @y
            game.canvas.rotate @angle

            tailEnd = @animationStep is 0 ? -30 : -28
            @animationStep = (@animationStep + 1) % 3

            game.canvas.beginPath()
            game.canvas.strokeStyle = "#111"
            game.canvas.moveTo 0, 1
            game.canvas.lineTo tailEnd, 2
            game.canvas.moveTo 0, 2
            game.canvas.lineTo tailEnd, 2
            game.canvas.strokeStyle = "#333"
            game.canvas.moveTo 0, 1.5
            game.canvas.lineTo -20, 2
            game.canvas.stroke()

            game.canvas.fillStyle = "#777"
            game.canvas.fillRect 0, 0, 3, 3

            game.canvas.restore()
