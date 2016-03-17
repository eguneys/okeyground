module.exports = function(transformation, data) {
  return function() {
    var transformationArgs = [data].concat(Array.prototype.slice.call(arguments, 0));
    var result = transformation.apply(null, transformationArgs);
    data.renderRAF();
    return result;
  };
};
