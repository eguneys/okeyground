import util from './util';
import move from './move';

// https://gist.github.com/gre/1650294
var easing = {
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }
}

function computePlan(prev, current) {
  var currentAnim = current.animation.current;
  var pov = util.findPov(current.povSide, current.turnSide);
  var turnVector = util.vectorByPov(pov);
  var bounds = current.bounds(),
      aspectRatio = 4/3,
      boardWidth = bounds.width * 1,
      boardHeight = bounds.height * (aspectRatio / (38 * 16 / 50 * 2)),
      topRatio = (38 * 16) / (50 * 7),
      topWidth = boardWidth,
      topHeight = bounds.height * (aspectRatio / topRatio),
      topPieceWidth = topWidth * (6.25 / 100),
      topPieceHeight = topHeight * 0.14,
      width = boardWidth * (6.25 / 100),
      height = boardHeight * 0.5,
      anims = {},
      fadings = [];


  var orig, dest, vector;
  if (currentAnim.hint === move.drawMiddle) {
    orig = [topPieceWidth * (16 - 4), topHeight];
    dest = [topWidth * turnVector[0], topHeight * turnVector[1]];
    var vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
    anims[util.middleCount] = [vector, vector, true];
  } else if (currentAnim.hint === move.discard) {
    var key = util.discardByPov(pov);
    var topPos = util.topKey2pos(key);
    orig = [topPieceWidth * topPos[0], topPieceHeight * topPos[1]];
    dest = [topWidth * turnVector[0], topHeight * turnVector[1]];
    vector = [(dest[0] - orig[0]), (dest[1] - orig[1])];
    anims[key] = [vector, vector];
  }


  return {
    anims: anims,
    fadings: fadings
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
    for (var key in data.animation.current.anims) {
      var cfg = data.animation.current.anims[key];
      cfg[1] = [roundBy(cfg[0][0] * ease, 10), roundBy(cfg[0][1] * ease, 10)];
      if (cfg[2]) {
        cfg[1] = [cfg[0][0] - cfg[1][0], cfg[0][1] - cfg[1][1]];
      }
    }
    for (var i in data.animation.current.fadings) {
      data.animations.current.fadings[i].opacity = roundBy(ease, 100);
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
    middles: {}
  };

  // clone pieces
  for (var key in data.pieces) {
    if (!data.pieces[key]) continue;
    prev.pieces[key] = {
      color: data.pieces[key].color,
      number: data.pieces[key].number
    };
  }

  var result = transformation();
  var plan = computePlan(prev, data);

  if (Object.keys(plan.anims).length > 0 || plan.fadings.length > 0) {
    var alreadyRunning = data.animation.current.start;
    data.animation.current = {
      start: new Date().getTime(),
      duration: data.animation.duration,
      anims: plan.anims,
      fadings: plan.fadings
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
