class Sprite
    curImg = undefined
    modes = {}
    curFrame = 0
    curImgIndex = 0

    constructor: (modeUrls, width, height) ->
        if typeof modeUrls is "string"
            modeUrls =
                "normal": [modeUrls]
            

        for mode of modeUrls
            modes[mode] = []
            for url, i in modeUrls[mode]
                modes[mode][i] = new Image()
                modes[mode][i].src = url

        curImg = modes.normal[0]


        @type = "sprite"
        @width = width
        @height = height
        @modeUrls = modeUrls
        @framesPerImage = 3
        @modes = modes
        @mode = "normal"
        @scale = 1.0
        @targetScale = 1.0
        @scaleChange = 0
        @scaling = no
        
    draw: (canvas) ->
        img = @getImage()

        if @scale <= 0
            return

        canvas.save()
        canvas.translate -0.5*@width, -0.5*@height
        canvas.scale @scale, @scale
        if img
            canvas.drawImage img, 0, 0
        else
            canvas.fillStyle = "#fff"
            canvas.fillRect 0, 0, @width, @height
        
        canvas.restore()
    
    getImage: ->
        curFrame += 1

        if @scaleChange isnt 0
            @scale += @scaleChange
            @width = @scale * width
            @height = @scale * height
        else
            @scaling = no

        if  (@scaleChange > 0 and @scale >= @targetScale) or
            (@scaleChange < 0 and @scale <= @targetScale)

            @scale = @targetScale
            @scaleChange = 0
            console.log "Scaling done."

        if curFrame > @framesPerImage
            curFrame = 0
            curImgIndex = (curImgIndex + 1) % modes[@mode].length

        return modes[@mode][curImgIndex] ? modes.normal[0]
    
    scaleTo: (newScale, time, callback) ->
        if @scaling
            return

        @scaling = yes
        time = time ? 1000
        frames = 0.03*time
        direction = (newScale > @scale) ? 1 : -1
        @scaleChange = direction*(Math.abs(@scale - newScale) / frames)
        @targetScale = newScale

        if callback
            setTimeout callback, time
    
    setMode: (newMode) ->
        @mode = newMode
        curImg = 0
