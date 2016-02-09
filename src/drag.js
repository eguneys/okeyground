import board from './board';
import util from './util';

var originTarget;

function start(data, e) {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click

  e.stopPropagation();
  e.preventDefault();

  originTarget = e.target;
  var previouslySelected = data.selected;
  var position = util.eventPosition(e);
  var bounds = data.bounds();
  var orig = board.getKeyAtDomPosOnPiece(data, position, bounds);
  board.selectSquare(data, orig);
  var stillSelected = data.selected === orig;
  if (data.pieces[orig] && stillSelected) {
    data.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      rel: position,
      epos: position,
      pos: [0, 0],
      bounds: bounds,
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
        cur.over = board.getKeyAtDomPosOnPiece(data, cur.epos, cur.bounds, cur.orig);
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
    board.userMove(data, orig, dest);
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