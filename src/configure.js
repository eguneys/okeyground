import merge from 'merge';
import pieces from './pieces';

module.exports = function(data, config) {
  if (!config) return;
  merge.recursive(data, config);

  // if a fen was provided, replace the pieces
  if (data.fen) {
    var fen = pieces.read(data.fen);
    data.pieces = fen.pieces;
    data.discards = fen.discards;
    data.opens = fen.opens;
    data.middles = fen.middles;
    delete data.fen;
  }
}
