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
      , gameLoop;

    canvasEl = $("canvas#wormhole");
    canvasEl.attr("width", width);
    canvasEl.attr("height", height);
    canvas = canvasEl.get(0).getContext("2d");

    function update() {

    }

    function draw() {
        canvas.clearRect(0, 0, width, height);
        canvas.fillStyle = "#000";
        canvas.fillText("Hey!", 50, 50);
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

    return _Game;
}
