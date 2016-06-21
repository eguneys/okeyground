import util from './util';
import move from './move';

// https://gist.github.com/gre/1650294
var easing = {
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }
};

function opensKeyDistance(topBounds, key) {
  var openWidth = topBounds.width * (70 / 100);
  var openHeight = topBounds.height * (70 / 100);

  var pos = util.miniKey2pos(key);
  var delta = [pos[0] * (openWidth / util.miniColumns),
               pos[1] * (openHeight / util.miniRows)];
  return delta;
}

function boardTopDistance(boardBounds, topBounds, key) {
  var pos = util.key2pos(key);
  var delta = [pos[0] * (boardBounds.width / util.columns),
               pos[1] * boardBounds.height * 0.5];

  var topDelta = [boardBounds.left - topBounds.left,
                  boardBounds.top - topBounds.top];

  return [topDelta[0] + delta[0], topDelta[1] + delta[1]];
}

function arrPlus(arr1, arr2) {
  return [arr1[0] + arr2[0], arr1[1] + arr2[1]];
}
function arrMinus(arr1, arr2) {
  return [arr1[0] - arr2[0], arr1[1] - arr2[1]];
}

function closer(piece, pieces) {
  return pieces[0];
  return pieces.sort(function(p1, p2) {
    return util.distance(piece.distance, p1.distance) -
      util.distance(piece.distance, p2.distance);
  })[0];
}

function makePiece(key, piece, distance) {
  return {
    key: key,
    distance: distance,
    color: piece.color,
    number: piece.number
  };
}

function computePlan(prev, current) {
  var currentAnim = current.animation.current;
  var pov = util.findPov(current.povSide, current.turnSide);
  var turnVector = util.vectorByPov(pov);
  var bounds = current.bounds(),
      topBounds = current.topBounds(),
      boardBounds = current.boardBounds(),
      boardWidth = boardBounds.width,
      boardHeight = boardBounds.height,
      topWidth = topBounds.width,
      topHeight = topBounds.height,
      // aspectRatio = 4/3,
      // boardWidth = bounds.width * 1,
      // boardHeight = bounds.height * (aspectRatio / (38 * 16 / 50 * 2)),
      // topRatio = (38 * 16) / (50 * 7),
      // topWidth = boardWidth,
      // topHeight = bounds.height * (aspectRatio / topRatio),
      topPieceWidth = topWidth * (6.25 / 100),
      topPieceHeight = topHeight * 0.14,
      width = boardWidth * (6.25 / 100),
      height = boardHeight * 0.5,
      anims = {},
      fadings = [],
      scales = {},
      extra = {};

  var discardKey = util.discardByPov(pov);
  var drawKey = util.drawByPov(pov);

  var drawPos = util.topKey2pos(drawKey);
  var discardPos = util.topKey2pos(discardKey);
  var turnPos = [topWidth * turnVector[0],
                 topHeight * turnVector[1] +
                 ((pov==='up') ? -topPieceHeight :
                  ((pov==='left') ? -topPieceHeight / 2 : 0))];

  var topMiddleDistance = [topPieceWidth * (16 - 4),
                           topHeight - topPieceHeight];
  var topDiscardDistance = [topPieceWidth * discardPos[0],
                            topPieceHeight * discardPos[1]];
  var topDrawDistance = [topPieceWidth * drawPos[0],
                         topPieceHeight * drawPos[1]];

  var topOpenDistance = [topPieceWidth * 1,
                         topPieceHeight * 1];


  var missings = [], news = [];
  var openMissings = [], openNews = [];

  var orig, dest, vector;
  if (pov === 'down') {
    var i, key, curP, preP;
    for (i = 0; i < util.allAllowedBoardKeys.length; i++) {
      key = util.allAllowedBoardKeys[i];
      curP = current.pieces[key];
      preP = prev.pieces[key];
      var topDistance = boardTopDistance(boardBounds, topBounds, key);
      if (!curP && preP) {
        missings.push(makePiece(key, preP, topDistance));
      } else if (curP && !preP) {
        news.push(makePiece(key, curP, topDistance));
      }
    }

    for (i = 0; i < util.miniAllKeys.length; i++) {
      key = util.miniAllKeys[i];
      curP = current.opens.layout ? current.opens.layout.layout[key] : null;
      preP = prev.opens.layout ? prev.opens.layout.layout[key] : null;
      var openDistance = opensKeyDistance(topBounds, key);

      if (curP && !preP) {
        openNews.push(makePiece(key, curP, openDistance));
      } else if (!curP & preP) {
        openMissings.push(makePiece(key, preP, openDistance));
      }
    }

    if (currentAnim.hint === move.drawMiddle) {
      key = news[0].key;
      orig = news[0].distance;
      orig = arrMinus(orig, topMiddleDistance);
      dest = [0, 0];
      vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
      anims[key] = [vector, vector];
    } else if (currentAnim.hint === move.discard) {
      dest = missings[0].distance;
      dest = arrMinus(dest, topDiscardDistance);
      orig = [0, 0];
      vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
      anims[discardKey] = [vector, vector];
    } else if (currentAnim.hint === move.leaveTaken) {
      dest = missings[0].distance;
      dest = arrMinus(dest, topDrawDistance);
      orig = [0, 0];
      vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
      anims[drawKey] = [vector, vector];
    } else if (currentAnim.hint === move.openSeries) {
      openNews.forEach(function(newP, i) {
        var preP = closer(newP,
                          missings
                          .filter(util.partial(util.pieceEqual, newP)));
        missings.splice(missings.indexOf(preP), 1);

        if (preP) {
          dest = preP.distance;
          dest = arrMinus(preP.distance, [width, 0]);
          dest = arrMinus(dest, topOpenDistance);
          dest = arrMinus(dest, newP.distance);
          orig = [0, 0];
          vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
          anims[newP.key] = [vector, vector];
          scales[newP.key] = [1.75, 1.75];
        }
      });
    }
  } else {
    if (currentAnim.hint === move.drawMiddle) {
      orig = [topPieceWidth * (16 - 4), topHeight];
      dest = turnPos;
      vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
      anims[util.middleCount] = [vector, vector, true];
    } else if (currentAnim.hint === move.discard) {
      orig = [topPieceWidth * discardPos[0], topPieceHeight * discardPos[1]];
      dest = turnPos;
      vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
      anims[discardKey] = [vector, vector];
    } else if (currentAnim.hint === move.drawLeft) {
      orig = [topPieceWidth * drawPos[0], topPieceHeight * drawPos[1]];
      dest = turnPos;
      vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
      anims[move.drawLeft + drawKey] = [vector, vector, true];
      extra.piece = prev.discards[drawKey];
    } else if (currentAnim.hint === move.openSeries) {
      console.log(news, missings);
    }
  }

  return {
    anims: anims,
    fadings: fadings,
    scales: scales,
    extra: extra
  };
}

