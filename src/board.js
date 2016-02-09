import util from './util';

function userMove(data, orig, dest) {
  if (!dest) {
  }
}

function selectSquare(data, key) {
  if (data.selected) {
    if (key) {
      if (data.selected !== key) {
        //userMove(data, data.selected, key);
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

function getKeyAtDomPos(data, pos, bounds) {
  if (!bounds && !data.bounds) return -1;
  bounds = bounds || data.bounds();
  var column = Math.floor(util.columns * ((pos[0] - bounds.left) / bounds.width));
  var row = Math.floor(util.rows * ((pos[1] - bounds.top) / bounds.height));
  if (row >= 0 && row < util.rows && column >= 0 && column < util.columns)
    return util.pos2key([column, row]);
};

module.exports = {
  selectSquare: selectSquare,
  setSelected: setSelected,
  getKeyAtDomPos: getKeyAtDomPos
};
