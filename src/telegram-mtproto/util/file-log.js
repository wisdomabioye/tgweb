'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.traverse = traverse;

var _fs = require('fs');

var _dtime = require('./dtime');

var _dtime2 = _interopRequireDefault(_dtime);

var _ramda = require('ramda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEL = Symbol('delete');

function traverse(func) {
  return function visitor(obj) {
    function _ref2([index, value]) {
      var [edited, newIndex] = func(value, index);
      if (edited === DEL) return;
      var visited = visitor(edited, newIndex);
      _result[newIndex] = visited;
    }

    if (Array.isArray(obj)) {
      var result = [];
      for (var _iterator = obj.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var [index, value] = _ref;

        var [edited, newIndex] = func(value, index);
        if (edited === DEL) continue;
        var visited = visitor(edited, newIndex);
        result.push(visited);
      }
      return result;
    } else if (typeof obj === 'object') {
      var _result = {};
      var iterator = (0, _ramda.forEach)(_ref2);

      iterator((0, _ramda.toPairs)(obj));
      return _result;
    }
    return obj;
  };
}

var arraysNormalize = (obj, key) => {
  var result = obj;
  if ((0, _ramda.any)((0, _ramda.is)(_ramda.__, obj), [Uint8Array, Buffer, ArrayBuffer, Int32Array, Uint32Array])) result = { data: Array.from(obj), type: (0, _ramda.type)(obj) };
  return [result, key];
};

var beforeStringify = traverse(arraysNormalize);
var stringify = data => JSON.stringify(beforeStringify(data));

var getId = () => Math.trunc(Math.random() * 1e6);
var fileName = `logs/file-log-${getId()}.log`;

var writeStream = (0, _fs.createWriteStream)(fileName);

var writer = functionName => ({
  input(data) {
    var id = getId();
    writeStream.write(`${(0, _dtime2.default)()} ${functionName} ${id} input\n${stringify(data)}\n`);
    return id;
  },
  output: (id, data) => writeStream.write(`${(0, _dtime2.default)()} ${functionName} ${id} output\n${stringify(data)}\n`)
});

exports.default = writer;
//# sourceMappingURL=file-log.js.map