import m from 'mithril';
import util from './util';

function pieceClass(p) {
  return p.color + ' ' + p.number;
}

function renderPiece(ctrl, key, p) {
  var pos = util.key2pos(key);

  var attrs = {
    style: {
      left: pos[0] * (100 / util.columns) + '%',
      top: pos[1] * (100 / util.rows) + '%'
    },
    class: pieceClass(p)
  };

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

function renderBoard(ctrl) {
  return {
    tag: 'div',
    attrs: {
      class: 'og-board',
      config: function(el, isUpdate, context) {
        if (isUpdate) return;
        // this function only repaints the board itself
        // it's called when dragging or animating pieces,
        // to prevent the full application embedding okeyground
        // rendering on every animation frame
        ctrl.data.render = function() {
          m.render(el, renderContent(ctrl));
        };
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
