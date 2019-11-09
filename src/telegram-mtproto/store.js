'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TimeOffset = exports.ValueStoreMap = exports.ValueStore = undefined;

var _clone = require('ramda/src/clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValueStore = exports.ValueStore = () => {
  var val = null;

  return {
    get: () => (0, _clone2.default)(val),
    set: newVal => val = newVal
  };
}; // import Promise from 'bluebird'

var ValueStoreMap = exports.ValueStoreMap = () => {
  var val = new Map();

  return {
    get: key => (0, _clone2.default)(val.get(key)),
    set: (key, newVal) => val.set(key, newVal)
  };
};

var TimeOffset = exports.TimeOffset = ValueStore();
//# sourceMappingURL=store.js.map