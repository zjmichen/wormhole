#= require Arsenal

class Game
    gameObjects = []
    backgroundObjects = []
    wormholes = {}
    numWormholes = 0

    constructor: (playerName, otherPlayers) ->
        canvasEl = $("canvas#wormhole")
        @canvas = canvasEl.get(0).getContext("2d")
        @width = canvasEl.width()
        @height = canvasEl.height()
        @weapons = Arsenal::getArsenal()
        @hasWon = false
        @framerate = 30

        i = numStars
        while i-- > 0
            backgroundObjects.push new Star()

        @player = new Ship({"name": playerName})
        @add(@player)

        for opponent in otherPlayers
            newWormhole = new Wormhole
                "name": opponent,
                "x": Math.random() * (width - 100) + 50,
                "y": Math.random() * (height - 50) + 50,

            wormholes[newWormhole.name] = newWormhole
            numWormholes += 1
            @add newWormhole

    play: ->
        @gameLoop = setInterval ->
            update()
            draw()
        , 1000/@framerate

        @cometLoop = setInterval ->
            x = @width
            y = @height

            if Math.random() > 0.5
                x = Math.random()*@width
            else
                y = Math.random()*@height
            
            backgroundObjects.push new Comet
                "x": x,
                "y": y
        , 5000

        @itemLoop = setInterval ->
            types = Object.keys(weapons)
            weapon = "none"
            x = -20
            y = -20
            angle = Math.random()*Math.PI
            weaponChoice = Math.random()
            threshhold = 0

            for curWeapon in weapons
                threshhold += weapons[curWeapon].rarity
                if weaponChoice < threshhold
                    weapon = curWeapon
                    break

            switch Math.floor(Math.random()*4)
                when 0 or 2 
                    x = Math.random()*@width
                when 1 or 3
                    y = Math.random()*@height
                when 2
                    angle += Math.PI
                    y = @height + 20
                when 3
                    angle += 0.5*Math.PI
                    x = @width + 20 

            gameObjects.push new Item
                "subtype": "weapon",
                "x": x,
                "y": y,
                "angle": angle,
                "payload": weapon,
                "scale": 0.5,
        , 5000


    stop: ->
        clearInterval(gameLoop)
        clearInterval(cometLoop)
        clearInterval(itemLoop)

    receiveData: (data) ->
        if data.from and data.type
            data.x = wormholes[data.from].x + 0.5*wormholes[data.from].size
            data.y = wormholes[data.from].y + 0.5*wormholes[data.from].size
            data.color = "#f00"
            data.ttl = undefined
            if data.sprite
                data.sprite = new Sprite(data.sprite.modeUrls,
                                         data.sprite.width, data.sprite.height)

            if data.subtype in weapons
                @add(new weapons[data.subtype].item(data))
            else if data.subtype is "bullet"
                @add(new Bullet(data))

    removePlayer: (player) ->
        wormholes[player].sprite.scaleTo(0, 1000, ->
            remove(wormholes[player])
            numWormholes -= 1

            if numWormholes <= 0
                that.won = true
        )

    add: (obj) ->
        gameObjects.push(obj)

    remove: (obj) ->
        gameObjects.splice(gameObjects.indexOf(obj), 1)

    addToBackground: (obj) ->
        backgroundObjects.push(obj)

    removeFromBackground: (obj) ->
        backgroundObjects.splice(backgroundObjects.indexOf(obj), 1)

    update = ->
        if player.alive
            if keystatus.left
                player.turnLeft()

            if keystatus.right
                player.turnRight()
            
            if keystatus.up
                if player.sprite.mode isnt "thrusting"
                    player.sprite.setMode "thrusting"
                player.accelerate();
            else
                if player.sprite.mode is "thrusting"
                    player.sprite.setMode "normal"

        obj.update for obj in backgroundObjects

        for obj, i in gameObjects
            obj.update()

            j = i + 1
            while j++ < gameObjects.length
                if collides gameObjects[i], gameObjects[j]
                    gameObjects[i].collideWith objs[j]
            
    draw = ->
        @canvas.fillStyle = "#000";
        @canvas.fillRect(0, 0, @width, @height);

        obj.draw for obj in backgroundObjects
        obj.draw for obj in gameObjects

        drawFuel()
        drawHealth()
        drawInventory()

        if @won then drawWon()

    drawFuel = ->
        fuelLevel = @height * (@player.fuel / @player.maxFuel);
        canvas.fillStyle = "#0f0"
        canvas.fillRect @width - 10, @height - fuelLevel, 5, fuelLevel
        canvas.fillStyle = "#0f0"
        canvas.fillText "Fuel", @width - 35, @height - 15

    drawHealth = ->
        healthLevel = @height * (@player.health / @player.maxHealth);
        canvas.fillStyle = "#f00"
        canvas.fillRect @width - 5, @height - healthLevel, 5, healthLevel
        canvas.fillStyle = "#f00"
        canvas.fillText "Health", @width - 47, @height - 3
    
    drawInventory = ->
        for weapon, i in player.weapons
            x = i * 32 + 24;

            canvas.save()
            canvas.translate x, @height - 24
            weapon.draw()
            canvas.restore()
    
    collides = (a, b) ->
        return (Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) < a.size + b.size)
    
    drawWon = ->
        @canvas.fillStyle = "#fff"
        @canvas.font = "bold 72px sans-serif"
        @canvas.textAlign = "center"
        @canvas.shadowColor = "#000"
        @canvas.shadowBlur = 4
        @canvas.fillText "You won!", 0.5*@width, 0.5*@height
        @canvas.font = "bold 12px sans-serif"
        @canvas.fillText "But your friends are still dead.", 0.5*@width, 0.5*@height + 30

        @canvas.font = "normal 10px sans-serif"
        @canvas.textAlign = "start"
