import pieces from './pieces';
import util from './util';

function sortSeries(data) {
  function findDownSeries(piece, key, inpieces) {

    for (var key2 in inpieces) {
      var piece2 = inpieces[key2];
      if (key2 === key) continue;

      if (piece2.c === piece.c) {
        if (piece2.n === 1 && piece.n === 2) {
          return [{ [key2]: piece2 }];
        }
        if ((piece2.n === 13 && piece.n === 1) || piece2.n === piece.n - 1) {
          return [{ [key2]: piece2 }, ...findDownSeries(piece2, key2, inpieces)];
        }
      }
    }
    return [];
  }

  function findUpSeries(piece, key, inpieces) {

    for (var key2 in inpieces) {
      var piece2 = inpieces[key2];
      if (key2 === key) continue;


      if (piece2.c === piece.c) {
        if (piece2.n === 1 && piece.n === 13) {
          return [{ [key2]: piece2 }];
        }
        if (piece2.n === piece.n + 1) {
          return [{ [key2]: piece2 }, ...findUpSeries(piece2, key2, inpieces) ];
        }
      }
    }
    return [];
  }

  function findSameSeries(piece, key, inpieces) {
    var group = {};
    for (var key2 in inpieces) {
      var piece2 = inpieces[key2];

      if (key2 === key) continue;

      if (piece2.n === piece.n && piece2.c !== piece.c) {
        group[piece2.c] = { [key2]: piece2 };
      }
    }
    // https://stackoverflow.com/questions/55666443/object-values-spread-into-each-other
    // return Object.assign({}, ...Object.values(group));
    return Object.values(group);
  }

  function findBestSeries(inpieces) {
    var inter = {};

    for (var key in inpieces) {
      var piece = inpieces[key];

      if (!piece) continue;

      inter[key] = {
        'downs': findDownSeries(piece, key, inpieces),
        'ups': findUpSeries(piece, key, inpieces),
        'same': findSameSeries(piece, key, inpieces)
      };
    }

    var maxValue = {
      type: null,
      key: null,
      value: 0
    };

    for (var k in inter) {
      var v = inter[k];
      ['downs', 'ups', 'same'].map(function(type) {
        if (v[type].length >= maxValue.value) {
          maxValue.type = type;
          maxValue.key = k;
          maxValue.value = v[type].length;
        }
      });
    }

    var maxGroup = inter[maxValue.key][maxValue.type];

    // if (inpieces[maxValue.key].c=="g") debugger;
    if (maxValue.type === 'downs') {
      maxGroup.unshift({ [maxValue.key]: inpieces[maxValue.key] });
    } else {
      maxGroup.unshift({ [maxValue.key]: inpieces[maxValue.key]});
    }

    return maxGroup;
  }

  // make compact
  for (var k in data.pieces) { if (!data.pieces[k]) delete data.pieces[k]; }

  var pieces = Object.assign({}, data.pieces);
  var groups = {};

  for (k in data.pieces) { data.pieces[k] = undefined; delete data.pieces[k]; }

  var boardIterator = 1;
  while (Object.keys(pieces).length > 0) {
    var group = findBestSeries(pieces);
    var amount = group.length;

    boardIterator = util.nextIteratorForGroup(boardIterator, amount);

    group.forEach(function (item, i) {
      for (var key in item) {
        var piece = item[key];
        data.pieces[util.iterator2Key(boardIterator + i * 2)] = piece;
        pieces[key] = undefined;
        delete pieces[key];
      }
    });
    boardIterator += amount * 2 + 1;
  }

  console.log(data.pieces);
  // console.log(findBestSeries(data.pieces));
}

function sortPairs(data) {
  var groups = {};

  for (var key in data.pieces) {
    var piece = data.pieces[key];

    if (!piece) continue;

    if (groups[piece.key]) {
      groups[piece.key]++;
    } else {
      groups[piece.key] = 1;
    }
    delete data.pieces[key];
  }

  var boardIterator = 1;
  
  for (var pieceKey in groups) {
    var amount = groups[pieceKey];

    boardIterator = util.nextIteratorForGroup(boardIterator, amount);

    for (var i = 0; i < amount; i++)
      data.pieces[util.iterator2Key(boardIterator + i * 2)] = pieces.readPiece(pieceKey).piece;

    boardIterator += amount * 2 + 1;
  }
}

module.exports = {
  sortPairs: sortPairs,
  sortSeries: sortSeries
};
