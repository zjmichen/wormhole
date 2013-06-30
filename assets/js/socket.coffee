#= require wormhole/Game

class window.SocketController
    constructor: ->
        socket = new io.connect(window.location.host)

    joinLobby: ->
        console.log "Contacting server to join lobby"
        socket.emit "joinLobby"
        socket.on "gameList", window.contents.updateGameList
    
    getGameList: ->
        socket.emit "getGameList"
        

    joinGame: (name) ->
        socket.emit "joinGame", name
        @waitForGame()
        
    newGame: (game, numPlayers) ->
        console.log "Creating a game of " + game + " with " + numPlayers
        socket.emit "newGame",
            "name": game,
            "numPlayers": numPlayers,
        @waitForGame()
        
    waitForGame: ->
        socket.on "wait", ->
            console.log "Server said wait."

        socket.on "go", @startGame
        
    startGame: (data) ->
            console.log "Server said go."

            otherPlayers = data.players
            thisPlayer = data.you
            game = new Game thisPlayer, otherPlayers
            window.contents.startGame()
            game.play()
        
    send: (to, obj) ->
        obj ?= {}

        socket.emit "msg",
            "player": to,
            "from": thisPlayer,
            "data": JSON.stringify obj, (key, value) ->
                switch typeof value
                    when "function" then return undefined
                    when "object" and value.type is "sprite"
                        return {
                            "modeUrls": value.modeUrls,
                            "width": value.width,
                            "height": value.height,
                        }
                    else return value

    wormhole: (data) ->
        obj = JSON.parse data.data
        obj.from = data.from
        game.receiveData obj
        
    receive: (data) ->
        console.log "Got a message:"
        console.log data
        
    playerQuit: (data) ->
        i = otherPlayers.indexOf data.player
        if i >= 0
            otherPlayers.splice i, 1
            game.removePlayer data.player
            console.log data.player + " quit."
        
    quit: ->
        socket.emit "quit", {"player": thisPlayer}
