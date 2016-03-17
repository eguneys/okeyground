import m from 'mithril';
import ctrl from './ctrl';
import view from './view';
import util from './util';
import move from './move';
import api from './api';

function init(element, config) {
  var controller = new ctrl(config);
  m.render(element, view(controller));

  return api(controller);
}


module.exports = init;
module.exports.controller = ctrl;
module.exports.view = view;
module.exports.util = util;
module.exports.move = move;
