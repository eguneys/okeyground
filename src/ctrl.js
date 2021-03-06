import table from './table';
import board from './board';
import sorter from './sorter';
import data from './data';
import configure from './configure';
import util from './util';
import anim from './anim';
import drag from './drag';
import pieces from './pieces';

module.exports = function(cfg) {
  this.data = data(cfg);

  this.data.flipPiece = function(orig, piece) {
    if (!piece || this.flippable.current.orig) return;
    this.flippable.current = {
      orig: orig
    };
    this.renderRAF();
    setTimeout(() => {
      this.flippable.current.flip = true;
      this.renderRAF();
      setTimeout(() => {
        piece.flip = !piece.flip;
        this.flippable.current = {};
        this.renderRAF();
      }, 600);
    }, 10);
  }.bind(this.data);

  this.getFen = () => {
    return pieces.write(this.data.pieces);
  };

  this.getPieceGroupSeries = () => {
    return board.getPieceGroupSeries(this.data);
  };

  this.getPieceGroupPairs = () => {
    return board.getPieceGroupPairs(this.data);
  };

  this.set = anim(configure, this.data);

  this.apiMove = anim(table.apiMove, this.data);

  this.apiDrawMiddleEnd = anim(board.apiDrawMiddleEnd, this.data);

  this.playOpenSeries = anim(board.playOpenSeries, this.data);

  this.playOpenPairs = anim(board.playOpenPairs, this.data);

  this.playLeaveTaken = anim(board.playLeaveTaken, this.data);

  this.sortPairs = anim(sorter.sortPairs, this.data);

  this.sortSeries = anim(sorter.sortSeries, this.data);

  this.canLeaveTaken = util.partial(board.canLeaveTaken, this.data);
  this.canCollectOpen = util.partial(board.canCollectOpen, this.data);
  this.canOpenSeries = util.partial(board.canOpenSeries, this.data);
  this.canOpenPairs = util.partial(board.canOpenPairs, this.data);

  this.stop = anim((data) => {
    board.stop(data);
    drag.cancel(data);
  }, this.data);

  // var onresize = () => {
  //   if (this.data.element)
  // };

  this.onunload = function() {
    // window.removeEventListener('resize', onresize);
  };
};
