const columns = 16 * 2;
const rows = 2;

const topColumns = 16;
const topRows = 7;

const miniColumns = 20;
const miniRows = 8;

const discards = ['dup', 'dleft', 'ddown', 'dright'];
const middleCountKey = 'mmiddleCount';
const gostergeKey = 'mgosterge';

const emptyPiece = {
  color: 'empty',
  number: 1
};

function pieceEqual(p1, p2) {
  return p1.color === p2.color && p1.number === p2.number;
}

function allPosBy(rows, columns) {
  var ps = [];
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < columns; x++) {
      ps.push([x, y]);
    }
  };
  return ps;
};

var middleKeyPrefix = 'm';
var discardKeyPrefix = 'd';
var boardKeyPrefix = 'b';
var opensKeyPrefix = 'o';

function encodeKey(key, c) {
  return c + key;
}

function decodeKey(key, c) {
  return parseInt(key.slice(1));
}

function decBoardKey(key) {
  return encodeKey(decodeKey(key) - 1, boardKeyPrefix);
}

function isBoardKey(key) {
  return key[0] === boardKeyPrefix;
}

function isOpensKey(key) {
  return key[0] === opensKeyPrefix;
}

function pos2key(pos) {
  var key =  pos[1] * columns + pos[0];
  return encodeKey(key, boardKeyPrefix);
}

function key2pos(key) {
  key = decodeKey(key);
  return [key % columns, Math.floor(key / columns)];
}

const allPos = allPosBy(rows, columns);

function miniPos2key(pos) {
  var key =  pos[1] * miniColumns + pos[0];
  return encodeKey(key, opensKeyPrefix);
}

function miniKey2pos(key) {
  key = decodeKey(key);
  return [key % miniColumns, Math.floor(key / miniColumns)];
}

const miniAllPos = allPosBy(miniRows, miniColumns);

function classSet(classes) {
  var arr = [];
  for (var i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
}

function eventPosition(e) {
  return [e.clientX, e.clientY];
}

function distance(pos1, pos2) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2))
}

// this must be cached because of the access to document.body.style
var cachedTransformProp;

function computeTransformProp() {
  return 'transform' in document.body.style ?
    'transform' : 'webkitTransform' in document.body.style ?
    'webkitTransform' : 'mozTransform' in document.body.style ?
    'mozTransform' : 'oTransform' in document.body.style ?
    'oTransform' : 'msTransform';
}

function transformProp() {
  if (!cachedTransformProp) cachedTransformProp = computeTransformProp();
  return cachedTransformProp;
}

function translate(pos) {
  return 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
}

function memo(f) {
  var v, ret = function() {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = function() {
    v = undefined;
  };
  return ret;
}

module.exports = {
  topColumns: topColumns,
  topRows: topRows,
  columns: columns,
  rows: rows,
  emptyPiece: emptyPiece,
  pieceEqual: pieceEqual,
  allPos: allPos,
  pos2key: pos2key,
  key2pos: key2pos,
  miniColumns: miniColumns,
  miniRows: miniRows,
  miniAllPos: miniAllPos,
  miniPos2key: miniPos2key,
  miniKey2pos: miniKey2pos,
  encodeKey: encodeKey,
  decBoardKey: decBoardKey,
  isBoardKey: isBoardKey,
  isOpensKey: isOpensKey,
  discards: discards,
  middleCount: middleCountKey,
  gosterge: gostergeKey,
  classSet: classSet,
  eventPosition: eventPosition,
  distance: distance,
  transformProp: transformProp,
  translate: translate,
  requestAnimationFrame: (window.requestAnimationFrame || window.setTimeout).bind(window),
  memo: memo
};
