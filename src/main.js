import m from 'mithril';
import ctrl from './ctrl';
import view from './view';
import util from './util';

function init(element, config) {
  var controller = new ctrl(config);
  m.render(element, view(controller));
}


module.exports = init;
module.exports.controller = ctrl;
module.exports.view = view;
module.exports.util = util;
