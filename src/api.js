module.exports = function(controller) {
  return {
    set: controller.set,
    apiMove: controller.apiMove,
    apiDrawMiddleEnd: controller.apiDrawMiddleEnd
  };
};
