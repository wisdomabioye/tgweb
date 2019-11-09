'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MTProto(config = {}) {
  var mtproto = new _index2.default(config);

  var api = mtproto.api;

  function telegram(method, params, options = {}) {
    return api.mtpInvokeApi(method, params, options);
  }

  telegram.setUserAuth = api.setUserAuth;
  telegram.on = api.on;
  telegram.emit = api.emit;
  telegram.storage = api.storage;

  return telegram;
}

exports.default = MTProto;
//# sourceMappingURL=wrap.js.map