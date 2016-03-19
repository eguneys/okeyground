import util from './util';
import move from './move';
import pieces from './pieces';
import open from './open';
import table from './table';

const { callUserFunction }  = util;

function playOpenSeries(data) {
  if (canOpenSeries(data)) {
    var groups = getPieceGroupKeys(data);
    groups = groups
      .filter(group => open.series(group.map(key => data.pieces[key])));
    if (groups.length > 0) {
      baseOpenSeries(data, groups);
      return true;
    }
  }
  return false;
}

function playOpenPairs(data) {
  if (canOpenPairs(data)) {
    var groups = getPieceGroupKeys(data);
    groups = groups
      .filter(group => open.pairs(group.map(key => data.pieces[key])));
    if (groups.length > 0) {
      baseOpenPairs(data, groups);
      return true;
    }
  }
  return false;
}

function apiDrawMiddleEnd(data, piece) {
  piece = pieces.readPiece(piece).piece;
  data.middleHolder.piece = piece;
  baseSettleMiddleHolder(data);
}


function baseOpenPairs(data, groups) {
  var groupPieces = groups.map(group => group.map(_ => data.pieces[_]));

  groups.forEach(group => group.map(key => delete data.pieces[key]));

  var pairs = data.opens.pairs.concat(groupPieces);
  data.opens.pairs = pairs;
  data.opens.relayout(data);
}

function baseOpenSeries(data, groups) {
  var groupPieces = groups.map(group => group.map(_ => data.pieces[_]));

  groups.forEach(group => group.map(key => delete data.pieces[key]));

  var series = data.opens.series.concat(groupPieces);
  data.opens.series = series;
  data.opens.relayout(data);
}

function baseSettleMiddleHolder(data) {
  var key = data.middleHolder.key;
  var piece = data.middleHolder.piece;
  if (key && piece) {
    data.pieces[key] = piece;
    data.middleHolder.current = false;
    data.middleHolder.key = null;
    data.middleHolder.piece = null;
  }
}

function baseUserMove(data, orig, dest) {
  if (orig === dest || !data.pieces[orig]) return false;
  var temp = data.pieces[dest];
  data.pieces[dest] = data.pieces[orig];
  data.pieces[orig] = temp;
  return true;
}

function baseUserEndDrawMiddle(data, orig, dest) {
  if (!dest || data.pieces[dest]) {
    var freeDest = findFreeDropForMiddlePiece(data);
    dest = freeDest;
  }
  callUserFunction(util.partial(data.events.move, move.drawMiddleEnd));
  data.middleHolder.key = dest;
  baseSettleMiddleHolder(data);
  return true;
}

function baseUserBeginDrawMiddle(data, orig) {
  callUserFunction(util.partial(data.events.move, move.drawMiddle));
  data.middles[util.middleCount]--;
  data.middleHolder.current = true;
  return true;
}

function baseUserDrawLeft(data, orig, dest) {
  if (data.pieces[dest]) return false;
  callUserFunction(util.partial(data.events.move, move.drawLeft));
  data.pieces[dest] = data.discards[util.discards[1]][0];
  data.discards[util.discards[1]].shift();
  return true;
}

function userMove(data, orig, dest) {
  if (dest && util.isBoardKey(orig) && util.isBoardKey(dest)) {
    if (canMove(data, orig, dest)) {
      if (baseUserMove(data, orig, dest)) {
        return true;
      }
    }
  }
}

function userBeginDrawMiddle(data, orig) {
  if (util.isMiddleKey(orig)) {
    if (canDrawMiddle(data, orig)) {
      // if (baseUserDrawMiddle(data, orig, dest)) {
      //   callUserFunction(util.partial(data.movable.events.after, move.drawMiddle));
      baseUserBeginDrawMiddle(data, orig);
      return true;
    }
  }
}

function userEndDrawMiddle(data, orig, dest) {
  //if (dest && util.isBoardKey(dest)) {
    if (util.isMiddleKey(orig)) {
      if (canEndDrawMiddle(data, orig)) {
        // if (baseUserDrawMiddle(data, orig, dest)) {
        //   callUserFunction(util.partial(data.movable.events.after, move.drawMiddle));
        baseUserEndDrawMiddle(data, orig, dest);
        return true;
      }
    }
  //}
}

function userDrawLeft(data, orig, dest) {
  if (dest && util.isBoardKey(dest)) {
    if (util.isDrawLeftKey(orig)) {
      if (canDrawLeft(data, orig, dest)) {
        if (baseUserDrawLeft(data, orig, dest)) {
          callUserFunction(util.partial(data.movable.events.after, move.drawLeft));
          return true;
        }
      }
    }
  }
}

function selectTop(data, key, selected) {
  if (selected) {
  } else {
    if (util.isMiddleKey(key)) {
      if (userBeginDrawMiddle(data, key)) {
        setSelected(data, key);
      }
    } else if (util.isDrawLeftKey(key)) {
      if (canDrawLeft(data)) {
        setSelected(data, key);
      }
    }
  }
}

