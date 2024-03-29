'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Auth = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _defer = require('../../util/defer');

var _defer2 = _interopRequireDefault(_defer);

var _smartTimeout = require('../../util/smart-timeout');

var _crypto = require('../../crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _secureRandom = require('../secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _timeManager = require('../time-manager');

var _bin = require('../../bin');

var _leemon = require('../../vendor/leemon');

var _log = require('../../util/log');

var _log2 = _interopRequireDefault(_log);

var _sendPlainReq = require('./send-plain-req');

var _sendPlainReq2 = _interopRequireDefault(_sendPlainReq);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = _log2.default`auth`;

// import { ErrorBadResponse } from '../../error'

var primeHex = 'c71caeb9c6b1c9048e6c522f70f13f73980d40238e3e21c14934d037563d93' + '0f48198a0aa7c14058229493d22530f4dbfa336f6e0ac925139543aed44cce7c3720fd51f6945' + '8705ac68cd4fe6b6b13abdc9746512969328454f18faf8c595f642477fe96bb2a941d5bcd1d4a' + 'c8cc49880708fa9b378e3c4f3a9060bee67cf9a4a4a695811051907e162753b56b0f6b410dba7' + '4d8a84b2a14b3144e0ef1284754fd17ed950d5965b4b9dd46582db1178d169c6bc465b0d6ff9c' + 'a3928fef5b9ae4e418fc15e83ebea0f87fa9ff5eed70050ded2849f47bf959d956850ce929851' + 'f0d8115f635b105ee2e4e15d04b2454bf6f4fadf034b10403119cd8e3b92fcc5b';

var concat = (e1, e2) => [...e1, ...e2];

var tmpAesKey = (serverNonce, newNonce) => {
  var arr1 = concat(newNonce, serverNonce);
  var arr2 = concat(serverNonce, newNonce);
  var key1 = (0, _bin.sha1BytesSync)(arr1);
  var key2 = (0, _bin.sha1BytesSync)(arr2).slice(0, 12);
  return key1.concat(key2);
};

var tmpAesIv = (serverNonce, newNonce) => {
  var arr1 = concat(serverNonce, newNonce);
  var arr2 = concat(newNonce, newNonce);
  var arr3 = newNonce.slice(0, 4);
  var key1 = (0, _bin.sha1BytesSync)(arr1);
  var key2 = (0, _bin.sha1BytesSync)(arr2);
  return key1.slice(12).concat(key2, arr3);
};

var minSize = Math.ceil(64 / _leemon.bpe) + 1;

var getTwoPow = () => {
  //Dirty cheat to count 2^(2048 - 64)
  //This number contains 496 zeroes in hex
  var arr = Array(496).fill('0');
  arr.unshift('1');
  var hex = arr.join('');
  var res = (0, _leemon.str2bigInt)(hex, 16, minSize);
  return res;
};

var leemonTwoPow = getTwoPow();

var Auth = exports.Auth = ({ Serialization, Deserialization }, { select, prepare }) => {
  var mtpSendReqPQ = (() => {
    var _ref = _asyncToGenerator(_ref2);

    return function mtpSendReqPQ(_x) {
      return _ref.apply(this, arguments);
    };
  })();

  var mtpSendReqDhParams = (() => {
    var _ref3 = _asyncToGenerator(_ref4);

    return function mtpSendReqDhParams(_x2) {
      return _ref3.apply(this, arguments);
    };
  })();

  var mtpSendSetClientDhParams = (() => {
    var _ref5 = _asyncToGenerator(_ref6);

    return function mtpSendSetClientDhParams(_x3) {
      return _ref5.apply(this, arguments);
    };
  })();

  var sendPlainReq = (0, _sendPlainReq2.default)({ Serialization, Deserialization });

  function* _ref2(auth) {
    var deferred = auth.deferred;
    log('Send req_pq')((0, _bin.bytesToHex)(auth.nonce));

    var request = Serialization({ mtproto: true });
    var reqBox = request.writer;
    request.storeMethod('req_pq', { nonce: auth.nonce });

    var deserializer = void 0;
    try {
      yield prepare();
      deserializer = yield sendPlainReq(auth.dcUrl, reqBox.getBuffer());
    } catch (err) {
      console.error((0, _timeManager.dTime)(), 'req_pq error', err.message);
      deferred.reject(err);
      throw err;
    }

    try {
      var response = deserializer.fetchObject('ResPQ', 'ResPQ');

      if (response._ !== 'resPQ') {
        var error = new Error(`[MT] resPQ response invalid: ${response._}`);
        deferred.reject(error);
        return _bluebird2.default.reject(error);
      }
      if (!(0, _bin.bytesCmp)(auth.nonce, response.nonce)) {
        var _error = new Error('[MT] resPQ nonce mismatch');
        deferred.reject(_error);
        return _bluebird2.default.reject(_error);
      }
      auth.serverNonce = response.server_nonce;
      auth.pq = response.pq;
      auth.fingerprints = response.server_public_key_fingerprints;

      log('Got ResPQ')((0, _bin.bytesToHex)(auth.serverNonce), (0, _bin.bytesToHex)(auth.pq), auth.fingerprints);

      var key = yield select(auth.fingerprints);

      if (key) auth.publicKey = key;else {
        var _error2 = new Error('[MT] No public key found');
        deferred.reject(_error2);
        return _bluebird2.default.reject(_error2);
      }
      log('PQ factorization start')(auth.pq);
      var [_p, _q, it] = yield _crypto2.default.factorize(auth.pq);

      auth.p = _p;
      auth.q = _q;
      log('PQ factorization done')(it);
    } catch (error) {
      log('Worker error')(error, error.stack);
      deferred.reject(error);
      throw error;
    }

    return auth;
  }

  function* _ref4(auth) {
    var deferred = auth.deferred;

    auth.newNonce = new Array(32);
    (0, _secureRandom2.default)(auth.newNonce);

    var data = Serialization({ mtproto: true });
    var dataBox = data.writer;
    data.storeObject({
      _: 'p_q_inner_data',
      pq: auth.pq,
      p: auth.p,
      q: auth.q,
      nonce: auth.nonce,
      server_nonce: auth.serverNonce,
      new_nonce: auth.newNonce
    }, 'P_Q_inner_data', 'DECRYPTED_DATA');

    var dataWithHash = (0, _bin.sha1BytesSync)(dataBox.getBuffer()).concat(data.getBytes());

    var request = Serialization({ mtproto: true });
    var reqBox = request.writer;
    request.storeMethod('req_DH_params', {
      nonce: auth.nonce,
      server_nonce: auth.serverNonce,
      p: auth.p,
      q: auth.q,
      public_key_fingerprint: auth.publicKey.fingerprint,
      encrypted_data: (0, _bin.rsaEncrypt)(auth.publicKey, dataWithHash)
    });

    log('afterReqDH')('Send req_DH_params');

    var deserializer = void 0;
    try {
      deserializer = yield sendPlainReq(auth.dcUrl, reqBox.getBuffer());
    } catch (error) {
      deferred.reject(error);
      throw error;
    }

    var response = deserializer.fetchObject('Server_DH_Params', 'RESPONSE');

    if (response._ !== 'server_DH_params_fail' && response._ !== 'server_DH_params_ok') {
      var error = new Error(`[MT] Server_DH_Params response invalid: ${response._}`);
      deferred.reject(error);
      throw error;
    }

    if (!(0, _bin.bytesCmp)(auth.nonce, response.nonce)) {
      var _error3 = new Error('[MT] Server_DH_Params nonce mismatch');
      deferred.reject(_error3);
      throw _error3;
    }

    if (!(0, _bin.bytesCmp)(auth.serverNonce, response.server_nonce)) {
      var _error4 = new Error('[MT] Server_DH_Params server_nonce mismatch');
      deferred.reject(_error4);
      throw _error4;
    }

    if (response._ === 'server_DH_params_fail') {
      var newNonceHash = (0, _bin.sha1BytesSync)(auth.newNonce).slice(-16);
      if (!(0, _bin.bytesCmp)(newNonceHash, response.new_nonce_hash)) {
        var _error6 = new Error('[MT] server_DH_params_fail new_nonce_hash mismatch');
        deferred.reject(_error6);
        throw _error6;
      }
      var _error5 = new Error('[MT] server_DH_params_fail');
      deferred.reject(_error5);
      throw _error5;
    }

    // try {
    mtpDecryptServerDhDataAnswer(auth, response.encrypted_answer);
    // } catch (e) {
    //   deferred.reject(e)
    //   return false
    // }

    return auth;
  }

  function mtpDecryptServerDhDataAnswer(auth, encryptedAnswer) {
    auth.tmpAesKey = tmpAesKey(auth.serverNonce, auth.newNonce);
    auth.tmpAesIv = tmpAesIv(auth.serverNonce, auth.newNonce);

    var answerWithHash = (0, _bin.aesDecryptSync)(encryptedAnswer, auth.tmpAesKey, auth.tmpAesIv);

    var hash = answerWithHash.slice(0, 20);
    var answerWithPadding = answerWithHash.slice(20);
    var buffer = (0, _bin.bytesToArrayBuffer)(answerWithPadding);

    var deserializer = Deserialization(buffer, { mtproto: true });
    var response = deserializer.fetchObject('Server_DH_inner_data', 'server_dh');

    if (response._ !== 'server_DH_inner_data') throw new Error(`[MT] server_DH_inner_data response invalid`);

    if (!(0, _bin.bytesCmp)(auth.nonce, response.nonce)) throw new Error('[MT] server_DH_inner_data nonce mismatch');

    if (!(0, _bin.bytesCmp)(auth.serverNonce, response.server_nonce)) throw new Error('[MT] server_DH_inner_data serverNonce mismatch');

    log('DecryptServerDhDataAnswer')('Done decrypting answer');
    auth.g = response.g;
    auth.dhPrime = response.dh_prime;
    auth.gA = response.g_a;
    auth.serverTime = response.server_time;
    auth.retry = 0;

    mtpVerifyDhParams(auth.g, auth.dhPrime, auth.gA);

    var offset = deserializer.getOffset();

    if (!(0, _bin.bytesCmp)(hash, (0, _bin.sha1BytesSync)(answerWithPadding.slice(0, offset)))) throw new Error('[MT] server_DH_inner_data SHA1-hash mismatch');

    auth.localTime = (0, _timeManager.tsNow)();
    (0, _timeManager.applyServerTime)(auth.serverTime, auth.localTime);
  }

  var innerLog = log('VerifyDhParams');

  function mtpVerifyDhParams(g, dhPrime, gA) {
    innerLog('begin');
    var dhPrimeHex = (0, _bin.bytesToHex)(dhPrime);
    if (g !== 3 || dhPrimeHex !== primeHex)
      // The verified value is from https://core.telegram.org/mtproto/security_guidelines
      throw new Error('[MT] DH params are not verified: unknown dhPrime');
    innerLog('dhPrime cmp OK');

    // const gABigInt = new BigInteger(bytesToHex(gA), 16)
    // const dhPrimeBigInt = new BigInteger(dhPrimeHex, 16)

    var dhPrimeLeemon = (0, _leemon.str2bigInt)(dhPrimeHex, 16, minSize);
    var gALeemon = (0, _leemon.str2bigInt)((0, _bin.bytesToHex)(gA), 16, minSize);
    var dhDec = (0, _leemon.dup)(dhPrimeLeemon);
    (0, _leemon.sub_)(dhDec, _leemon.one);
    // const dhDecStr = bigInt2str(dhDec, 16)
    // const comp = dhPrimeBigInt.subtract(BigInteger.ONE).toString(16)
    // console.log(dhPrimeLeemon, dhDecStr === comp)
    var case1 = !(0, _leemon.greater)(gALeemon, _leemon.one);
    //gABigInt.compareTo(BigInteger.ONE) <= 0
    var case2 = !(0, _leemon.greater)(dhDec, gALeemon);
    //gABigInt.compareTo(dhPrimeBigInt.subtract(BigInteger.ONE)) >= 0
    if (case1) throw new Error('[MT] DH params are not verified: gA <= 1');

    if (case2) throw new Error('[MT] DH params are not verified: gA >= dhPrime - 1');
    // console.log(dTime(), '1 < gA < dhPrime-1 OK')


    // const two = new BigInteger(null)
    // two.fromInt(2)
    // const twoPow = two.pow(2048 - 64)

    var case3 = !!(0, _leemon.greater)(leemonTwoPow, gALeemon);
    //gABigInt.compareTo(twoPow) < 0
    var dhSubPow = (0, _leemon.dup)(dhPrimeLeemon);
    (0, _leemon.sub)(dhSubPow, leemonTwoPow);
    var case4 = !(0, _leemon.greater)(dhSubPow, gALeemon);
    //gABigInt.compareTo(dhPrimeBigInt.subtract(twoPow)) >= 0
    // console.log(case3 === gABigInt.compareTo(twoPow) < 0)
    if (case3) throw new Error('[MT] DH params are not verified: gA < 2^{2048-64}');
    if (case4) throw new Error('[MT] DH params are not verified: gA > dhPrime - 2^{2048-64}');
    innerLog('2^{2048-64} < gA < dhPrime-2^{2048-64} OK');

    return true;
  }

  function* _ref6(auth) {
    var deferred = auth.deferred;
    var gBytes = (0, _bin.bytesFromHex)(auth.g.toString(16));

    auth.b = new Array(256);
    (0, _secureRandom2.default)(auth.b);

    var gB = yield _crypto2.default.modPow(gBytes, auth.b, auth.dhPrime);
    var data = Serialization({ mtproto: true });

    data.storeObject({
      _: 'client_DH_inner_data',
      nonce: auth.nonce,
      server_nonce: auth.serverNonce,
      retry_id: [0, auth.retry++],
      g_b: gB
    }, 'Client_DH_Inner_Data', 'client_DH');

    var dataWithHash = (0, _bin.sha1BytesSync)(data.writer.getBuffer()).concat(data.getBytes());

    var encryptedData = (0, _bin.aesEncryptSync)(dataWithHash, auth.tmpAesKey, auth.tmpAesIv);

    var request = Serialization({ mtproto: true });

    request.storeMethod('set_client_DH_params', {
      nonce: auth.nonce,
      server_nonce: auth.serverNonce,
      encrypted_data: encryptedData
    });

    log('onGb')('Send set_client_DH_params');

    var deserializer = yield sendPlainReq(auth.dcUrl, request.writer.getBuffer());

    var response = deserializer.fetchObject('Set_client_DH_params_answer', 'client_dh');

    if (response._ != 'dh_gen_ok' && response._ != 'dh_gen_retry' && response._ != 'dh_gen_fail') {
      var error = new Error(`[MT] Set_client_DH_params_answer response invalid: ${response._}`);
      deferred.reject(error);
      throw error;
    }

    if (!(0, _bin.bytesCmp)(auth.nonce, response.nonce)) {
      var _error7 = new Error('[MT] Set_client_DH_params_answer nonce mismatch');
      deferred.reject(_error7);
      throw _error7;
    }

    if (!(0, _bin.bytesCmp)(auth.serverNonce, response.server_nonce)) {
      var _error8 = new Error('[MT] Set_client_DH_params_answer server_nonce mismatch');
      deferred.reject(_error8);
      throw _error8;
    }

    var authKey = yield _crypto2.default.modPow(auth.gA, auth.b, auth.dhPrime);

    var authKeyHash = (0, _bin.sha1BytesSync)(authKey),
        authKeyAux = authKeyHash.slice(0, 8),
        authKeyID = authKeyHash.slice(-8);

    log('Got Set_client_DH_params_answer')(response._);
    switch (response._) {
      case 'dh_gen_ok':
        {
          var newNonceHash1 = (0, _bin.sha1BytesSync)(auth.newNonce.concat([1], authKeyAux)).slice(-16);

          if (!(0, _bin.bytesCmp)(newNonceHash1, response.new_nonce_hash1)) {
            deferred.reject(new Error('[MT] Set_client_DH_params_answer new_nonce_hash1 mismatch'));
            return false;
          }

          var _serverSalt = (0, _bin.bytesXor)(auth.newNonce.slice(0, 8), auth.serverNonce.slice(0, 8));
          // console.log('Auth successfull!', authKeyID, authKey, serverSalt)

          auth.authKeyID = authKeyID;
          auth.authKey = authKey;
          auth.serverSalt = _serverSalt;

          deferred.resolve(auth);
          break;
        }
      case 'dh_gen_retry':
        {
          var newNonceHash2 = (0, _bin.sha1BytesSync)(auth.newNonce.concat([2], authKeyAux)).slice(-16);
          if (!(0, _bin.bytesCmp)(newNonceHash2, response.new_nonce_hash2)) {
            deferred.reject(new Error('[MT] Set_client_DH_params_answer new_nonce_hash2 mismatch'));
            return false;
          }

          return mtpSendSetClientDhParams(auth);
        }
      case 'dh_gen_fail':
        {
          var newNonceHash3 = (0, _bin.sha1BytesSync)(auth.newNonce.concat([3], authKeyAux)).slice(-16);
          if (!(0, _bin.bytesCmp)(newNonceHash3, response.new_nonce_hash3)) {
            deferred.reject(new Error('[MT] Set_client_DH_params_answer new_nonce_hash3 mismatch'));
            return false;
          }

          deferred.reject(new Error('[MT] Set_client_DH_params_answer fail'));
          return false;
        }
    }
  }

  var authChain = auth => mtpSendReqPQ(auth).then(mtpSendReqDhParams).then(mtpSendSetClientDhParams);

  function mtpAuth(dcID, cached, dcUrl) {
    if (cached[dcID]) return cached[dcID].promise;
    log('mtpAuth', 'dcID', 'dcUrl')(dcID, dcUrl);
    var nonce = (0, _bin.generateNonce)();

    if (!dcUrl) return _bluebird2.default.reject(new Error(`[MT] No server found for dc ${dcID} url ${dcUrl}`));

    var auth = {
      dcID,
      dcUrl,
      nonce,
      deferred: (0, _defer2.default)()
    };

    var onFail = err => {
      log('authChain', 'error')(err);
      cached[dcID].reject(err);
      delete cached[dcID];
      return _bluebird2.default.reject(err);
    };

    try {
      (0, _smartTimeout.immediate)(authChain, auth);
    } catch (err) {
      return onFail(err);
    }

    cached[dcID] = auth.deferred;

    cached[dcID].promise.catch(onFail);

    return cached[dcID].promise;
  }

  return mtpAuth;
};
exports.default = Auth;
//# sourceMappingURL=index.js.map