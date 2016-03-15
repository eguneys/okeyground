import util from './util';
import move from './move';

const { callUserFunction }  = util;

function baseUserMove(data, orig, dest) {
  if (orig === dest || !data.pieces[orig]) return false;
  var temp = data.pieces[dest];
  data.pieces[dest] = data.pieces[orig];
  data.pieces[orig] = temp;
  return true;
}

function baseUserDrawMiddle(data, orig, dest) {
  if (data.pieces[dest]) return false;
  callUserFunction(util.partial(data.events.move, move.drawMiddle));
  data.middles[util.middleCount]--;
  return true;
}

function baseUserDrawLeft(data, orig, dest) {
  if (data.pieces[dest]) return false;
  callUserFunction(util.partial(data.events.move, move.drawLeft));
  data.pieces[dest] = data.discards[util.discards[1]];
  delete data.discards[util.discards[1]];
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

function userDraw(data, orig, dest) {
  if (dest && util.isBoardKey(dest)) {
    if (util.isMiddleKey(orig)) {
      if (baseUserDrawMiddle(data, orig, dest)) {
        callUserFunction(util.partial(data.movable.events.after, move.drawMiddle));
        return true;
      }
    } else if (util.isDrawLeftKey(orig)) {
      if (baseUserDrawLeft(data, orig, dest)) {
        callUserFunction(util.partial(data.movable.events.after, move.drawLeft));
        return true;
      }
    }
  }
}

function selectSquare(data, key) {
  if (data.selected) {
    if (key) {
      if (data.selected !== key) {
        if (userMove(data, data.selected, key)) {
        } else if (userDraw(data, data.selected, key)) {
        }
      }
    } else {

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
  userMove: userMove,
  userDraw: userDraw,
  selectSquare: selectSquare,
  setSelected: setSelected,
  getKeyAtDomPos: getKeyAtDomPos,
  getKeyAtDomPosOnPiece: getKeyAtDomPosOnPiece
};
