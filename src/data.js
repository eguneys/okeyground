import merge from 'merge';
import pieces from './pieces';

function configure(data, config) {
  if (!config) return;
  merge.recursive(data, config);
}

module.exports = function(cfg) {
  var defaults = {
    pieces: pieces.read(pieces.initial),
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
    }
  };

  configure(defaults, cfg || {});

  return defaults;
};
