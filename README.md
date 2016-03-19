### Formatting

#### Piece

```
piece = color + number
number = 1-13
color = r|g|b|l
r = red
g = green
b = blue
l = black
```

example: `r1 b13 g5`

#### Board

16 x 2 dimensions

```
board = [piece|\s]{32}
```

example: `r1b13g5 r1b13g5g5    g1`

#### Discard

every direction discards to its right side.
so `up` discards `top left`, `down` discards `bottom right`.

```
discard = [piece|\s]{4}
```

represents: `[up, left, down, right]`

example: `r13b1l1 `

#### Middle

```
middle = middleCount + gosterge
gosterge = piece
middleCount = \d
```

example: `20r10`

#### Opens

Opened series appear on the left side
Opened pairs appear on the right side

```
opens = series/pairs
pairs = series = [piece|\s]
```

each piece group is separated by a `\s`

example: `r13b1l1 r2b2l2 r1r2r3r4r5/r1r1 g2g2 l2l2`


#### FEN

fen = board/discard/series/pairs/middle/povSide


#### Rules

move pieces on board
draw middle
draw left
discard
discard end
show sign

## Moves

draw middle
draw left
discard
discard end

api move (key, piece)
  turnSide == player

player

draw left / discard
  user move place on board
  api move noop

draw middle
  user move add middle placeholder
  api move (piece) replace placeholder

opponent
  draw middle / draw left / discard
    api move do move


### API

    // reconfigure the instance. Accepts all options mentioned above.
    ground.set(options);

    // make a move for turn side.
    // dm | dl | dd | lt
    ground.apiMove(move, piece);

    // provide the drawn middle piece, required to end the draw middle progress.
    ground.apiDrawMiddleEnd(piece)


#### Getters

    // get piece groups on board
    var pieceGroups = ground.getPieceGroups();
