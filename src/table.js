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

function baseGosterge(data, orig) {
  var piece = data.pieces[orig];
  if (!piece) return false;
  if (util.pieceEqual(piece, data.middles[util.gosterge])) {
    console.log('here');
  }
}

function placeOpens(data, orig, dest) {
  if (dest && util.isOpensKey(dest)) {
    if (basePlaceOpens(data, orig, dest)) {
      return true;
    }
  }
}

function placeTop(data, orig, dest) {
  if (dest && dest === util.discards[2]) {
    if (basePlaceDiscard(data, orig, dest)) {
      return true;
    }
  } else if (dest === util.gosterge) {
    if (baseGosterge(data, orig)) {
      return true;
    }
  }
}

function selectTop(data, key) {
  setSelected(data, key);
}

function setSelected(data, key) {
  data.selected = key;
}

function withRowColumn(f, tColumns = util.topColumns, tRows = util.topRows) {
  return function(data, pos, bounds) {
    if (!bounds && !data.bounds) return;
    bounds = bounds || data.bounds();

    var column = Math.floor(tColumns * ((pos[0] - bounds.left) / bounds.width));
    var row = Math.floor(tRows * ((pos[1] - bounds.top) / bounds.height));
    if (row >= 0 && row < tRows && column >= 0 && column < tColumns)
      return f(row, column);
  };
}

const getOpensKeyAtDomPos = withRowColumn(function(row, column) {
  return util.miniPos2key([column, row]);
}, util.miniColumns, util.miniRows);

const getDrawKeyAtDomPos = withRowColumn(function(row, column) {
  if (row === util.topRows - 1) {
    // draw left
    if (column === 0) {
      return util.discards[1];
    }
    // middle
    if (column === util.topColumns - 4) {
      return util.middleCount;
    }
  }
});

const getDiscardKeyAtDomPos = withRowColumn(function(row, column) {
  if (row === util.topRows - 1) {

    // discard down is at the bottom right
    if(column === util.topColumns - 1) {
      return util.discards[2];
    }
    if (column === util.topColumns - 3) {
      // gosterge is on third column to last
      return util.gosterge;
    }
  }
});

module.exports = {
  selectTop: selectTop,
  placeTop: placeTop,
  placeOpens: placeOpens,
  getDrawKeyAtDomPos: getDrawKeyAtDomPos,
  getDiscardKeyAtDomPos: getDiscardKeyAtDomPos,
  getOpensKeyAtDomPos: getOpensKeyAtDomPos
};
