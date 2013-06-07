# Wormhole

In the early 2000s, I remember playing an online Flash game called Wormhole.  It
has since disappeared, so I recreated the basic concepts here using Javascript 
and Node.js.

## Gameplay

Each player has a spaceship in his own unique space.  There are wormholes 
floating around, one for each other player.  The player can shoot things into
a wormhole, where it will appear on that player's screen.  The goal is to shoot
weapons into the other players' wormholes and destroy them.

There are different weapons that do different things.  These float around until
the player picks them up, and then the player can shoot the weapon.  Only enemy
weapons do damage.

## Server

The server is an Express app that sets up socket.io connections to each 
connected player.  The socket connections are managed by SocketController:  this
enqueues players that are ready to play, sets up a game when enough players are
ready, and manages transferring data between players.

When a player connects to the site, SocketController sets up handlers for the
various signals it can receive from the client.  The signals are:

- "ready":  The client is ready to play a game.  The server will enqueue the
  client according to how many other players they want---a 2game, 3game, etc.
  Queues are stored in Redis.  If enough players are ready in a queue, then the
  server will start a game.
- "msg":  One client is sending data to another client, usually something that
  has been passed through a wormhole.  The server passes this along.
- "quit":  A player has died or has left; the other players are notified.

When a game is set up among players, each client socket joins a room 
representing that game.

## Client

The client code is the game itself, and is divided into various classes.  The
client has its own SocketController, which communicates with the server 
SocketController.  This SC is created when the page loads, and initiates
communication with the server.  It responds to the following signals:

- "wait":  After requesting to start a game, this signal means that there are
  not yet enough players.
- "go":  There are now enough players, and a game should be launched.  The other
  players' socket IDs are included.
- "msg":  A player has sent data to this one; the controller passes the data to
  the game.
- "quit":  Another player has quit the game; the game should be notified and 
  remove that player's wormhole.

When the client SocketController receives the "go" signal, it creates a Game
object.  This represents the game itself, and contains the other game objects. 
When Game#play is called, it creates loops for regularly ocurring events:  the
main game loop, a loop to create comets, and a loop to distribute new items.
The game loop consists of calls to #update and #draw, each of which loop through
the background objects and game objects and call #update and #draw on each of
them.  Collision detection is also called on game objects; if two objects
collide, the object's #collideWith is called.  Finally, additional views are
drawn, such as the fuel and health meters and the player's collection of 
weapons.

### Game Objects

Normal things in the game, such as the player ship, wormholes, weapons, and 
items.  These can interact with each other by colliding.  Each object must have
#update, #draw, and #collideWith methods, as these are called by Game.  In 
addition, they must have the following properties:  x, y, angle, speed, type, 
and size.  The constructor must take two parameters:  an object containing 
initialization values, and a reference to the Game object.

- Ship:  This represents the player, and can be controlled by various 
  keybindings, which are set up in the Game object.  The ship can turn, thrust,
  and shoot, as well as pick up items it runs into.
- Wormhole:  These represent portals to other players' screens.  When certain
  objects collide with a wormhole (only fired weapons), it gets sucked in and
  is sent to that player's screen via the SocketController.
- Projectiles:  These are classes that represent weapons that have been fired, 
  and can be sent through wormholes or collide with the ship. Each of these 
  classes must have the type "projectile" and a subtype. Often they will have a 
  #detonate method, which will destroy the object and create something else.
- Items:  These are things floating around that can be picked up by the ship,
  usually weapons, but can be anything that can affect the ship, such as health.
- Explosions:  This is a stationary object that can damage the ship on
  collision.

### Background Objects

Things like stars and comets that are drawn in the background.  These can't 
interact with each other or with game objects, but they can be updated and even 
have sprites.  Each background object must have #update and #draw methods, but
don't require #collideWith, as there are no collisions.  So far there are Stars 
and Comets.

### Utility Objects

There are a few objects that manage things.  Most notably is the Sprite class,
which handles the loading and exchanging of images for a game or background
object.  Every image for a particular object's sprite must be the same size,
and this is passed to the constructor.  Also passed is either a string if only
one image will be used, or an object that defines the different modes the object
can have.  Each mode is an array of image URLs, which are displayed in sequence
when the object is in that mode.

Sprites can grow or shrink using #scaleTo, change modes with #setMode, and are
drawn with #draw, which requires a reference to the canvas.  No reference to the
Game object is required to create a sprite.

The Arsenal class is an object with references to each weapon that is available
and its likelihood of appearing as an item.  Game uses this to randomly create
weapon items for the player to pick up.
