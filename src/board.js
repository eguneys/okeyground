import util from './util';

function baseUserMove(data, orig, dest) {
  if (orig === dest || !data.pieces[orig]) return false;
  var temp = data.pieces[dest];
  data.pieces[dest] = data.pieces[orig];
  data.pieces[orig] = temp;
};

function userMove(data, orig, dest) {
  setSelected(data, null);
  if (dest && util.isBoardKey(dest)) {
    baseUserMove(data, orig, dest);
  }
}

function selectSquare(data, key) {
  if (data.selected) {
    if (key) {
      if (data.selected !== key) {
        userMove(data, data.selected, key);
      }
    } else {
      setSelected(data, null);
    }
  } else if (isMovable(data, key)) {
    setSelected(data, key);
  }
}

function setSelected(data, key) {
  data.selected = key;
}

function isMovable(data, orig) {
  var piece = data.pieces[orig];
  return true;
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
  selectSquare: selectSquare,
  setSelected: setSelected,
  getKeyAtDomPos: getKeyAtDomPos,
  getKeyAtDomPosOnPiece: getKeyAtDomPosOnPiece
};
