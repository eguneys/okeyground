import m from 'mithril';
import drag from './drag';
import util from './util';

function pieceClass(p) {
  return p.color + ' ' + p.number;
}

function renderPiece(ctrl, key, p) {
  var d = ctrl.data;
  var pos = util.key2pos(key);

  var classes = util.classSet({
    'selected': d.selected === key
  });

  var attrs = {
    style: {
      left: pos[0] * (100 / util.columns) + '%',
      top: pos[1] * (100 / util.rows) + '%'
    },
    class: classes + ' ' + pieceClass(p)
  };

  var draggable = ctrl.data.draggable.current;
  if (draggable.orig === key) {
    attrs.style[util.transformProp()] = util.translate([
      draggable.pos[0],
      draggable.pos[1]
    ]);
    attrs.class += ' dragging';
  }
  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderContent(ctrl) {
  var d = ctrl.data;
  var positions = util.allPos;
  var children = [];

  for (var i = 0; i < positions.length; i++) {
    var piece = d.pieces[i];
    if (piece) {
      children.push(renderPiece(ctrl, i, piece));
    }
  }

  return children;
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

function renderBoard(ctrl) {
  return {
    tag: 'div',
    attrs: {
      class: 'og-board',
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
      class: [
        'og-board-wrap'
      ].join(' ')
    },
    children: [renderBoard(ctrl)]
  };
};