function selectSquare(data, key) {
  if (data.selected) {
    if (key) {
      if (data.selected !== key) {
        if (userMove(data, data.selected, key)) {
        } else if (userDrawLeft(data, data.selected, key)) {
        } else if (userEndDrawMiddle(data, data.selected, key)) {
        }
      }
    } else {
      if (userEndDrawMiddle(data, data.selected, key)) {
      }
    }
    setSelected(data, null);
  } else if (isMovable(data, key)) {
    setSelected(data, key);
  }
}

function setSelected(data, key) {
  data.selected = key;

  if (key && util.isBoardKey(key)) {
    if (table.isDroppableOpens(data, key)) {
      data.openable.dests = open.compute(data.opens, data.pieces[key]);
    } else {
      data.openable.dests = [];
    }
  } else {
    data.openable.dests = [];
  }
}

function isTurnMovable(data) {
  return data.povSide === data.turnSide;
}

function isMovable(data, orig) {
  var piece = data.pieces[orig];
  return piece;
}

function canMove(data, orig, dest) {
  return orig != dest && isMovable(data, orig);
  //data.movable.free
}

function isDrawable(data) {
  return isTurnMovable(data);
}

function canDrawMiddle(data, orig) {
  return isDrawable(data) && !data.middleHolder.current &&
    util.containsX(data.movable.dests, move.drawMiddle);
}

function canEndDrawMiddle(data) {
  return data.middleHolder.current;
}

function canDrawLeft(data, orig, dest) {
  return isDrawable(data) && !canEndDrawMiddle(data) &&
    util.containsX(data.movable.dests, move.drawLeft);
}

function canOpenSeries(data) {
  return isTurnMovable(data) &&
    util.containsX(data.movable.dests, move.openSeries);
}

function canOpenPairs(data) {
  return isTurnMovable(data) &&
    util.containsX(data.movable.dests, move.openPairs);
}

function canLeaveTaken(data) {
  return isTurnMovable(data) &&
    util.containsX(data.movable.dests, move.leaveTaken);
}

function findFreeDropForMiddlePiece(data) {
  var nexts = util.allKeys.slice(1);
  var nnexts = util.allKeys.slice(2);
  var frees = util.allKeys.map((key, i) => {
    return [key, nexts[i], nnexts[i]];
  }).filter(([key1, key2, key3]) => {
    return key1 && key2 && key3 && !data.pieces[key1] && !data.pieces[key2] && !data.pieces[key3];
  });

  return frees[frees.length - 1][1];
}

function getKeyAtDomPosOnPiece(data, pos, bounds, except) {
  var key = getKeyAtDomPos(data, pos, bounds);

  if (!key) {
    return key;
  }

  var prevKey = util.decBoardKey(key);

  if (prevKey !== except && data.pieces[prevKey]) {
    return prevKey;
  }
  return key;
}

function getKeyAtDomPos(data, pos, bounds) {
  if (!bounds && !data.bounds) return;
  bounds = bounds || data.bounds();
  var column = Math.floor(util.columns * ((pos[0] - bounds.left) / bounds.width));
  var row = Math.floor(util.rows * ((pos[1] - bounds.top) / bounds.height));
  if (row >= 0 && row < util.rows && column >= 0 && column < util.columns)
    return util.pos2key([column, row]);
};

function getPieceGroups(data) {
  return getPieceGroupKeys(data)
    .map(group => group.map((key) => data.pieces[key]));
}

function getPieceGroupKeys(data) {
  const firstRowLastKey = util.pos2key([util.columns - 1, 0]);
  var nexts = util.allKeys.slice(1);
  var [current, groups] = util.allKeys.map((key, i) => {
    return [key, nexts[i]];
  }).reduce(([current, groups], [key1, key2]) => {
    if (data.pieces[key1]) {
      current.push(key1);
    }
    if (key1 && !data.pieces[key1] && key2 && !data.pieces[key2] ||
        key1 === firstRowLastKey) {
      if (current.length !== 0) {
        groups.push(current);
        current = [];
      }
    }

    return [current, groups];
  }, [[], []]);

  if (current.length !== 0) {
    groups.push(current);
  }

  return groups;
}

module.exports = {
  playOpenSeries: playOpenSeries,
  playOpenPairs: playOpenPairs,
  apiDrawMiddleEnd, apiDrawMiddleEnd,
  userMove: userMove,
  userDrawLeft: userDrawLeft,
  userBeginDrawMiddle: userBeginDrawMiddle,
  userEndDrawMiddle: userEndDrawMiddle,
  selectSquare: selectSquare,
  selectTop: selectTop,
  setSelected: setSelected,
  canOpenSeries: canOpenSeries,
  canOpenPairs: canOpenPairs,
  canLeaveTaken: canLeaveTaken,
  getKeyAtDomPos: getKeyAtDomPos,
  getKeyAtDomPosOnPiece: getKeyAtDomPosOnPiece,
  getPieceGroups: getPieceGroups
};
