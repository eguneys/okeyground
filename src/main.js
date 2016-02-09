import m from 'mithril';
import ctrl from './ctrl';
import view from './view';

function init(element, config) {
  var controller = new ctrl(config);
  m.render(element, view(controller));
}


module.exports = init;
