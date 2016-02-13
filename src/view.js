import m from 'mithril';
import drag from './drag';
import util from './util';

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

  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderTopPiece(ctrl, key, p) {
  var d = ctrl.data;

  var attrs = {
    key: key,
    class: pieceClass(p) + ' discard-' + key
  };

  var draggable = ctrl.data.draggable.current;
  if (draggable.orig === key) {
    attrs.style[util.transformProp()] = util.translate([
      draggable.pos[0] + draggable.dec[0],
      draggable.pos[1] + draggable.dec[1]
    ]);
    attrs.class += ' dragging';
  }
  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderPiece(ctrl, pos, key, p) {
  var d = ctrl.data;

  var classes = util.classSet({
    'selected': d.selected === key
  });

  var attrs = {
    key: key,
    style: posStyle(pos),
    class: [pieceClass(p), classes].join(' ')
  };

  var draggable = ctrl.data.draggable.current;
  if (draggable.orig === key) {

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
  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderTopDragOver(ctrl, key) {
  return {
    tag: 'div',
    attrs: {
      class: 'drag-over ' + key
    }
  };
}

function renderMiniDragOver(ctrl, pos) {
  return {
    tag: 'div',
    attrs: {
      style: miniPosStyle(pos),
      class: 'drag-over'
    }
  };
}

function renderDragOver(ctrl, pos) {
  return {
    tag: 'div',
    attrs: {
      style: posStyle(pos),
      class: 'drag-over'
    }
  };
}

function renderBoard(ctrl) {
  var d = ctrl.data;
  var positions = util.allPos;
  var children = [];
  var dragOver;

  for (var i = 0; i < positions.length; i++) {
    var key = util.pos2key(positions[i]);
    var piece = d.pieces[key];
    if (piece) {
      children.push(renderPiece(ctrl, positions[i], key, piece));
    }

    if (d.draggable.current.over === key) {
      dragOver = renderDragOver(ctrl, positions[i]);
    }
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
  var dragOver;

  for (var i = 0; i < positions.length; i++) {
    var key = util.miniPos2key(positions[i]);
    var piece = groups[key];

    if (piece) {
      children.push(renderMiniPiece(ctrl, positions[i], key, piece));
    }

    if (d.draggable.current.over === key) {
      dragOver = renderMiniDragOver(ctrl, positions[i]);
    }
  }

  if (dragOver) {
    children.push(dragOver);
  }

  return children;
}

function renderOpens(ctrl) {
  var d = ctrl.data;

  var children = renderOpenGroups(ctrl, d.opens);

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
  var dragOver;

  for (var key in d.discards) {
    children.push(renderTopPiece(ctrl, key, d.discards[key]));

    if (d.draggable.current.over === key) {
      dragOver = renderTopDragOver(ctrl, key);
    }
  }

  if (dragOver) {
    children.push(dragOver);
  }

  return children;
}

function renderTop(ctrl) {

  var children = [
    renderDiscards(ctrl),
    renderOpens(ctrl)
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

function doDrag(d, withDrag) {
  return function(e) {
    withDrag(d, e);
  };
}

function bindEvents(ctrl, el, context) {
  var d = ctrl.data;
  var onstart = doDrag(d, drag.start);
  var onmove = doDrag(d, drag.move);
  var onend = doDrag(d, drag.end);

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
        bindEvents(ctrl, el, context);
        // this function only repaints the board itself
        // it's called when dragging or animating pieces,
        // to prevent the full application embedding okeyground
        // rendering on every animation frame
        ctrl.data.render = function() {
          m.render(el, renderContent(ctrl));
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
        ['onscroll', 'onresize'].forEach(function(n) {
          var prev = window[n];
          window[n] = function() {
            prev && prev();
            ctrl.data.bounds.clear();
            ctrl.data.boardBounds.clear();
            ctrl.data.opensBounds.clear();
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
