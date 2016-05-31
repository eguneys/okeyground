import merge from 'merge';
import pieces from './pieces';
import configure from './configure';

module.exports = function(cfg) {
  var defaults = {
    povSide: 'east', // side of board
    turnSide: 'east', // turn to play. east | west | north | south
    lastMove: null,
    withTore: false, // allow 12 13 1 binding on group series
    pieces: pieces.readBoard(pieces.mixed),
    discards: pieces.readDiscards(pieces.initialDiscards, 'east'), // array of discarded pieces
    opens: pieces.readOpenGroups(pieces.initialOpenGroups),
    middles: pieces.readMiddles(pieces.initialMiddles),
    selected: null, // piece currently selected  poskey || null
    middleHolder: {
      current: false, // has draw beginned
      key: null, // key to place on board
      piece: null // piece to draw from middle
    },
    animation: {
      enabled: true,
      duration: 500,
      // {
      //   start: timestamp,
      //   duration: ms,
      //   anims: {
      //   }
      // }
      current: {}
    },
    draggable: {
      enabled: true,
      distance: 3, // minimum distance to initiate a drag, in pixels
      // { // current
      //   orig: 1, // orig key of dragging piece
      //   rel: [100, 70], // x, y of the piece at original position
      //   pos: [20, -12], // relative current position
      //   dec: [4, -8], // piece center decay
      //   over: 10, // square being moused over
      //   bounds: // current cached board bounds
      //   started: // whether the drag has started
      // }
      current: {}
    },
    movable: {
      board: true,
      free: true,
      events: {
        // move key: dm | dl | dd | lt
        after: function(key, piece) {} // called after the move has been played
      }
    },
    flippable: {
      enabled: true,
      current: {}
    },
    openable: {
      dests: [] // open droppable dests for the current selection
    },
    events: {
      move: function(key, piece) {}
    }
  };

  configure(defaults, cfg || {});

  return defaults;
};
