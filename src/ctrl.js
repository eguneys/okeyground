import table from './table';
import board from './board';
import data from './data';
import configure from './configure';
import util from './util';
import anim from './anim';

module.exports = function(cfg) {
  this.data = data(cfg);

  this.set = anim(configure, this.data);

  this.apiMove = anim(table.apiMove, this.data);

  this.apiDrawMiddleEnd = anim(board.apiDrawMiddleEnd, this.data);

  this.playOpenSeries = anim(board.playOpenSeries, this.data);

  this.playOpenPairs = anim(board.playOpenPairs, this.data);

  //this.playLeaveTaken = anim(board.playLeaveTaken, this.data);

  this.canLeaveTaken = util.partial(board.canLeaveTaken, this.data);
  this.canCollectOpen = util.partial(board.canCollectOpen, this.data);
  this.canOpenSeries = util.partial(board.canOpenSeries, this.data);
  this.canOpenPairs = util.partial(board.canOpenPairs, this.data);
};
