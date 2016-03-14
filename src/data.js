import merge from 'merge';
import pieces from './pieces';

function configure(data, config) {
  if (!config) return;
  merge.recursive(data, config);

  // if a fen was provided, replace the pieces
  if (data.fen) {
    var fen = pieces.read(data.fen);
    data.pieces = fen.pieces;
    data.discards = fen.discards;
    data.opens = fen.opens;
    data.middles = fen.middles;
  }
}

module.exports = function(cfg) {
  var defaults = {
    pieces: pieces.readBoard(pieces.initial),
    discards: pieces.readDiscards(pieces.initialDiscards),
    opens: pieces.readOpenGroups(pieces.initialOpenGroups),
    middles: pieces.readMiddles(pieces.initialMiddles),
    selected: null, // piece currently selected  poskey || null
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
      free: true
    }
  };

  configure(defaults, cfg || {});

  return defaults;
};
