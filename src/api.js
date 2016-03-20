import board from './board';

module.exports = function(controller) {
  return {
    set: controller.set,
    getPieceGroups: function() {
      return board.getPieceGroups(controller.data);
    },
    apiMove: controller.apiMove,
    apiDrawMiddleEnd: controller.apiDrawMiddleEnd,
    playOpenSeries: controller.playOpenSeries,
    playOpenPairs: controller.playOpenPairs,
    getFen: controller.getFen
  };
};
