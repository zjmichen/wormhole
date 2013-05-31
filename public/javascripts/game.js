$(document).ready(function() {
    var game = new Game();
    game.play();
});

function Game() {
    var width = 480
      , height = 320
      , canvasEl
      , canvas
      , ctx
      , frameRate = 30
      , gameLoop
      , ship;

    canvasEl = $("canvas#wormhole");
    canvasEl.attr("width", width);
    canvasEl.attr("height", height);
    canvas = canvasEl.get(0).getContext("2d");

    ship = new Ship();

    function update() {

    }

    function draw() {
        canvas.clearRect(0, 0, width, height);
        canvas.fillStyle = "#000";
        ship.draw();
    }

    /** public members/methods */
    var _Game = {

        "play": function() {
            gameLoop = setInterval(function() {
                update();
                draw();
            }, 1000/frameRate);
        },

        "pause": function() {

        },

        "stop": function() {
            clearInterval(gameLoop);
        },

    };

    /** internal objects */
    function Ship(I) {
        I = I || {};
        
        var _Ship = {
            "x": I.x || width / 2,
            "y": I.y || height  / 2,

            "update": function() {

            },

            "draw": function() {
                canvas.fillText("Hey!", this.x, this.y);
            },

        };

        return _Ship;
    }

    return _Game;
}

