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
  return pieces;
}

var initial = allPieces.splice(0, 20);

module.exports = {
  initial: initial,
  read: read
};
