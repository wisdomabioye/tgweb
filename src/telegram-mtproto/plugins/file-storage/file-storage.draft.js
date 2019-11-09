'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileSystemDriver = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _toPairs = require('ramda/src/toPairs');

var _toPairs2 = _interopRequireDefault(_toPairs);

var _fromPairs = require('ramda/src/fromPairs');

var _fromPairs2 = _interopRequireDefault(_fromPairs);

var _fixtures = require('./fixtures');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// import type { AsyncStorage } from '../index.h'

var { watchFile } = require('fs');

function _ref(update) {
  return console.log('update', update);
}

class FileSystemDriver {
  constructor(filepath) {
    this.watcher = ({ mtime }) => {
      var newTime = mtime.getTime();
      var needUpdate = this.syncTime < newTime;
      console.log(`watch curr`, needUpdate, mtime.toTimeString(), this.syncTimeString);
      if (needUpdate) {
        this.read(newTime).then(_ref);
      }
    };

    this.filepath = filepath;
    this.updateTime();
    watchFile(filepath, { interval: 500 }, this.watcher);
  }
  get syncTimeString() {
    var date = new Date(this.syncTime);
    var str = date.toTimeString();
    return str;
  }
  updateTime(syncTime) {
    return this.syncTime = syncTime ? syncTime : Date.now();
  }
  mergeUpdate(update, syncTime) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (syncTime >= _this.syncTime) {
        _this.updateTime(syncTime);
        yield (0, _fixtures.writeData)(_this.filepath, update);
      }
    })();
  }
  write(obj) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var time = _this2.updateTime();
      var str = JSON.stringify(obj);
      yield _this2.mergeUpdate(str, time);
    })();
  }
  read(syncTime) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.updateTime(syncTime);
      var str = yield (0, _fixtures.readData)(_this3.filepath);

      if (str.length === 0) {
        yield _this3.write({});
        _this3.updateTime();
        str = yield (0, _fixtures.readData)(_this3.filepath);
      }
      var result = JSON.parse(str);
      return result;
    })();
  }

}

exports.FileSystemDriver = FileSystemDriver;
class FileStorageInstance {
  constructor(filepath, store) {
    this.store = new Map();

    this.driver = new FileSystemDriver(filepath);
    this.save(store);
  }
  save() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var obj = (0, _fromPairs2.default)([..._this4.store.entries()]);
      yield _this4.driver.write(obj);
    })();
  }
  load(obj) {
    this.store.clear();
    for (var _iterator = (0, _toPairs2.default)(obj), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var [_key, value] = _ref2;

      this.store.set(_key, value);
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
    return _bluebird2.default.resolve(keys.map(key => this.store.delete(key)));
  }
  clear() {
    this.store.clear();
    return _bluebird2.default.resolve();
  }
}

/*const initializeFileStorage = async (filepath: string) => {
  let needToCreate = false
  try {
    await checkAccess(filepath)
  } catch (err) {
    switch (err.code) {
      case 'ENOENT': needToCreate = true; break
      case 'EPERM' : throw err
      default: throw err
    }
  }
  if (needToCreate)
    await createFile(filepath)

  const storage = new FileStorageInstance(filepath, {})
  return storage
  // await pause(5e3)

  // const readed = await storage.read()

  // console.log(`readed`, storage.syncTimeString, readed)

  // readed.field = { value: 'field' }
  // readed.data = ['str', 48, { ok: null }]

  // await pause()

  // await storage.write(readed)

  // await pause(5e3)

  // const newReaded = await storage.read()

  // console.log(`newReadedObj`, storage.syncTimeString, newReaded)

}*/

// export const FileStorage = (filepath: string): Promise<AsyncStorage> =>
//   initializeFileStorage(filepath)

exports.default = FileStorageInstance;
//# sourceMappingURL=file-storage.draft.js.map