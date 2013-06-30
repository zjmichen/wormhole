class window.Star
    distance = Math.floor(Math.random() * 255)

    constructor: (game) ->
        @color = "rgb(" + distance + "," + distance + "," + distance + ")"
        @x = Math.floor(Math.random()*game.width)
        @y = Math.floor(Math.random()*game.height)

        update: ->
            @x -= distance / 1000
            if @x < 0
                @x = game.width

            @y -= distance / 1500
            if @y < 0
                @y = game.height

        draw: ->
            game.canvas.fillStyle = @color
            game.canvas.fillRect @x, @y, 2, 2
