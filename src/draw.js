import board from './board';
import util from './util';

function start(data, e) {
  e.stopPropagation();
  e.preventDefault();
  board.cancelMove(data);

  var position = util.eventPosition(e);
  var boardBounds = data.boardBounds();
  var orig = board.getKeyAtDomPosOnPiece(data, position, boardBounds);
  var piece = data.pieces[orig];

  if (!piece || data.flippable.current.orig) return;

  data.flippable.current = {
    orig: orig
  };

  data.renderRAF();
  setTimeout(() => {
    data.flippable.current.flip = true;
    data.renderRAF();
    setTimeout(() => {
      piece.flip = !piece.flip;
      data.flippable.current = {};
      data.renderRAF();
    }, 600);
  }, 10);

  // processDraw(data);
}

function processDraw(data) {
  util.requestAnimationFrame(function() {
    var cur = data.flippable.current;
    data.render();

    if (cur.orig) processDraw(data);
  });
}

function move(data, e) {}

function end(data, e) {
  // var flippable = data.flippable;
  // flippable.current = {};
  // data.render();
}

module.exports = {
  start: start,
  move: move,
  end: end
};
