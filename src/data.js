import merge from 'merge';
import pieces from './pieces';
import configure from './configure';

module.exports = function(cfg) {
  var defaults = {
    povSide: 'east', // side of board
    turnSide: 'east', // turn to play. east | west | north | south
    pieces: pieces.readBoard(pieces.initial),
    discards: pieces.readDiscards(pieces.initialDiscards), // array of discarded pieces
    opens: pieces.readOpenGroups(pieces.initialOpenGroups),
    middles: pieces.readMiddles(pieces.initialMiddles),
    selected: null, // piece currently selected  poskey || null
    middleHolder: {
      current: false, // has draw beginned
      key: null, // key to place on board
      piece: null // piece to draw from middle
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
      free: true,
      events: {
        after: function(key) {} // called after the move has been played
      }
    },
    events: {
      move: function(key) {}
    }
  };

  configure(defaults, cfg || {});

  return defaults;
};
