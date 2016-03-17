import board from './board';
import table from './table';
import util from './util';

var originTarget;

function computeSquareBounds(data, bounds,
                             pos,
                             rows = util.rows,
                             columns = util.columns) {

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
  if (!orig) {
    if ((orig = table.getDrawKeyAtDomPos(data, position, topBounds))) {
      board.selectTop(data, orig, previouslySelected);
    }
  }

  if (!orig && previouslySelected) {
    if ((orig = table.getOpensKeyAtDomPos(data, position, opensBounds))) {
      table.placeOpens(data, previouslySelected, orig);
    } else {
      if ((orig = table.getDiscardKeyAtDomPos(data, position, topBounds))) {
        table.placeTop(data, previouslySelected, orig);
      }
    }
  }

  var stillSelected = data.selected === orig;
  if (stillSelected && table.isDraggable(data, orig)) {
    var squareBounds = (util.isBoardKey(orig))?
          computeSquareBounds(data, boardBounds, util.key2pos(orig)):
          computeSquareBounds(data, topBounds, util.topKey2pos(orig), util.topRows, util.topColumns);

    data.draggable.current = {
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
          board.getKeyAtDomPosOnPiece(data, cur.epos, cur.boardBounds, cur.orig);

        if (!cur.over && util.isBoardKey(cur.orig)) {
          cur.over =
            table.getOpensKeyAtDomPos(data, cur.epos, cur.opensBounds)
            ||
            table.getDiscardKeyAtDomPos(data, cur.epos, cur.topBounds);
        }
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
    board.setSelected(data, null);
    if (board.userMove(data, orig, dest)) {
    } else if (table.placeOpens(data, orig, dest)) {
    } else if (table.placeTop(data, orig, dest)) {
    } else if (board.userDrawLeft(data, orig, dest)) {
    } else if (board.userEndDrawMiddle(data, orig, dest)) {
    }
  }
  draggable.current = {};
}

module.exports = {
  start: start,
  move: move,
  end: end
};
