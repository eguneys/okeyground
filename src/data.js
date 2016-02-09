import merge from 'merge';
import pieces from './pieces';

function configure(data, config) {
  if (!config) return;
  merge.recursive(data, config);
}

module.exports = function(cfg) {
  var defaults = {
    pieces: pieces.read(pieces.initial)
  };

  configure(defaults, cfg || {});

  return defaults;
};
