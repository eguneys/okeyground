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

function colorSeries(group, withTore) {
  if (group.length < 3) return false;

  var groupLength = group.length;
  var groupColor = group[0].color;
  var groupKeys = group.map(_ => _.key);
  var groupKeysReverse = groupKeys.slice(0).reverse();
  var serieKeys = pieces.seriesByColor(groupColor);

  if (withTore) {
    serieKeys = serieKeys.slice(0);
    serieKeys.push(serieKeys[0]);
  }

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

function replaceFake(piece, okey) {
  var fakeOkey = pieces.makePiece(okey.c, okey.n);
  fakeOkey.isFake = true;

  return pieces.pieceFake(piece) ? fakeOkey : piece;
}

function isOkey(piece, okey) {
  return (!piece.isFake) && piece.key === okey.key;
}

// assumes there is a single okey in a group
function replaceOkey(group, okey) {
  function diff(list, sublist) {
    return list.filter(_ => sublist.indexOf(_) < 0);
  }

  function pieceEqual(p1, p2) {
    return p1.key === p2.key;
  }

  function matchRainbow(group, okey) {
    var colors = ['r', 'g', 'b', 'l'];
    var ps = group.filter(_ => !isOkey(_, okey));
    var diffColors = diff(colors, ps.map(_ => _.c));

    if (diffColors.length < 1) return group;
    if (ps.length < 1) return group;
    if (! (ps.length < group.length)) return group;

    var c = diffColors[0];
    var n = ps[0].n;

    var piece = pieces.makePiece(c, n);

    ps.push(piece);
    return ps;
  }

  function matchSerie(group, okey) {
    var rest;
    if (group.length === 0) {
      return group;
    } else if (group.length < 3) {
      // idk
      return group;
    } else {
      var [a, b, c] = group;
      var head = [a, b, c];

      rest = group.slice(3, group.length);

      if (isOkey(a, okey)) {
        if (pieceEqual(pieces.pieceUp(b), c)) {
          head = [pieces.pieceDown(b), b, c];
        } else if (pieceEqual(pieces.pieceDown(b), c)) {
          head = [pieces.pieceUp(b), b, c];
        }
      } else if (isOkey(b, okey)) {
        if (pieceEqual(pieces.pieceUp(pieces.pieceUp(a)), c)) {
          head = [a, pieces.pieceUp(a), c];
        } else if (pieceEqual(pieces.pieceDown(pieces.pieceDown(a)), c)) {
          head = [a, pieces.pieceDown(a), c];
        }
      } else if (isOkey(c, okey)) {
        if (pieceEqual(pieces.pieceUp(a), b)) {
          head = [a, b, pieces.pieceUp(b)];
        } else if (pieceEqual(pieces.pieceDown(a), b)) {
          head = [a, b, pieces.pieceDown(b)];
        }
      } else {
        rest = matchSerie(group.slice(1, group.length), okey);
        rest.unshift(group[0]);
        return rest;
      }

      return head.concat(rest);
    }
  }

  function matchPair(group, okey) {
    if (group.length != 2) {
      return group;
    } else {
      var [a, b] = group;
      if (isOkey(a, okey)) return [b, b];
      else if (isOkey(b, okey)) return [a, a];
      return group;
    }
  }

  // single okey only
  if (group.filter(_ => isOkey(_, okey)).length > 1) return group;

  if (group.length < 3) {
    return matchPair(group, okey);
  } else {
    var nonOkeys = group.filter(_ => !isOkey(_, okey));
    if (nonOkeys.every(_ => _.n === nonOkeys[0].n))
      return matchRainbow(group, okey);
    else if (nonOkeys.every(_ => _.c === nonOkeys[0].c))
      return matchSerie(group, okey);
    return group;
  }
}

function series(group, sign, withTore = false) {
  var okey = pieces.pieceUp(sign);

  var replacedFake = group.map(_ => replaceFake(_, okey));
  var replaced = replaceOkey(replacedFake, okey);

  return colorSeries(replaced, withTore) | numberSeries(replaced);
}

function pairs(group, sign) {
  if (group.length !== 2) return false;

  var okey = pieces.pieceUp(sign);

  var replacedFake = group.map(_ => replaceFake(_, okey));
  var replaced = replaceOkey(replacedFake, okey);

  var [p1, p2] = replaced;

  return p1.key === p2.key;
}

function compute(opens, piece, sign) {
  var result = [];

  var okey = pieces.pieceUp(sign);
  piece = replaceFake(piece, okey);

  opens.series.forEach((group, i) => {
    var appendLeft = group.slice(0);
    var appendRight = group.slice(0);

    appendLeft.splice(0, 0, piece);
    appendRight.splice(group.length, 0, piece);

    if (series(appendLeft, sign)) {
      result.push(pieces.getOpenSerieKeyFromGroupIndex(opens, i, 0));
    }

    if (series(appendRight, sign)) {
      result.push(pieces.getOpenSerieKeyFromGroupIndex(opens, i, group.length + 1));
    }

    var replaceOkey = group.map(_ => isOkey(_, okey)?piece:_);
    if (series(replaceOkey, sign)) {
      var okeyIndex;
      group.forEach((_, i) => { if (isOkey(_, okey)) okeyIndex = i; });
      result.push(pieces.getOpenSerieKeyFromGroupIndex(opens, i, okeyIndex + 1));
    }
  });

  opens.pairs.forEach((group, i) => {
    var replaceOkey = group.map(_ => isOkey(_, okey)?piece:_);
    if (pairs(replaceOkey, sign)) {
      var okeyIndex = findOkeyIndex(group, okey);
      result.push(pieces.getOpenPairKeyFromGroupIndex(opens, i, okeyIndex));
    }
  });

  return result;
}

function findOkeyIndex(group, okey) {
  var okeyIndex;
  group.forEach((_, i) => { if (isOkey(_, okey)) okeyIndex = i; });
  return okeyIndex;
}

export default {
  compute,
  series,
  pairs,
  findOkeyIndex
};
