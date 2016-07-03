import m from 'mithril';
import drag from './drag';
import draw from './draw';
import util from './util';
import move from './move';

function pieceClass(p) {
  return p.color + ' ' + p.number;
}

function posStyle(pos) {
  return {
    left: pos[0] * (100 / util.columns) + '%',
    top: pos[1] * (100 / util.rows) + '%'
  };
}

function miniPosStyle(pos) {
  return {
    left: pos[0] * (100 / util.miniColumns) + '%',
    top: pos[1] * (100 / util.miniRows) + '%'
  };
}

function renderMiniPiece(ctrl, pos, key, p) {
  var d = ctrl.data;

  var attrs = {
    key: key,
    style: miniPosStyle(pos),
    class: pieceClass(p) + ' mini'
  };

  if (ctrl.data.animation.current.anims) {
    var animation = ctrl.data.animation.current.anims[key];
    var scaling = ctrl.data.animation.current.scales[key];
    if (animation) {
      attrs.class += ' animating';
      attrs.style[util.transformProp()] = util.translate(animation[1]);
      if (scaling) {
        attrs.style[util.transformProp()] += ` scale(${scaling[0]}, ${scaling[1]})`;
        attrs.style.transformOrigin = 'center';
      }
    }
  }

  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderMiddlePiece(ctrl, key, p, drag = false) {
  var d = ctrl.data;

  var classes = util.classSet({
    'selected': d.selected === key,
    'last-move': d.lastMove &&  util.containsX(d.lastMove, key)
  });

  var attrs = {
    style: {},
    class: [pieceClass(p), key, classes].join(' '),
    'data-middle-count': ctrl.data.middles[key]
  };

  var draggable = ctrl.data.draggable.current;
  if (drag && draggable.orig === key) {
    attrs.style[util.transformProp()] = util.translate([
      draggable.pos[0] + draggable.dec[0],
      draggable.pos[1] + draggable.dec[1]
    ]);
    attrs.class += ' dragging';
  } else if (!drag && ctrl.data.animation.current.anims) {
    var animation = ctrl.data.animation.current.anims[key];
    if (animation) {
      attrs.class += ' animating';
      attrs.style[util.transformProp()] = util.translate(animation[1]);
    }
  }

  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderTopPiece(ctrl, key, p, klass, drag = true, animKey = key) {
  var d = ctrl.data;

  var classes = util.classSet({
    'selected': d.selected === key
  });

  var attrs = {
    style: {},
    class: [pieceClass(p), key, classes].join(' ')
  };

  if (klass) attrs.class += ' ' + klass;

  var draggable = ctrl.data.draggable.current;
  if (drag && draggable.orig === key) {
    attrs.style[util.transformProp()] = util.translate([
      draggable.pos[0] + draggable.dec[0],
      draggable.pos[1] + draggable.dec[1]
    ]);
    attrs.class += ' dragging';
  } else if (drag && ctrl.data.animation.current.anims) {
    var animation = ctrl.data.animation.current.anims[animKey];
    if (animation) {
      attrs.class += ' animating';
      attrs.style[util.transformProp()] = util.translate(animation[1]);
    }
  }

  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderTopPieceHolder(ctrl, key, klass) {
  var d = ctrl.data;

  var classes = util.classSet({
    'piece-holder': true
  });

  var attrs = {
//    key: key,
    style: {},
    class: [key, classes, klass].join(' ')
  };

  return {
    tag: 'div',
    attrs: attrs
  };
}

function withFlipper(front, back, flip, klass) {
  var classes = "flipper" + (flip ? ' hover': '') + ' ' + klass;

  var resetStyle = {
    top: 0,
    left: 0
  };
  var posStyle = front.attrs.style;
  front.attrs.style = resetStyle;
  back.attrs.style = resetStyle;

  var attrs = {
    class: classes,
    style: posStyle
  };

  return {
    tag: 'div',
    attrs: attrs,
    children: [{
      tag: 'div',
      attrs: { class: 'front' },
      children: [front]
    }, {
      tag: 'div',
      attrs: { class: 'back' },
      children: [back]
    }]
  };
}

function renderPiece(ctrl, pos, key, p, klass) {
  var d = ctrl.data;

  var classes = util.classSet({
    'selected': d.selected === key
  });

  var attrs = {
    key: key,
    style: posStyle(pos),
    class: [pieceClass(p), classes].join(' ')
  };

  if (klass) {
    attrs.class += ' ' + klass;
  }

  var draggable = ctrl.data.draggable.current;
  if (draggable.dragGroup && draggable.dragGroup.indexOf(key) !== -1) {
    attrs.style[util.transformProp()] = util.translate([
      draggable.pos[0] + draggable.dec[0],
      draggable.pos[1] + draggable.dec[1]
    ]);
    attrs.class += ' group dragging';
  } else if (draggable.orig === key) {

    if (draggable.over && util.isOpensKey(draggable.over)) {
      attrs.style['width'] = draggable.opensBounds.width / util.miniColumns + 'px';
      attrs.style['height'] = draggable.opensBounds.height / util.miniRows + 'px';
    }

    attrs.style[util.transformProp()] = util.translate([
      draggable.pos[0] + draggable.dec[0],
      draggable.pos[1] + draggable.dec[1]
    ]);
    attrs.class += ' dragging';
  }

  if (ctrl.data.animation.current.anims) {
    var animation = ctrl.data.animation.current.anims[key];
    if (animation) {
      attrs.class += ' animating';
      attrs.style[util.transformProp()] = util.translate(animation[1]);
    }
  }

  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderTopWithClass(klass, ctrl, key) {
  return {
    tag: 'div',
    attrs: {
      class: klass + ' oc ' + key
    }
  };
}

function renderMiniWithClass(klass, ctrl, pos) {
  return {
    tag: 'div',
    attrs: {
      style: miniPosStyle(pos),
      class: klass + ' oc'
    }
  };
}

function renderBoardPieceWithClass(klass, ctrl, pos) {
  return {
    tag: 'div',
    attrs: {
      style: posStyle(pos),
      class: klass
    }
  };
}

function renderBoard(ctrl) {
  var d = ctrl.data;
  var positions = util.allPos;
  var children = [];
  var dragOver;

  function renderWood(side) {
    return {
      tag: 'div',
      attrs: {
        class: 'wood ' + side
      }
    };
  };

  children.push(renderWood('left'), renderWood('right'));

  for (var i = 0; i < positions.length; i++) {
    var key = util.pos2key(positions[i]);
    var piece = d.pieces[key];
    if (piece) {
      var rp = renderPiece(ctrl, positions[i], key, piece);

      if (d.flippable.current.orig === key) {
        var front, back;
        var flip = d.flippable.current.flip;
        var rp2 = renderPiece(ctrl, positions[i], key, util.emptyPiece);

        if (piece.flip) {
          front = rp2;
          back = rp;
        } else {
          front = rp;
          back = rp2;
        }
        children.push(withFlipper(front, back, flip));
      } else {
        if (piece.flip)
          rp = renderPiece(ctrl, positions[i], key, util.emptyPiece);
        children.push(rp);
      }
    }

    if (d.draggable.current.over === key) {
      dragOver = renderBoardPieceWithClass('drag-over', ctrl, positions[i]);
    }
  }

  if (d.middleHolder.key) {
    children.push(renderPiece(ctrl, util.key2pos(d.middleHolder.key), d.middleHolder.key, util.emptyPiece, 'loading'));
  }

  if (dragOver) {
    children.push(dragOver);
  }

  return {
    tag: 'div',
    attrs: {
      config: function(el, isUpdate, context) {
        if (isUpdate) return;
        ctrl.data.boardBounds = util.memo(el.getBoundingClientRect.bind(el));
      },
      class: 'og-board'
    },
    children: children
  };
}

function renderOpenGroups(ctrl, groups) {
  var d = ctrl.data;
  var positions = util.miniAllPos;
  var children = [];
  var miniDests = [];

  for (var i = 0; i < positions.length; i++) {
    var key = util.miniPos2key(positions[i]);
    var piece = groups[key];

    if (piece) {
      children.push(renderMiniPiece(ctrl, positions[i], key, piece));
    }

  if (ctrl.data.animation.current.anims) {
    var animation = ctrl.data.animation.current.anims[key];
    piece = ctrl.data.animation.current.extra[key];
    if (animation && piece) {
      children.push(renderMiniPiece(ctrl, positions[i], key, piece));
    }
  }

    var miniKlass = util.classSet({
      'drag-over': d.draggable.current.over === key,
      'move-dest': util.containsX(d.openable.dests, key)
    });

    if (miniKlass !== '') {
      miniDests.push(renderMiniWithClass(miniKlass, ctrl, positions[i]));
    }
  }

  children.push(miniDests);

  return children;
}

function renderOpens(ctrl) {
  var d = ctrl.data;

  var children = renderOpenGroups(ctrl, d.opens.layout.layout);

  return {
    tag: 'div',
    attrs: {
      config: function(el, isUpdate, context) {
        if (isUpdate) return;
        ctrl.data.opensBounds = util.memo(el.getBoundingClientRect.bind(el));
      },
      class: 'og-opens'
    },
    children: children
  };
}


function renderDiscards(ctrl) {
  var d = ctrl.data;
  var children = [];
  var topDests = [];

  for (var key in d.discards) {
    var piece = d.discards[key][0];

    var miniKlass = util.classSet({
      'drag-over': d.draggable.current.over === key,
      'move-dest': key === 'ddown' && d.selected && util.isBoardKey(d.selected) && util.containsX(d.movable.dests, move.discard),
      'last-move': d.lastMove &&  util.containsX(d.lastMove, key)
    });

    if (piece) {
      if (d.discards[key][1]) {
        topDests.push(renderTopPiece(ctrl, key, d.discards[key][1], "fake", false));
      }
      topDests.push(renderTopPiece(ctrl, key, piece, miniKlass));

      var dlAnimationKey = move.drawLeft + key;
      var dlAnimation = ctrl.data.animation.current.anims ?
          ctrl.data.animation.current.anims[dlAnimationKey] : false;

      if (dlAnimation) {
        var animPiece = ctrl.data.animation.current.extra.piece;
        topDests.push(renderTopPiece(ctrl, key, animPiece, miniKlass, true, dlAnimationKey));
      }
    } else {
      children.push(renderTopPieceHolder(ctrl, key, miniKlass));
    }
  }

  children.push(topDests);

  return children;
}

function renderMiddles(ctrl) {
  var d = ctrl.data;
  var children = [];

  var draggingMiddlePiece = d.middleHolder.piece || util.emptyPiece;

  children.push(renderTopPiece(ctrl, util.gosterge, d.middles[util.gosterge]));
  children.push(renderMiddlePiece(ctrl, util.middleCount, util.emptyPiece));

  if (util.isMiddleKey(d.draggable.current.orig) ||
      (d.animation.current.anims && d.animation.current.anims[util.middleCount])) {
    var rp = renderMiddlePiece(ctrl,
                               util.middleCount,
                               draggingMiddlePiece, true);
    children.push(rp);
  }

  if (d.draggable.current.over === util.gosterge) {
    children.push(renderTopWithClass('drag-over', ctrl, util.gosterge));
  }

  return children;
}

function renderSides(ctrl) {
  var children = [];

  var hooks = ctrl.data.topHooks;

  if (hooks) children.push(hooks);

  return children;
}

function renderTop(ctrl) {

  var children = [
    renderMiddles(ctrl),
    renderDiscards(ctrl),
    renderOpens(ctrl),
    renderSides(ctrl)
  ];

  return {
    tag: 'div',
    attrs: {
      config: function(el, isUpdate, context) {
        if (isUpdate) return;
        ctrl.data.topBounds = util.memo(el.getBoundingClientRect.bind(el));
      },
      class: 'og-top'
    },
    children: children
  };
}

function renderContent(ctrl) {
  return [renderTop(ctrl), renderBoard(ctrl)];
}

function dragOrDraw(d, withDrag, withDraw) {
  return function(e) {
    if (util.isRightButton(e)) withDraw(d, e);
    else if (!d.viewOnly) withDrag(d, e);
  };
}

function bindEvents(ctrl, el, context) {
  var d = ctrl.data;
  var onstart = dragOrDraw(d, drag.start, draw.start);
  var onmove = dragOrDraw(d, drag.move, draw.move);
  var onend = dragOrDraw(d, drag.end, draw.end);

  var startEvents = ['touchstart', 'mousedown'];
  var moveEvents = ['touchmove', 'mousemove'];
  var endEvents = ['touchend', 'mouseup'];

  startEvents.forEach(function(ev) {
    el.addEventListener(ev, onstart);
  });
  moveEvents.forEach(function(ev) {
    document.addEventListener(ev, onmove);
  });
  endEvents.forEach(function(ev) {
    document.addEventListener(ev, onend);
  });
  context.onunload = function() {
    startEvents.forEach(function(ev) {
      el.removeEventListener(ev, onstart);
    });
    moveEvents.forEach(function(ev) {
      document.removeEventListener(ev, onmove);
    });
    endEvents.forEach(function(ev) {
      document.removeEventListener(ev, onend);
    });
  };
}

function renderTable(ctrl) {
  return {
    tag: 'div',
    attrs: {
      class: 'og-table',
      config: function(el, isUpdate, context) {
        if (isUpdate) return;

        if (!ctrl.data.viewOnly) {
          bindEvents(ctrl, el, context);
        }

        // this function only repaints the board itself
        // it's called when dragging or animating pieces,
        // to prevent the full application embedding okeyground
        // rendering on every animation frame
        ctrl.data.render = function() {
          m.render(el, renderContent(ctrl));
        };
        ctrl.data.renderRAF = function() {
          util.requestAnimationFrame(ctrl.data.render);
        };

        ctrl.data.bounds = util.memo(el.getBoundingClientRect.bind(el));
        ctrl.data.element = el;
        ctrl.data.render();
      }
    },
    children: []
  };
}

module.exports = function(ctrl) {
  return {
    tag: 'div',
    attrs: {
      config: function(el, isUpdate) {
        if (isUpdate) return;
        el.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          return false;
        });
        ['onscroll', 'onresize'].forEach(function(n) {
          var prev = window[n];
          window[n] = function() {
            prev && prev();
            ctrl.data.bounds.clear();
            ctrl.data.boardBounds.clear();
            ctrl.data.opensBounds.clear();
            ctrl.data.topBounds.clear();
          };
        });
      },
      class: [
        'og-table-wrap'
      ].join(' ')
    },
    children: [renderTable(ctrl)]
  };
};
