import util from './util';
import move from './move';
import pieces from './pieces';

const { callUserFunction }  = util;

function apiDrawMiddleEnd(data, piece) {
  piece = pieces.readPiece(piece).piece;
  data.middleHolder.piece = piece;
  baseSettleMiddleHolder(data);
}

function baseSettleMiddleHolder(data) {
  var key = data.middleHolder.key;
  var piece = data.middleHolder.piece;
  if (key && piece) {
    data.pieces[key] = piece;
    console.log('middle settled');
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
    console.log('no draw end dest found');
    dest = 10;
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
      console.log('begin draw middle');
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
        console.log('end draw middle');
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
  return data.povSide === data.turnSide;
}

function canDrawMiddle(data, orig) {
  return isDrawable(data) && !data.middleHolder.current;
}

function canEndDrawMiddle(data) {
  return data.middleHolder.current;
}

function canDrawLeft(data, orig, dest) {
  return isDrawable(data) && !canEndDrawMiddle(data);
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

module.exports = {
  apiDrawMiddleEnd, apiDrawMiddleEnd,
  userMove: userMove,
  userDrawLeft: userDrawLeft,
  userBeginDrawMiddle: userBeginDrawMiddle,
  userEndDrawMiddle: userEndDrawMiddle,
  selectSquare: selectSquare,
  selectTop: selectTop,
  setSelected: setSelected,
  getKeyAtDomPos: getKeyAtDomPos,
  getKeyAtDomPosOnPiece: getKeyAtDomPosOnPiece
};
