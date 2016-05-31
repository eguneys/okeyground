import m from 'mithril';
import ctrl from './ctrl';
import view from './view';
import util from './util';
import move from './move';
import api from './api';

import anim from './anim';
import drag from './drag';


function render(element, controller) {
  m.render(element, view(controller), true);
}

function init(element, config) {
  var controller = new ctrl(config);
  m.render(element, view(controller));

  return api(controller);
}


module.exports = init;
module.exports.render = render;
module.exports.controller = ctrl;
module.exports.view = view;
module.exports.util = util;
module.exports.move = move;
module.exports.anim = anim;
module.exports.drag = drag;
