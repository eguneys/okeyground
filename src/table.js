import util from './util';
import move from './move';
import pieces from './pieces';
import open from './open';

const { callUserFunction }  = util;

function apiMove(data, mmove, piece) {
  if (data.turnSide === data.povSide) {
  } else {
    const pov = util.findPov(data.povSide, data.turnSide);
    switch (mmove) {
    case move.drawMiddle: baseOpponentDrawMiddle(data);
      break;
    case move.drawLeft: baseOpponentDrawLeft(data, util.drawByPov(pov));
      break;
    case move.discard:
      piece = pieces.readPiece(piece).piece;
      baseOpponentDiscard(data, util.discardByPov(pov), piece);
      break;
    case move.leaveTaken:
      piece = pieces.readPiece(piece).piece;
      baseOpponentLeaveTaken(data, util.drawByPov(pov), piece);
      break;
    case move.openSeries:
      piece = pieces.readPieceGroup(piece);
      baseOpponentOpenSeries(data, piece);
      break;
    case move.openPairs:
      piece = pieces.readPieceGroup(piece);
      baseOpponentOpenPairs(data, piece);
      break;
    default: console.error('unknown move');
    }
  }
};

function baseOpponentOpenSeries(data, pieces) {
  var groupPieces = pieces;

  var series = data.opens.series.concat(groupPieces);
  data.opens.series = series;
  data.opens.relayout(data);
}

function baseOpponentOpenPairs(data, pieces) {
  var groupPieces = pieces;

  var pairs = data.opens.pairs.concat(groupPieces);
  data.opens.pairs = pairs;
  data.opens.relayout(data);
}

function baseOpponentDiscard(data, dest, piece) {
  data.discards[dest].unshift(piece);
  return true;
}

function baseOpponentDrawMiddle(data) {
  data.middles[util.middleCount]--;
  return true;
}

function baseOpponentDrawLeft(data, dest) {
  data.discards[dest].shift();
  return true;
}

function baseOpponentLeaveTaken(data, dest, piece) {
  data.discards[dest].unshift(piece);
  return true;
}

function baseDropOpens(data, orig, dest) {
  if (!data.pieces[orig]) return false;
  var piece = data.pieces[orig];

  var seriePos = pieces.getOpenSerieFromPos(data, util.miniKey2pos(dest));

  if (seriePos) {
    callUserFunction(util.partial(data.events.move, move.dropOpens));

    var [groupIndex, index] = seriePos;
    var group = data.opens.series[groupIndex];

    var isAppend = (index === 0 || index === group.length + 1) ? 0: 1;

    group.splice(index - isAppend, isAppend, piece);

    data.opens.relayout(data);

    delete data.pieces[orig];
    return true;
  }

  var pairPos = pieces.getOpenPairFromPos(data, util.miniKey2pos(dest));

  if (pairPos) {
    callUserFunction(util.partial(data.events.move, move.dropOpens));

    [groupIndex, index] = pairPos;
    group = data.opens.pairs[groupIndex];

    group.splice((index + 1) % 2, 1, piece);

    data.opens.relayout(data);

    delete data.pieces[orig];
  }

  return false;
}

function baseDropDiscard(data, orig, dest) {
  const piece = data.pieces[orig];
  if (!piece) return false;
  callUserFunction(util.partial(data.events.move, move.discard, piece.key));
  data.discards[dest].unshift(data.pieces[orig]);
  delete data.pieces[orig];
  return true;
}

function baseGosterge(data, orig) {
  var piece = data.pieces[orig];
  if (!piece) return false;
  if (util.pieceEqual(piece, data.middles[util.gosterge])) {
    callUserFunction(util.partial(data.events.move, move.sign, piece.key));
    return true;
  }
  return false;
}

function dropOpens(data, orig, dest) {
  if (dest && util.isOpensKey(dest)) {
    if (canDropOpens(data, orig, dest)) {
      if (baseDropOpens(data, orig, dest)) {
        callUserFunction(util.partial(data.movable.events.after, move.dropOpens));
        return true;
      }
    }
  }
  return false;
}

function dropTop(data, orig, dest) {
  var piece = data.pieces[orig];
  if (dest && dest === util.discards[2]) {
    if (canDiscard(data, orig, dest)) {
      if (baseDropDiscard(data, orig, dest)) {
        callUserFunction(util.partial(data.movable.events.after, move.discard, piece.key));
        return true;
      }
    }
  } else if (dest === util.gosterge) {
    if (canGosterge(data, orig)) {
      if (baseGosterge(data, orig)) {
        callUserFunction(util.partial(data.movable.events.after, move.sign));
        return true;
      }
    }
  }
  return false;
}

function selectTop(data, key) {
  setSelected(data, key);
}

function setSelected(data, key) {
  data.selected = key;
}

function isDraggable(data, key) {
  if (util.isMiddleKey(key) || util.isDrawLeftKey(key)) {
    return data.povSide === data.turnSide;
  } else return util.isBoardKey(key);
}

function isDroppableOpens(data, key) {
  var piece = data.pieces[key];

  if (piece && data.povSide === data.turnSide) {
    return true;
  }
  return false;
}

function isMovable(data) {
  return data.povSide === data.turnSide;
}

function canDropOpens(data, orig, dest) {
  return isDroppableOpens(data, orig) &&
    util.isBoardKey(orig) &&
    util.isOpensKey(dest) &&
    util.containsX(data.movable.dests, move.dropOpens) &&
    util.containsX(open.compute(data.opens, data.pieces[orig]), dest);
}

function canDiscard(data, orig, dest) {
  return isMovable(data) &&
    util.containsX(data.movable.dests, move.discard);
}

function canGosterge(data, orig) {
  return isMovable(data);
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

export default {
  apiMove,
  selectTop,
  dropTop,
  dropOpens,
  isDraggable,
  isDroppableOpens,
  getDrawKeyAtDomPos,
  getDiscardKeyAtDomPos,
  getOpensKeyAtDomPos
};
