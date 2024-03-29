'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyManager = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _writer = require('../tl/writer');

var _bin = require('../bin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var KeyManager = exports.KeyManager = (Serialization, publisKeysHex, publicKeysParsed) => {
  var prepareRsaKeys = (() => {
    var _ref = _asyncToGenerator(_ref2);

    return function prepareRsaKeys() {
      return _ref.apply(this, arguments);
    };
  })();

  var selectRsaKeyByFingerPrint = (() => {
    var _ref3 = _asyncToGenerator(_ref5);

    return function selectRsaKeyByFingerPrint(_x) {
      return _ref3.apply(this, arguments);
    };
  })();

  var prepared = false;

  var mapPrepare = ({ modulus, exponent }) => {
    var RSAPublicKey = Serialization();
    var rsaBox = RSAPublicKey.writer;
    (0, _writer.writeBytes)(rsaBox, (0, _bin.bytesFromHex)(modulus), 'n');
    (0, _writer.writeBytes)(rsaBox, (0, _bin.bytesFromHex)(exponent), 'e');

    var buffer = rsaBox.getBuffer();

    var fingerprintBytes = (0, _bin.sha1BytesSync)(buffer).slice(-8);
    fingerprintBytes.reverse();

    publicKeysParsed[(0, _bin.bytesToHex)(fingerprintBytes)] = {
      modulus,
      exponent
    };
  };

  function* _ref2() {
    if (prepared) return;

    yield _bluebird2.default.map(publisKeysHex, mapPrepare);

    prepared = true;
  }

  function* _ref5(fingerprints) {
    yield prepareRsaKeys();

    var fingerprintHex = void 0,
        foundKey = void 0;
    for (var _iterator = fingerprints, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref4 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref4 = _i.value;
      }

      var fingerprint = _ref4;

      fingerprintHex = (0, _bin.strDecToHex)(fingerprint);
      foundKey = publicKeysParsed[fingerprintHex];
      if (foundKey) return Object.assign({ fingerprint }, foundKey);
    }
    return false;
  }

  return {
    prepare: prepareRsaKeys,
    select: selectRsaKeyByFingerPrint
  };
};

exports.default = KeyManager;
//# sourceMappingURL=rsa-keys-manger.js.map