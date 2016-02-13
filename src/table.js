import util from './util';

function basePlaceOpens(data, orig, dest) {
  if (!data.pieces[orig]) return false;
  data.opens[dest] = data.pieces[orig];
  delete data.pieces[orig];
  return true;
}

function basePlaceDiscard(data, orig, dest) {
  if (!data.pieces[orig]) return false;
  data.discards[dest] = data.pieces[orig];
  delete data.pieces[orig];
  return true;
}

function placeOpens(data, orig, dest) {
  if (dest && util.isOpensKey(dest)) {
    if (basePlaceOpens(data, orig, dest)) {
      return true;
    }
  }
}

function placeTop(data, orig, dest) {
  if (dest && dest === 'down') {
    if (basePlaceDiscard(data, orig, dest)) {
      return true;
    }
  }
}

function getOpensKeyAtDomPos(data, pos, bounds) {
  if (!bounds && !data.bounds) return;
  bounds = bounds || data.bounds();
  var column = Math.floor(util.miniColumns * ((pos[0] - bounds.left) / bounds.width));
  var row = Math.floor(util.miniRows * ((pos[1] - bounds.top) / bounds.height));
  if (row >= 0 && row < util.miniRows && column >= 0 && column < util.miniColumns)
    return util.miniPos2key([column, row]);
}

function getTopKeyAtDomPos(data, pos, bounds) {
  if (!bounds && !data.bounds) return;
  bounds = bounds || data.bounds();

  var column = Math.floor(util.topColumns * ((pos[0] - bounds.left) / bounds.width));
  var row = Math.floor(util.topRows * ((pos[1] - bounds.top) / bounds.height));
  if (row >= 0 && row < util.topRows && column >= 0 && column < util.topColumns)

    // discard down is at the bottom right
    if (row === util.topRows - 1 && column === util.topColumns - 1) {
      return 'down';
    }
}

module.exports = {
  placeTop: placeTop,
  placeOpens: placeOpens,
  getTopKeyAtDomPos: getTopKeyAtDomPos,
  getOpensKeyAtDomPos: getOpensKeyAtDomPos
};
