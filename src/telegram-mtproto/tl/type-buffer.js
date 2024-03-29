'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeBuffer = exports.TypeWriter = exports.getString = exports.getTypeConstruct = exports.getPredicate = exports.getNakedType = undefined;

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

var _log = require('../util/log');

var _log2 = _interopRequireDefault(_log);

var _smartTimeout = require('../util/smart-timeout');

var _error = require('../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _log2.default)('tl', 'type-buffer');

// import { bigint, uintToInt, intToUint, bytesToHex,
//   gzipUncompress, bytesToArrayBuffer, longToInts, lshift32 } from '../bin'

function findType(val) {
  return val.type == this;
}

function findPred(val) {
  return val.predicate == this;
}

function findId(val) {
  return val.id == this;
}

var getNakedType = exports.getNakedType = (type, schema) => {
  var checkType = type.substr(1);
  var result = schema.constructors.find(findType, checkType);
  if (!result) throw new Error(`Constructor not found for type: ${type}`);
  return result;
};

var getPredicate = exports.getPredicate = (type, schema) => {
  var result = schema.constructors.find(findPred, type);
  if (!result) throw new Error(`Constructor not found for predicate: ${type}`);
  return result;
};

var getTypeConstruct = exports.getTypeConstruct = (construct, schema) => schema.constructors.find(findId, construct);

var getChar = e => String.fromCharCode(e);

var getString = exports.getString = (length, buffer) => {
  var bytes = buffer.next(length);

  var result = [...bytes].map(getChar).join('');
  buffer.addPadding();
  return result;
};

var countNewLength = (maxLength, need, offset) => {
  var e1 = maxLength * 2;
  var e2 = offset + need + 16;
  var max = Math.max(e1, e2) / 4;
  var rounded = Math.ceil(max) * 4;
  return rounded;
};

var writeIntLogger = log('writeInt');

var writeIntLog = (i, field) => {
  var hex = i && i.toString(16) || 'UNDEF';
  writeIntLogger(hex, i, field);
};

class TypeWriter {
  // in bytes
  constructor() /*startMaxLength: number*/{
    // this.maxLength = startMaxLength
    // this.reset()

    this.offset = 0;
  }
  reset() {
    this.buffer = new ArrayBuffer(this.maxLength);
    this.intView = new Int32Array(this.buffer);
    this.byteView = new Uint8Array(this.buffer);
  }
  set(list, length) {
    this.byteView.set(list, this.offset);
    this.offset += length;
  }
  next(data) {
    this.byteView[this.offset] = data;
    this.offset++;
  }
  checkLength(needBytes) {
    if (this.offset + needBytes < this.maxLength) {
      return;
    }
    log('Increase buffer')(this.offset, needBytes, this.maxLength);
    this.maxLength = countNewLength(this.maxLength, needBytes, this.offset);
    var previousBuffer = this.buffer;
    var previousArray = new Int32Array(previousBuffer);

    this.reset();

    new Int32Array(this.buffer).set(previousArray);
  }
  getArray() {
    var resultBuffer = new ArrayBuffer(this.offset);
    var resultArray = new Int32Array(resultBuffer);

    resultArray.set(this.intView.subarray(0, this.offset / 4));

    return resultArray;
  }
  getBuffer() {
    return this.getArray().buffer;
  }
  getBytesTyped() {
    var resultBuffer = new ArrayBuffer(this.offset);
    var resultArray = new Uint8Array(resultBuffer);

    resultArray.set(this.byteView.subarray(0, this.offset));

    return resultArray;
  }
  getBytesPlain() {
    var bytes = [];
    for (var i = 0; i < this.offset; i++) {
      bytes.push(this.byteView[i]);
    }
    return bytes;
  }
  writeInt(i, field) {
    (0, _smartTimeout.immediate)(writeIntLog, i, field);

    this.checkLength(4);
    this.intView[this.offset / 4] = i;
    this.offset += 4;
  }
  writePair(n1, n2, field1, field2) {
    this.writeInt(n1, field1);
    this.writeInt(n2, field2);
  }
  addPadding() {
    while (this.offset % 4) {
      this.next(0);
    }
  }
}

exports.TypeWriter = TypeWriter;
class TypeBuffer {
  constructor(buffer) {
    this.offset = 0;

    this.buffer = buffer;
    this.intView = toUint32(buffer);
    this.byteView = new Uint8Array(buffer);
  }

  nextByte() {
    return this.byteView[this.offset++];
  }
  nextInt() {
    if (this.offset >= this.intView.length * 4) throw new _error.TypeBufferIntError(this);
    var int = this.intView[this.offset / 4];
    this.offset += 4;
    return int;
  }
  readPair(field1, field2) {
    var int1 = this.nextInt(field1);
    var int2 = this.nextInt(field2);
    return [int1, int2];
  }
  next(length) {
    var result = this.byteView.subarray(this.offset, this.offset + length);
    this.offset += length;
    return result;
  }
  isEnd() {
    return this.offset === this.byteView.length;
  }
  addPadding() {
    var offset = this.offset % 4;
    if (offset > 0) this.offset += 4 - offset;
  }
}

exports.TypeBuffer = TypeBuffer;
var toUint32 = buf => {
  var ln = void 0,
      res = void 0;
  if (!_detectNode2.default) //TODO browser behavior not equals, why?
    return new Uint32Array(buf);
  if (buf.readUInt32LE) {
    ln = buf.byteLength / 4;
    res = new Uint32Array(ln);
    for (var i = 0; i < ln; i++) {
      res[i] = buf.readUInt32LE(i * 4);
    }
  } else {
    //$FlowIssue
    var data = new DataView(buf);
    ln = data.byteLength / 4;
    res = new Uint32Array(ln);
    for (var _i = 0; _i < ln; _i++) {
      res[_i] = data.getUint32(_i * 4, true);
    }
  }
  return res;
};
//# sourceMappingURL=type-buffer.js.map