function roundBy(n, by) {
  return Math.round(n * by) / by;
}

function go(data) {
  if (!data.animation.current.start) return; // animation was cancelled
  var rest = 1 - (new Date().getTime() - data.animation.current.start) / data.animation.current.duration;

  if (rest <= 0) {
    data.animation.current = {};
    data.render();
  } else {
    var ease = easing.easeInOutCubic(rest);
    var cfg;
    for (var key in data.animation.current.anims) {
      cfg = data.animation.current.anims[key];
      cfg[1] = [roundBy(cfg[0][0] * ease, 10), roundBy(cfg[0][1] * ease, 10)];
      if (cfg[2]) {
        cfg[1] = [cfg[0][0] - cfg[1][0], cfg[0][1] - cfg[1][1]];
      }
    }
    var i;
    for (i in data.animation.current.fadings) {
      data.animations.current.fadings[i].opacity = roundBy(ease, 100);
    }
    for (i in data.animation.current.scales) {
      cfg = data.animation.current.scales[i];
      cfg[0] = 1 + roundBy(0.7 * ease, 10);
      cfg[1] = 1 + roundBy(0.7 * ease, 10);
    }
    data.render();
    util.requestAnimationFrame(function() {
      go(data);
    });
  }
}

function animate(transformation, data) {
  // clone data
  var prev = {
    pieces: {},
    opens: {},
    middles: {},
    discards: {}
  };

  var key;
  // clone pieces
  for (key in data.pieces) {
    if (!data.pieces[key]) continue;
    prev.pieces[key] = {
      color: data.pieces[key].color,
      number: data.pieces[key].number
    };
  }
  // clone discards
  for (key in data.discards) {
    if (!data.discards[key] || !data.discards[key][0]) continue;
    prev.discards[key] = {
      color: data.discards[key][0].color,
      number: data.discards[key][0].number
    };
  }

  if (data.opens.layout) {
    var miniP;
    prev.opens.layout = {layout: {}};
    for (key in data.opens.layout.layout) {
      miniP = data.opens.layout.layout[key];
      prev.opens.layout.layout[key] = {
        color: miniP.color,
        number: miniP.number
      };
    }
  }

  var result = transformation();
  var plan = computePlan(prev, data);

  if (Object.keys(plan.anims).length > 0 || plan.fadings.length > 0) {
    var alreadyRunning = data.animation.current.start;
    data.animation.current = {
      start: new Date().getTime(),
      duration: data.animation.duration,
      anims: plan.anims,
      fadings: plan.fadings,
      scales: plan.scales,
      extra: plan.extra
    };
    if (!alreadyRunning) go(data);
  } else {
    // don't animate, just render right away
    data.renderRAF();
  }
  return result;
}

// transformation is a function
// accepts board data and any number of arguments,
// and mutates the board.
module.exports = function(transformation, data) {
  return function() {
    var transformationArgs = [data].concat(Array.prototype.slice.call(arguments, 0));
    if (data.animation.enabled) {
      return animate(util.partialApply(transformation, transformationArgs), data);
    } else {
      var result = transformation.apply(null, transformationArgs);
      data.renderRAF();
      return result;
    }
  };
};
