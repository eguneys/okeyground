import util from './util';
import move from './move';
import pieces from './pieces';
import open from './open';
import board from './board';

const { wrapDrop, wrapPiece, wrapGroup, callUserFunction }  = util;

const pushLastMove = (data, k) => {
  if (!data.lastMove) data.lastMove = [];
  data.lastMove.push(k);
};

function apiMove(data, mmove, args = {}) {
  var { piece, group, pos } = args;
  if (data.turnSide === data.povSide) {
    switch (mmove) {
    case move.discard:
      piece = pieces.readPiece(piece).piece;
      baseForceDropDiscard(data, piece, util.discards[2]);
      break;
    case move.drawMiddle:
      piece = pieces.readPiece(piece).piece;
      if (data.middleHolder.current) {
        board.apiDrawMiddleEnd(data, piece);
      } else {
        board.apiForceDrawMiddleEnd(data, piece);
      }
    }
  } else {
    const pov = util.findPov(data.povSide, data.turnSide);
    switch (mmove) {
    case move.drawMiddle:
      baseOpponentDrawMiddle(data);
      data.animation.current.hint = move.drawMiddle;
      break;
    case move.drawLeft:
      baseOpponentDrawLeft(data, util.drawByPov(pov));
      data.animation.current.hint = move.drawLeft;
      break;
    case move.discard:
      piece = pieces.readPiece(piece).piece;
      baseOpponentDiscard(data, util.discardByPov(pov), piece);
      data.animation.current.hint = move.discard;
      break;
    case move.leaveTaken:
      piece = pieces.readPiece(piece).piece;
      baseOpponentLeaveTaken(data, util.drawByPov(pov), piece);
      break;
    case move.openSeries:
      group = pieces.readPieceGroup(group);
      baseOpponentOpenSeries(data, group);
      break;
    case move.openPairs:
      group = pieces.readPieceGroup(group);
      baseOpponentOpenPairs(data, group);
      break;
    case move.dropOpenSeries:
      piece = pieces.readPiece(piece).piece;
      pos = pieces.readDropPos(pos);
      baseOpponentDropSeries(data, piece, pos);
      break;
    case move.dropOpenPairs:
      piece = pieces.readPiece(piece).piece;
      pos = pieces.readDropPos(pos);
      baseOpponentDropPairs(data, piece, pos);
      break;
    default: console.error('unknown move');
    }
  }
};

function baseOpponentDropSeries(data, piece, pos) {
  var { type, groupIndex } = pos;
  var group = data.opens.series[groupIndex];

  var isAppend = (type !== move.dropReplace) ? 0: 1;

  var index = 0;

  if (type === move.dropLeft) {
    index = 0;
  } else if (type === move.dropRight) {
    index = group.length + 1;
  } else {
    var okey = pieces.pieceUp(data.middles[util.gosterge]);
    index = open.findOkeyIndex(group, okey) + 1;
  }

  group.splice(index - isAppend, isAppend, piece);

  data.opens.relayout(data);
}

function baseOpponentDropPairs(data, piece, pos) {
  var { groupIndex } = pos;
  var group = data.opens.pairs[groupIndex];

  var okey = pieces.pieceUp(data.middles[util.gosterge]);
  var index = open.findOkeyIndex(group, okey);

  group.splice(index, 1, piece);

  data.opens.relayout(data);
}

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
  data.lastMove = [dest];
  //pushLastMove(data, dest);
  return true;
}

