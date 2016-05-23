const columns = 16 * 2;
const rows = 2;

const topColumns = 16;
const topRows = 7;

const miniColumns = 20;
const miniRows = 8;

const allSides = ['east', 'west', 'north', 'south'];

const povMap = {
  east: { east: 'down', west: 'up', north: 'right', south: 'left' },
  west: { east: 'up', west: 'down', north: 'left', south: 'right' },
  north: { east: 'left', west: 'right', north: 'down', south: 'up' },
  south: { east: 'right', west: 'left', north: 'up', south: 'down' }
};

function findPov(povSide, turnSide) {
  return povMap[povSide][turnSide];
}

const discardPovMap = { up: 0, left: 1, down: 2, right: 3 };
const drawPovMap = { up: 3, left: 0, down: 1, right: 2 };
const vectorPovMap = {
  up: [0.5, 0],
  left: [0, 0.5],
  right: [1, 0.5],
  down: [0.5, 1]
};
const vectorByPov = (pov) => vectorPovMap[pov];

const discardByPov = (pov) => discards[discardPovMap[pov]];
const drawByPov = (pov) => discards[drawPovMap[pov]];

const discards = ['dup', 'dleft', 'ddown', 'dright'];
const middleCountKey = 'mmiddleCount';
const gostergeKey = 'mgosterge';

const topPosMap = {
  'dup': [0, 0],
  'dleft': [0, topRows - 1],
  'ddown': [topColumns - 1, topRows - 1],
  'dright': [topColumns - 1, 0],
  'mmiddleCount': [topColumns - 4, topRows - 1],
  'mgosterge': [topColumns - 3, topRows - 1]
};

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

function isMiddleKey(key) {
  return key === middleCountKey;
}

function isDrawLeftKey(key) {
  return key === discards[1];
}



function pos2key(pos) {
  var key =  pos[1] * columns + pos[0];
  return encodeKey(key, boardKeyPrefix);
}

function key2pos(key) {
  key = decodeKey(key);
  return [key % columns, Math.floor(key / columns)];
}

function topKey2pos(key) {
  return topPosMap[key];
}

function miniPos2key(pos) {
  var key =  pos[1] * miniColumns + pos[0];
  return encodeKey(key, opensKeyPrefix);
}

function miniKey2pos(key) {
  key = decodeKey(key);
  return [key % miniColumns, Math.floor(key / miniColumns)];
}

const allPos = allPosBy(rows, columns);
const miniAllPos = allPosBy(miniRows, miniColumns);

const notAllowedBoardKeys =
      [[0, 0], [30, 0], [31, 0], [32, 0], [62, 0], [63, 0]]
      .map(pos2key);

const isAllowedBoardKey = (key) => notAllowedBoardKeys.indexOf(key) === -1;

const allKeys = allPos.map(pos2key);

const allAllowedBoardKeys = allKeys.filter(isAllowedBoardKey);

function classSet(classes) {
  var arr = [];
  for (var i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
}

function containsX(xs, x) {
  return xs && xs.indexOf(x) !== -1;
}

function eventPosition(e) {
  return e.touches ? [e.targetTouches[0].clientX, e.targetTouches[0].clientY] : [e.clientX, e.clientY];
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

function partialApply(fn, args) {
  return fn.bind.apply(fn, [null].concat(args));
}

function partial() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
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

function callUserFunction(f) {
  setTimeout(f, 1);
}

const wrapPiece = (key, obj = {}) => { obj.piece = key; return obj; };
const wrapGroup = (group) => ({ group: group });
const wrapDrop = (key, pos) => ({ piece: key, pos: pos });

module.exports = {
  topColumns: topColumns,
  topRows: topRows,
  columns: columns,
  rows: rows,
  emptyPiece: emptyPiece,
  pieceEqual: pieceEqual,
  allSides: allSides,
  allPos: allPos,
  allKeys: allKeys,
  topKey2pos: topKey2pos,
  pos2key: pos2key,
  key2pos: key2pos,
  miniColumns: miniColumns,
  miniRows: miniRows,
  miniAllPos: miniAllPos,
  miniPos2key: miniPos2key,
  miniKey2pos: miniKey2pos,
  encodeKey: encodeKey,
  decBoardKey: decBoardKey,
  notAllowedBoardKeys: notAllowedBoardKeys,
  isAllowedBoardKey: isAllowedBoardKey,
  allAllowedBoardKeys: allAllowedBoardKeys,
  isBoardKey: isBoardKey,
  isOpensKey: isOpensKey,
  isMiddleKey: isMiddleKey,
  isDrawLeftKey: isDrawLeftKey,
  findPov: findPov,
  vectorByPov: vectorByPov,
  drawByPov: drawByPov,
  discardByPov: discardByPov,
  discards: discards,
  middleCount: middleCountKey,
  gosterge: gostergeKey,
  classSet: classSet,
  containsX: containsX,
  eventPosition: eventPosition,
  distance: distance,
  transformProp: transformProp,
  translate: translate,
  requestAnimationFrame: (window.requestAnimationFrame || window.setTimeout).bind(window),
  partialApply: partialApply,
  partial: partial,
  memo: memo,
  wrapPiece: wrapPiece,
  wrapGroup: wrapGroup,
  wrapDrop: wrapDrop,
  callUserFunction: callUserFunction
};
