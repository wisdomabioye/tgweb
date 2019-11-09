'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleFileStorage = undefined;

var _omit = require('ramda/src/omit');

var _omit2 = _interopRequireDefault(_omit);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fixtures = require('./fixtures');

var _log = require('../../util/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = _log2.default`simple-file-storage`;

/**
 * ### *Basic* file storage realisation
 *
 * Limitations:
 * * `filepath` must exists
 * * `filepath` must be valid JSON (just `{}` for empty store)
 * * No auto close descriptor
 *
 * @export
 * @class SimpleFileStorage
 * @implements {AsyncStorage}
 */
class SimpleFileStorage {

  /**
   * Usage
   *
   *     const storage = new SimpleFileStorage('./filestore.json')
   *     const telegram = MTProto({ app: { storage } })
   *
   * @param {string} filepath Path to your file
   * @param {object} [data] Import stored data (if you have so)
   *
   */
  constructor(filepath, data) {
    this.data = {};
    this.init = false;

    this.filepath = filepath;
    if (data != null) this.data = data;
    // setInterval(() => this.save(), 500)
  }

  save() {
    var str = JSON.stringify(this.data);
    return (0, _fixtures.writeData)(this.filepath, str);
  }

  get(key) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!_this.init) {
        var pureData = yield (0, _fixtures.readData)(_this.filepath);
        var parsed = JSON.parse(pureData);
        _this.data = parsed;
        log('get', 'parsed')(parsed);
        _this.init = Date.now();
      }
      var data = _this.data[key];
      log('get', `key ${key}`)(data);
      return _bluebird2.default.resolve(data);
    })();
  }

  set(key, val) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2.data[key] = val;
      log('set', `key ${key}`)(val);
      yield _this2.save();
    })();
  }

  remove(...keys) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.data = (0, _omit2.default)(keys, _this3.data);
      log('remove')(keys);
      yield _this3.save();
    })();
  }

  clear() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      _this4.data = {};
      log('clear')('ok');
      // await this.save()
    })();
  }
}

exports.SimpleFileStorage = SimpleFileStorage;
exports.default = SimpleFileStorage;
//# sourceMappingURL=simple-file-storage.js.map