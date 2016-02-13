import util from './util';

function getOpensKeyAtDomPos(data, pos, bounds) {
  if (!bounds && !data.bounds) return;
  bounds = bounds || data.bounds();
  var column = Math.floor(util.miniColumns * ((pos[0] - bounds.left) / bounds.width));
  var row = Math.floor(util.miniRows * ((pos[1] - bounds.top) / bounds.height));
  if (row >= 0 && row < util.miniRows && column >= 0 && column < util.miniColumns)
    return util.miniPos2key([column, row]);
};

module.exports = {
  getOpensKeyAtDomPos: getOpensKeyAtDomPos
};
