import merge from 'merge';
import pieces from './pieces';

module.exports = function(data, config) {
  if (!config) return;
  merge.recursive(data, config);

  // if a fen was provided, replace the pieces
  if (data.fen) {
    // override fen side for spectator
    if (data.spectator) {
      data.fen = data.povSide[0] + data.fen.slice(1);
    }

    if (data.animationHint) {
      data.animation.current.hint = data.animationHint;
      delete data.animationHint;
    } else {
      data.animation.current.hint = '';
    }

    var fen = pieces.read(data.fen);
    data.pieces = fen.pieces;
    data.discards = fen.discards;
    data.opens = fen.opens;
    data.middles = fen.middles;
    delete data.fen;
  } else {
    data.animation.current.hint = '';
  }
};