function baseOpponentDrawMiddle(data) {
  data.middles[util.middleCount]--;
  data.lastMove = [util.middleCount];
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

function baseDropOpenSeries(data, orig, dest, pos) {
  if (!data.pieces[orig] || !pos) return false;
  var piece = data.pieces[orig];

  callUserFunction(util.partial(data.events.move, move.dropOpenSeries, wrapPiece(piece.key)));

  var [groupIndex, index] = pos;
  var group = data.opens.series[groupIndex];
  var dropType = getDropType(group, index);

  var isAppend = (dropType !== move.dropReplace) ? 0: 1;

  group.splice(index - isAppend, isAppend, piece);

  data.opens.relayout(data);

  delete data.pieces[orig];

  if (dropType === move.dropReplace) {
    var okey = pieces.pieceUp(data.middles[util.gosterge]);
    data.pieces[orig] = okey;
  }

  return true;
}
function baseDropOpenPairs(data, orig, dest, pos) {
  if (!data.pieces[orig] || !pos) return false;
  var piece = data.pieces[orig];

  callUserFunction(util.partial(data.events.move, move.dropOpenPairs, wrapPiece(piece.key)));

  var [groupIndex, index] = pos;
  var group = data.opens.pairs[groupIndex];

  group.splice(index, 1, piece);

  data.opens.relayout(data);

  delete data.pieces[orig];

  // always replace okey
  if (true) {
    var okey = pieces.pieceUp(data.middles[util.gosterge]);
    data.pieces[orig] = okey;
  }

  return true;
}

function baseForceDropDiscard(data, piece, dest) {
  for (var orig in data.pieces) {
    var piece2 = data.pieces[orig];
    if (piece2 && util.pieceEqual(piece, piece2)) {
      baseDropDiscard(data, orig, dest);
      return true;
    }
  };
  return false;
}

function baseDropDiscard(data, orig, dest) {
  const piece = data.pieces[orig];
  if (!piece) return false;
  callUserFunction(util.partial(data.events.move, move.discard, wrapPiece(piece.key)));
  data.discards[dest].unshift(data.pieces[orig]);
  delete data.pieces[orig];
  //pushLastMove(data, dest);
  data.lastMove = [dest];
  return true;
}

function baseGosterge(data, orig) {
  var piece = data.pieces[orig];
  if (!piece) return false;
  if (util.pieceEqual(piece, data.middles[util.gosterge])) {
    callUserFunction(util.partial(data.events.move, move.sign, wrapPiece(piece.key)));
    return true;
  }
  return false;
}

function baseDiscardEnd(data, orig) {
  var piece = data.pieces[orig];
  if (!piece) return false;

  delete data.pieces[orig];

  var discardFen = pieces.write(data.pieces);
  var series = board.getPieceGroupSeries(data);
  var pairs = board.getPieceGroupPairs(data);

  if (pieces.validDuzOkeyGroupFen(series)) {
    callUserFunction(util.partial(data.events.move, move.discardEndSeries, wrapGroup(series)));
  } else if (pieces.validDuzOkeyGroupFen(pairs)) {
    callUserFunction(util.partial(data.events.move, move.discardEndPairs, wrapGroup(pairs)));
  } else {
    data.pieces[orig] = piece;
    return false;
  }

  return true;
}

function getDropType(group, index) {
  if (index === 0) {
    return move.dropLeft;
  } else if (index === group.length + 1) {
    return move.dropRight;
  } else {
    return move.dropReplace;
  }
}

function dropOpens(data, orig, dest) {
  if (dest && util.isOpensKey(dest)) {
    if (canDropOpens(data, orig, dest)) {
      var piece = data.pieces[orig];
      var groupIndex, index, group, dropType, dropKey;

      var seriePos = pieces.getOpenSerieFromPos(data, util.miniKey2pos(dest));
      if (seriePos) {
        [groupIndex, index] = seriePos;
        group = data.opens.series[groupIndex];
        dropType = getDropType(group, index);
        dropKey = dropType + groupIndex;
      }
      if (baseDropOpenSeries(data, orig, dest, seriePos)) {
        callUserFunction(util.partial(data.movable.events.after, move.dropOpenSeries, wrapDrop(piece.key, dropKey)));
        return true;
      } else {
        var pairPos = pieces.getOpenPairFromPos(data, util.miniKey2pos(dest));
        if (pairPos) {
          [groupIndex, index] = pairPos;
          group = data.opens.pairs[groupIndex];
          dropType = getDropType(group, index);
          dropKey = dropType + groupIndex;
        }
        if (baseDropOpenPairs(data, orig, dest, pairPos)) {
          callUserFunction(util.partial(data.movable.events.after, move.dropOpenPairs, wrapDrop(piece.key, dropKey)));
          return true;
        }
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
        callUserFunction(util.partial(data.movable.events.after, move.discard, wrapPiece(piece.key)));
        return true;
      }
    }
  } else if (dest === util.gosterge) {
    if (canGosterge(data, orig)) {
      if (baseGosterge(data, orig)) {
        callUserFunction(util.partial(data.movable.events.after, move.sign, wrapPiece(piece.key)));
        return true;
      }
    }
    if (canDiscardEnd(data, orig)) {
      if (baseDiscardEnd(data, orig)) {
        var discardFen = pieces.write(data.pieces);
        var series = board.getPieceGroupSeries(data);
        var pairs = board.getPieceGroupPairs(data);

        if (pieces.validDuzOkeyGroupFen(series)) {
          callUserFunction(util.partial(data.movable.events.after, move.discardEndSeries, wrapGroup(series)));
        } else if (pieces.validDuzOkeyGroupFen(pairs)) {
          callUserFunction(util.partial(data.movable.events.after, move.discardEndPairs, wrapGroup(pairs)));
        }
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

function isMovable(data) {
  return data.povSide === data.turnSide;
}

function canDropOpens(data, orig, dest) {
  var sign = data.middles[util.gosterge];
  return board.isDroppableOpens(data, orig) &&
    util.isBoardKey(orig) &&
    util.isOpensKey(dest) &&
    util.containsX(data.movable.dests, move.dropOpenSeries) &&
    util.containsX(data.movable.dests, move.dropOpenPairs) &&
    util.containsX(open.compute(data.opens, data.pieces[orig], sign), dest);
}

function canDiscard(data, orig, dest) {
  return isMovable(data) &&
    util.containsX(data.movable.dests, move.discard);
}

function canDiscardEnd(data, orig) {
  return isMovable(data) &&
    util.containsX(data.movable.dests, move.discardEndSeries);
}

function canGosterge(data, orig) {
  return isMovable(data) &&
    util.containsX(data.movable.dests, move.showSign);
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
  getDrawKeyAtDomPos,
  getDiscardKeyAtDomPos,
  getOpensKeyAtDomPos
};
