#= require socket

$(document).ready ->
    window.contents = new ContentController()
    contents.init()

class window.ContentController
    init: ->
        window.socket = new SocketController()
        $("button#joinLobby").click(this.joinLobby)

    joinLobby: ->
        $("#intro").fadeOut()
        $("#lobby").fadeIn ->
            window.socket.joinLobby()
            @gameListUpdate = setInterval ->
                window.socket.getGameList
            , 2000
            $(".join").click(this.joinGame)
            $("button#newGame").click(this.createGame)

    joinGame: ->
        gameName = $(this).attr("data-game")
        window.socket.joinGame(gameName)

    createGame: ->
        gameName = $("input#newGameName").val()
        numPlayers = $("input#newGamePlayers").val()
        window.socket.newGame(gameName, numPlayers)

    updateGameList: (games) ->
        $("ul#gameList").html("")
        appendGame = ->
            game = JSON.parse(games[game])
            $("ul#gameList").append(Mustache.to_html($("#gameInfo").html(), game))

        appendGame for game in games

    startGame: ->
        clearInterval(@gameListUpdate)
        window.scrollTo(0, 0)
        $("canvas#wormhole").fadeIn()
