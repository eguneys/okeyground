import board from './board';

module.exports = function(controller) {
  return {
    set: controller.set,
    getPieceGroups: function() {
      return board.getPieceGroups(controller.data);
    },
    sortPairs: controller.sortPairs,
    sortSeries: controller.sortSeries,
    apiMove: controller.apiMove,
    apiDrawMiddleEnd: controller.apiDrawMiddleEnd,
    playOpenSeries: controller.playOpenSeries,
    playOpenPairs: controller.playOpenPairs,
    playLeaveTaken: controller.playLeaveTaken,
    stop: controller.stop,
    getPieceGroupSeries: controller.getPieceGroupSeries,
    getPieceGroupPairs: controller.getPieceGroupPairs,
    getFen: controller.getFen
  };
};
