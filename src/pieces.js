import util from './util';

var colors = {
  b: 'blue',
  r: 'red',
  g: 'green',
  l: 'black'
};

var numbers = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen'
};

const allPieces = (() => {
  var ps = [];
  for (var color in colors) {
    for (var number in numbers) {
      ps.push({
        color: colors[color],
        number: numbers[number]
      });
    }
  };
  return ps;
})();

function read(pieces) {
  var res = [];
  for (var i = 0; i < pieces.length; i++) {
    res[i * 2 + 1] = pieces[i];
  }
  return res;
}

function readDiscards(discards) {
  var res = {};
  util.discards.map((discard, i) => {
    res[discard] = discards[i];
  });

  return res;
}

function readOpenGroups(groups) {
  return groups;
}

var initial = allPieces.splice(0, 20);
var initialDiscards = allPieces.splice(0, 4);

var initialOpenGroups = [
  allPieces.splice(0, 4),
  allPieces.splice(4, 8),
  allPieces.splice(8, 12),
  allPieces.splice(12, 16),
];

module.exports = {
  initial: initial,
  read: read,
  initialDiscards: initialDiscards,
  initialOpenGroups: initialOpenGroups,
  readDiscards: readDiscards,
  readOpenGroups: readOpenGroups
};
