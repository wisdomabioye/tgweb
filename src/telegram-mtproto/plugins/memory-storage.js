'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemoryStorage = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _toPairs = require('ramda/src/toPairs');

var _toPairs2 = _interopRequireDefault(_toPairs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Basic storage implementation.
 * Saves data in memory
 *
 * @export
 * @class MemoryStorage
 * @implements {AsyncStorage}
 */
class MemoryStorage {

  constructor(data) {
    this.store = new Map();

    if (data != null) {
      for (var _iterator = (0, _toPairs2.default)(data), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var [_key, _value] = _ref;

        this.store.set(_key, _value);
      }
    }
  }

  get(key) {
    return _bluebird2.default.resolve(this.store.get(key));
  }

  set(key, val) {
    this.store.set(key, val);
    return _bluebird2.default.resolve();
  }

  remove(...keys) {
    var results = keys.map(e => this.store.delete(e));
    return _bluebird2.default.resolve(results);
  }

  clear() {
    this.store.clear();
    return _bluebird2.default.resolve();
  }
}

exports.MemoryStorage = MemoryStorage;
exports.default = MemoryStorage;
//# sourceMappingURL=memory-storage.js.map