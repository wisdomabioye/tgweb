'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFile = exports.readData = exports.writeData = exports.checkAccess = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var access = void 0,
    writeFile = void 0,
    readFile = void 0,
    W_OK = void 0;

if (_detectNode2.default) {
  var fs = require('fs');
  access = fs.access;
  writeFile = fs.writeFile;
  readFile = fs.readFile;
  W_OK = fs.constants.W_OK;
}

var checkAccess = exports.checkAccess = filepath => new _bluebird2.default((rs, rj) => access(filepath, W_OK, err => err == null ? rs() : rj(err)));

var writeData = exports.writeData = (filepath, data) => new _bluebird2.default((rs, rj) => writeFile(filepath, data, err => err == null ? rs() : rj(err)));

var readData = exports.readData = filepath => new _bluebird2.default((rs, rj) => readFile(filepath, (err, data) => err == null ? rs(data.toString()) : rj(err)));

var createFile = exports.createFile = filepath => writeData(filepath, '{}');
//# sourceMappingURL=fixtures.js.map