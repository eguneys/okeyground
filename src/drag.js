import board from './board';
import table from './table';
import util from './util';

var originTarget;

function computeSquareBounds(data, bounds, key) {
  var pos = util.key2pos(key);
  var columns = util.columns;
  var rows = util.rows;
  return {
    left: bounds.left + bounds.width * pos[0] / columns,
    top: bounds.top + bounds.height * pos[1] / rows,
    width: bounds.width / columns,
    height: bounds.height / rows
  };
}

function start(data, e) {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click

  e.stopPropagation();
  e.preventDefault();

  originTarget = e.target;
  var previouslySelected = data.selected;
  var position = util.eventPosition(e);
  var boardBounds = data.boardBounds();
  var opensBounds = data.opensBounds();
  var topBounds = data.topBounds();
  var orig = board.getKeyAtDomPosOnPiece(data, position, boardBounds);
  board.selectSquare(data, orig);
  var stillSelected = data.selected === orig;
  if (data.pieces[orig] && stillSelected) {
    var squareBounds = computeSquareBounds(data, boardBounds, orig);
    data.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: [
        position[0] - (squareBounds.left + squareBounds.width / 2),
        position[1] - (squareBounds.top + squareBounds.height / 2)
      ],
      boardBounds: boardBounds,
      opensBounds: opensBounds,
      topBounds: topBounds,
      started: false
    };
  }
  processDrag(data);
}

function processDrag(data) {
  util.requestAnimationFrame(function() {
    var cur = data.draggable.current;
    if (cur.orig) {
      if (!cur.started && util.distance(cur.epos, cur.rel) >= data.draggable.distance) {
        cur.started = true;
      }
      if (cur.started) {
        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ];
        cur.over =
          board.getKeyAtDomPosOnPiece(data, cur.epos, cur.boardBounds, cur.orig)
          ||
          table.getOpensKeyAtDomPos(data, cur.epos, cur.opensBounds)
          ||
          table.getTopKeyAtDomPos(data, cur.epos, cur.topBounds);
      }
    }
    data.render();
    if(cur.orig) processDrag(data);
  });
}

function move(data, e) {
  if (data.draggable.current.orig) {
    data.draggable.current.epos = util.eventPosition(e);
  }
}

function end(data, e) {
  var draggable = data.draggable;
  var orig = draggable.current ? draggable.current.orig : null;
  if (!orig) return;

  var dest = draggable.current.over;

  if (draggable.current.started) {
    if (board.userMove(data, orig, dest)) {
    }
    else if (table.placeOpens(data, orig, dest)) {
    }
    else if (table.placeTop(data, orig, dest)) {
    }
  }

  if (orig === draggable.current.previouslySelected && (orig === dest || !dest)) {
    board.setSelected(data, null);
  }
  draggable.current = {};
}

module.exports = {
  start: start,
  move: move,
  end: end
};
