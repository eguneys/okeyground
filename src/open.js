import pieces from './pieces';

function isMatch(g1, g2) {
  return g1.length === g2.length && g1.every((p, i) => p === g2[i]);
}

function isColorMatch(colors, group) {
  return group.every((p, i) => p.color === colors[i]);
}

const colorCombinations = (() => {
  var colors = pieces.colors;
  var ps = [];
  for (var c1 in colors) {
    for (var c2 in colors) {
      for (var c3 in colors) {
        for (var c4 in colors) {
          if (c1 !== c2 && c1 !== c3 && c1 !== c4 && c2 !== c3 && c2 !== c4 && c3 !== c4)
            ps.push([colors[c1], colors[c2], colors[c3], colors[c4]]);
        }
      }
    }
  }
  return ps;
})();

function colorSeries(group) {
  if (group.length < 3) return false;

  var groupLength = group.length;
  var groupColor = group[0].color;
  var groupKeys = group.map(_ => _.key);
  var groupKeysReverse = groupKeys.slice(0).reverse();
  var serieKeys = pieces.seriesByColor(groupColor);

  for (var i = 0; i <= serieKeys.length - groupLength; i++) {
    var matchKeys = serieKeys.slice(i, i + groupLength);
    if (isMatch(matchKeys, groupKeys) |
        isMatch(matchKeys, groupKeysReverse)) {
      return true;
    }
  }

  return false;
}

function numberSeries(group) {
  var groupLength = group.length;
  var groupNumber = group[0].number;

  if (!(groupLength === 3 | groupLength === 4)) return false;

  if (!group.every(p => p.number === groupNumber)) return false;

  return colorCombinations
    .some(comb => isColorMatch(comb.slice(0, group.length), group));
}

function series(group) {
  return colorSeries(group) | numberSeries(group);
}

function pairs(group) {
  if (group.length !== 2) return false;
  var [p1, p2] = group;

  return p1.key === p2.key;
}

function compute(opens, piece) {
  var result = [];

  opens.series.forEach((group, i) => {
    var appendLeft = group.slice(0);
    var appendRight = group.slice(0);

    appendLeft.splice(0, 0, piece);
    appendRight.splice(group.length, 0, piece);

    if (series(appendLeft)) {
      result.push(pieces.getOpenSerieKeyFromGroupIndex(opens, i, 0));
    }

    if (series(appendRight)) {
      result.push(pieces.getOpenSerieKeyFromGroupIndex(opens, i, group.length + 1));
    }
  });

  return result;
}

export default {
  compute,
  series,
  pairs
};
