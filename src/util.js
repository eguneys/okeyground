const columns = 16;
const rows = 2;

function pos2key(pos) {
  return pos[1] * columns + pos[0];
}

function key2pos(key) {
  return [key % columns, Math.floor(key / columns)];
}

const allPos = (() => {
  var ps = [];
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < columns; x++) {
      ps.push([x, y]);
    }
  };
  return ps;
})();

module.exports = {
  columns: columns,
  rows: rows,
  allPos: allPos,
  pos2key: pos2key,
  key2pos: key2pos
};
