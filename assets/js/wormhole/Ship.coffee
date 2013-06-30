#= require GameObject
#= require Bullet

class window.Ship extends GameObject
    drag = 0.99

    constructor: (I, game) ->
        @sprite = new Sprite(
            "normal": [
                "/images/ship_normal.png",
            ],
            "thrusting": [
                "/images/ship_fire1.png",
                "/images/ship_fire2.png",
                "/images/ship_fire3.png",
            ],
            "exploding": [
                "/images/ship_explosion1.png",
                "/images/ship_explosion2.png",
            ],
        , 150, 64)
        
        @type = "ship"
        @name = I.name ? ""
        @x = I.x ? game.width / 2
        @y = I.y ? game.height / 2
        @size = I.size ? 32
        @angle = I.angle ? 0
        @direction = @angle
        @color = I.color ? "#00f"
        @speed = I.speed ? 0
        @thrust = I.thrust ? 0.3
        @maxFuel = I.maxFuel ? 20
        @fuel = I.fuel ? @maxFuel
        @recharge = I.recharge ? 0.1
        @maxHealth = I.maxHealth ? 100
        @health = I.health ? @maxHealth
        @alive = yes
        @weapons = []
        I.maxWeapons ? 10

    update: ->
        @die if @health <= 0
        @fuel += @recharge if @fuel < @maxFuel
        @speed *= drag
        super.update()

    turnLeft: ->
        @direction -= 0.1

    turnRight: ->
        @direction += 0.1

    accelerate: ->
        @fuel -= @thrust

        if @fuel <= 0
            @fuel = 0
            @sprite.setMode "normal"
            return

        driftX = @speed*Math.cos(@angle)
        driftY = @speed*Math.sin(@angle)
        thrustX = @thrust*Math.cos(@direction)
        thrustY = @thrust*Math.sin(@direction)

        driftX += thrustX;
        driftY += thrustY;

        @speed = Math.sqrt(Math.pow(driftX, 2) + Math.pow(driftY, 2))

        @angle = Math.acos(driftX / @speed);
        if Math.asin(driftY / @speed) < 0
            @angle *= -1

    shoot: (weapon) ->
        I =
            "x": @x + @size*Math.cos(@direction),
            "y": @y + @size*Math.sin(@direction),
            "angle": @direction,
            "speed": @speed + 2,
            "owner": @name

        if @weapons.length > 0
            weapon = @weapons.pop().payload

            if weapon in game.weapons
                game.add new game.weapons[weapon].item(I, game)

        else
            game.add new Bullet(I, game)

    pickUp: (item) ->
        if item.subtype is "weapon" and @weapons.length < @maxWeapons
            item.x = 0
            item.y = 0
            item.scale = 1
            @weapons.push item

    die: ->
        @alive = no
        @sprite.setMode "exploding"
        window.socket.quit()

        setTimeout ->
            @sprite.scaleTo 0, 500, ->
                game.remove this
        , 500
