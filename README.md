# Wormhole

In the early 2000s, I remember playing an online Flash game called Wormhole.  It
has since disappeared, so I recreated the basic concepts here using Javascript
and Node.js.

## Gameplay

Each player has a spaceship in his own unique space.  There are wormholes
floating around, one for each other player.  The player can shoot things into
a wormhole, where it will appear on that player's screen.  The goal is to shoot
weapons into the other players' wormholes and destroy them.

## Installation

First clone the Vagrant VM from https://github.com/semmypurewal/node-dev-bootstrap.git.
Then replace the contents of the 'app' folder with this repo. Once you fire up
vagrant (`vagrant up`) and ssh in (`vagrant ssh`), use `node app.js` to start
the server.

