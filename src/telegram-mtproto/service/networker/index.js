'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUpdatesProcessor = exports.stopAll = exports.startAll = exports.getDeserializeOpts = exports.NetworkerFabric = exports.NetworkerThread = undefined;

var getMsgKeyIv = (() => {
  var _ref11 = _asyncToGenerator(_ref12);

  return function getMsgKeyIv(_x, _x2, _x3) {
    return _ref11.apply(this, arguments);
  };
})();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _is = require('ramda/src/is');

var _is2 = _interopRequireDefault(_is);

var _contains = require('ramda/src/contains');

var _contains2 = _interopRequireDefault(_contains);

var _mapObjIndexed = require('ramda/src/mapObjIndexed');

var _mapObjIndexed2 = _interopRequireDefault(_mapObjIndexed);

var _crypto = require('../../crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _timeManager = require('../time-manager');

var _secureRandom = require('../secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _netMessage = require('./net-message');

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _smartTimeout = require('../../util/smart-timeout');

var _smartTimeout2 = _interopRequireDefault(_smartTimeout);

var _http = require('../../http');

var _error = require('../../error');

var _log = require('../../util/log');

var _log2 = _interopRequireDefault(_log);

var _bin = require('../../bin');

var _tl = require('../../tl');

var _reader = require('../../tl/reader');

var _writer = require('../../tl/writer');

var _longPoll = require('../../plugins/long-poll');

var _longPoll2 = _interopRequireDefault(_longPoll);

var _mathHelp = require('../../plugins/math-help');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = _log2.default`networker`;

var updatesProcessor = void 0;
var iii = 0;
var akStopped = false;

//eslint-disable-next-line
// const xhrSendBuffer = !isNode && !('ArrayBufferView' in window)

var storeIntString = writer => (value, field) => {
  switch (typeof value) {
    case 'string':
      return (0, _writer.writeBytes)(writer, value, `${field}:string`);
    case 'number':
      return (0, _writer.writeInt)(writer, value, field);
    default:
      throw new Error(`tl storeIntString field ${field} value type ${typeof value}`);
  }
};

function _ref3() {}

class NetworkerThread {
  constructor({
    appConfig,
    chooseServer,
    Serialization,
    Deserialization,
    storage,
    emit
  }, dc, authKey, serverSalt, options) {
    _initialiseProps.call(this);

    this.appConfig = appConfig;
    this.chooseServer = chooseServer;
    this.Serialization = Serialization;
    this.Deserialization = Deserialization;
    this.storage = storage;
    this.emit = emit;
    this.dcID = dc;
    this.iii = iii++;

    this.longPoll = new _longPoll2.default(this);

    this.authKey = authKey;
    this.authKeyUint8 = (0, _bin.convertToUint8Array)(authKey);
    this.authKeyBuffer = (0, _bin.convertToArrayBuffer)(authKey);
    this.authKeyID = (0, _bin.sha1BytesSync)(authKey).slice(-8);

    //$FlowIssue
    this.wrapApiCall = this.wrapApiCall.bind(this);

    // this.checkLongPollCond = this.checkLongPollCond.bind(this)
    this.serverSalt = serverSalt;

    this.upload = options.fileUpload || options.fileDownload || false;

    this.updateSession();

    setInterval(this.checkLongPoll, 10000); //NOTE make configurable interval
    this.checkLongPoll();
  }
  updateSession() {
    this.seqNo = 0;
    this.prevSessionID = this.sessionID;
    this.sessionID = new Array(8);
    (0, _secureRandom2.default)(this.sessionID);
  }

  updateSentMessage(sentMessageID) {
    if (!this.state.hasSent(sentMessageID)) return false;
    var sentMessage = this.state.getSent(sentMessageID);

    if (sentMessage instanceof _netMessage.NetContainer) {
      var newInner = [];
      for (var _iterator = sentMessage.inner, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var innerID = _ref;

        var innerSentMessage = this.updateSentMessage(innerID);
        if (innerSentMessage) newInner.push(innerSentMessage.msg_id);
      }
      sentMessage.inner = newInner;
    }
    this.state.deleteSent(sentMessage);
    var newId = (0, _timeManager.generateID)();
    sentMessage.msg_id = newId;
    sentMessage.seq_no = this.generateSeqNo(sentMessage.notContentRelated || sentMessage.container);
    this.state.addSent(sentMessage);

    return sentMessage;
  }

  generateSeqNo(notContentRelated) {
    var seqNo = this.seqNo * 2;

    if (!notContentRelated) {
      seqNo++;
      this.seqNo++;
    }

    return seqNo;
  }

  wrapMtpCall(method, params, options) {
    var serializer = this.Serialization({ mtproto: true });

    serializer.storeMethod(method, params);

    var seqNo = this.generateSeqNo();
    var message = new _netMessage.NetMessage(seqNo, serializer.getBytes(true));
    log(`MT call`)(method, params, message.msg_id, seqNo);

    this.pushMessage(message, options);
    return message.deferred.promise;
  }

  wrapMtpMessage(object, options = {}) {

    var serializer = this.Serialization({ mtproto: true });
    serializer.storeObject(object, 'Object');

    var seqNo = this.generateSeqNo(options.notContentRelated);
    var message = new _netMessage.NetMessage(seqNo, serializer.getBytes(true));
    log(`MT message`)(message.msg_id, object, seqNo);
    verifyInnerMessages(object.msg_ids);
    this.pushMessage(message, options);
    return message;
  }

  wrapApiCall(method, params, options) {
    var serializer = this.Serialization(options);
    var serialBox = serializer.writer;
    if (!this.connectionInited) {
      // serializer.storeInt(0xda9b0d0d, 'invokeWithLayer')
      // serializer.storeInt(Config.Schema.API.layer, 'layer')
      // serializer.storeInt(0x69796de9, 'initConnection')
      // serializer.storeInt(Config.App.id, 'api_id')
      // serializer.storeString(navigator.userAgent || 'Unknown UserAgent', 'device_model')
      // serializer.storeString(navigator.platform || 'Unknown Platform', 'system_version')
      // serializer.storeString(Config.App.version, 'app_version')
      // serializer.storeString(navigator.language || 'en', 'lang_code')
      var mapper = storeIntString(serialBox);
      (0, _mapObjIndexed2.default)(mapper, this.appConfig);
    }

    if (options.afterMessageID) {
      (0, _writer.writeInt)(serialBox, 0xcb9f372d, 'invokeAfterMsg');
      (0, _writer.writeLong)(serialBox, options.afterMessageID, 'msg_id');
    }

    options.resultType = serializer.storeMethod(method, params);

    var seqNo = this.generateSeqNo();
    var message = new _netMessage.NetMessage(seqNo, serializer.getBytes(true));
    message.isAPI = true;

    log(`Api call`)(method, params, message.msg_id, seqNo, options);

    this.pushMessage(message, options);
    return message.deferred.promise;
  }

  pushMessage(message, options = {}) {
    message.copyOptions(options);
    this.state.addSent(message);
    this.state.setPending(message.msg_id);

    if (!options.noShedule) this.sheduleRequest();
    if ((0, _is2.default)(Object, options)) options.messageID = message.msg_id;
  }

  pushResend(messageID, delay) {
    var value = delay ? (0, _timeManager.tsNow)() + delay : 0;
    var sentMessage = this.state.getSent(messageID);
    if (sentMessage instanceof _netMessage.NetContainer) {
      for (var _iterator2 = sentMessage.inner, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var _msg = _ref2;

        this.state.setPending(_msg, value);
      }
    } else this.state.setPending(messageID, value);

    this.sheduleRequest(delay);
  }

  toggleOffline(enabled) {
    // console.log('toggle ', enabled, this.dcID, this.iii)
    if (!this.offline !== undefined && this.offline == enabled) return false;

    this.offline = enabled;

    if (this.offline) {
      _smartTimeout2.default.cancel(this.nextReqPromise);
      delete this.nextReq;

      if (this.checkConnectionPeriod < 1.5) this.checkConnectionPeriod = 0;

      this.checkConnectionPromise = (0, _smartTimeout2.default)(this.checkConnection, parseInt(this.checkConnectionPeriod * 1000));
      this.checkConnectionPeriod = Math.min(30, (1 + this.checkConnectionPeriod) * 1.5);

      this.onOnlineCb = this.checkConnection;
      this.emit('net.offline', this.onOnlineCb);
    } else {
      this.longPoll.pendingTime = -Infinity;
      //NOTE check long state was here
      this.checkLongPoll().then(_ref3);
      this.sheduleRequest();

      if (this.onOnlineCb) this.emit('net.online', this.onOnlineCb);

      _smartTimeout2.default.cancel(this.checkConnectionPromise);
    }
  }
  performResend() {
    if (this.state.hasResends()) {
      var resendMsgIDs = [...this.state.getResends()];
      var resendOpts = { noShedule: true, notContentRelated: true };
      // console.log('resendReq messages', resendMsgIDs)
      var msg = this.wrapMtpMessage({
        _: 'msg_resend_req',
        msg_ids: resendMsgIDs
      }, resendOpts);
      this.lastResendReq = { req_msg_id: msg.msg_id, resend_msg_ids: resendMsgIDs };
    }
  }

  requestPerformer(message, noResponseMsgs) {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        var result = yield _this.sendEncryptedRequest(message);
        _this.toggleOffline(false);
        var response = yield _this.parseResponse(result.data);
        log(`Server response`)(_this.dcID, response);

        yield _this.processMessage(response.response, response.messageID, response.sessionID);

        for (var _iterator3 = noResponseMsgs, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
          var _ref4;

          if (_isArray3) {
            if (_i3 >= _iterator3.length) break;
            _ref4 = _iterator3[_i3++];
          } else {
            _i3 = _iterator3.next();
            if (_i3.done) break;
            _ref4 = _i3.value;
          }

          var msgID = _ref4;

          if (_this.state.hasSent(msgID)) {
            var msg = _this.state.getSent(msgID);
            _this.state.deleteSent(msg);
            msg.deferred.resolve();
          }
        }_this.checkConnectionPeriod = Math.max(1.1, Math.sqrt(_this.checkConnectionPeriod));

        //return
        _this.checkLongPoll(); //TODO Bluebird warning here
      } catch (error) {
        console.log('Encrypted request failed', error);

        if (message instanceof _netMessage.NetContainer) {
          for (var _iterator4 = message.inner, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
            var _ref5;

            if (_isArray4) {
              if (_i4 >= _iterator4.length) break;
              _ref5 = _iterator4[_i4++];
            } else {
              _i4 = _iterator4.next();
              if (_i4.done) break;
              _ref5 = _i4.value;
            }

            var _msgID = _ref5;

            _this.state.setPending(_msgID);
          }_this.state.deleteSent(message);
        } else _this.state.setPending(message.msg_id);

        for (var _iterator5 = noResponseMsgs, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
          var _ref6;

          if (_isArray5) {
            if (_i5 >= _iterator5.length) break;
            _ref6 = _iterator5[_i5++];
          } else {
            _i5 = _iterator5.next();
            if (_i5.done) break;
            _ref6 = _i5.value;
          }

          var _msgID2 = _ref6;

          if (_this.state.hasSent(_msgID2)) {
            var _msg2 = _this.state.getSent(_msgID2);
            _this.state.deleteSent(_msg2);
            _this.state.deletePending(_msgID2);
            _msg2.deferred.reject();
          }
        }_this.toggleOffline(true);
        return _bluebird2.default.reject(error);
      }
    })();
  }

  parseResponse(responseBuffer) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      // console.log(dTime(), 'Start parsing response')
      // const self = this

      var deserializerRaw = _this2.Deserialization(responseBuffer);

      var authKeyID = deserializerRaw.fetchIntBytes(64, 'auth_key_id');
      if (!(0, _bin.bytesCmp)(authKeyID, _this2.authKeyID)) {
        throw new Error(`[MT] Invalid server auth_key_id: ${(0, _bin.bytesToHex)(authKeyID)}`);
      }
      var msgKey = deserializerRaw.fetchIntBytes(128, 'msg_key');
      var encryptedData = deserializerRaw.fetchRawBytes(responseBuffer.byteLength - deserializerRaw.getOffset(), 'encrypted_data');

      var [aesKey, aesIv] = yield getMsgKeyIv(_this2.authKeyUint8, msgKey, false);
      var dataWithPadding = yield _crypto2.default.aesDecrypt(encryptedData, aesKey, aesIv);
      // console.log(dTime(), 'after decrypt')
      var deserializer = _this2.Deserialization(dataWithPadding, { mtproto: true });

      deserializer.fetchIntBytes(64, 'salt');
      var sessionID = deserializer.fetchIntBytes(64, 'session_id');
      var messageID = (0, _reader.readLong)(deserializer.typeBuffer, 'message_id');

      var isInvalidSession = !(0, _bin.bytesCmp)(sessionID, _this2.sessionID) && (!_this2.prevSessionID ||
      //eslint-disable-next-line
      !(0, _bin.bytesCmp)(sessionID, _this2.prevSessionID));
      if (isInvalidSession) {
        console.warn('Sessions', sessionID, _this2.sessionID, _this2.prevSessionID);
        throw new Error(`[MT] Invalid server session_id: ${(0, _bin.bytesToHex)(sessionID)}`);
      }

      var seqNo = deserializer.fetchInt('seq_no');

      var offset = deserializer.getOffset();
      var totalLength = dataWithPadding.byteLength;

      var messageBodyLength = deserializer.fetchInt('message_data[length]');
      if (messageBodyLength % 4 || messageBodyLength > totalLength - offset) {
        throw new Error(`[MT] Invalid body length: ${messageBodyLength}`);
      }
      var messageBody = deserializer.fetchRawBytes(messageBodyLength, 'message_data');

      offset = deserializer.getOffset();
      var paddingLength = totalLength - offset;
      if (paddingLength < 0 || paddingLength > 15) throw new Error(`[MT] Invalid padding length: ${paddingLength}`);
      var hashData = (0, _bin.convertToUint8Array)(dataWithPadding).subarray(0, offset);

      var dataHash = yield _crypto2.default.sha1Hash(hashData);

      if (!(0, _bin.bytesCmp)(msgKey, (0, _bin.bytesFromArrayBuffer)(dataHash).slice(-16))) {
        console.warn(msgKey, (0, _bin.bytesFromArrayBuffer)(dataHash));
        throw new Error('[MT] server msgKey mismatch');
      }

      var buffer = (0, _bin.bytesToArrayBuffer)(messageBody);
      var deserializerOptions = getDeserializeOpts(_this2.getMsgById);
      var deserializerData = _this2.Deserialization(buffer, deserializerOptions);
      var response = deserializerData.fetchObject('', 'INPUT');

      return {
        response,
        messageID,
        sessionID,
        seqNo
      };
    })();
  }

  applyServerSalt(newServerSalt) {
    var serverSalt = (0, _bin.longToBytes)(newServerSalt);
    this.storage.set(`dc${this.dcID}_server_salt`, (0, _bin.bytesToHex)(serverSalt));

    this.serverSalt = serverSalt;
    return true;
  }

  sheduleRequest(delay = 0) {
    if (this.offline) this.checkConnection('forced shedule');
    var nextReq = (0, _timeManager.tsNow)() + delay;

    if (delay && this.nextReq && this.nextReq <= nextReq) return false;

    // console.log(dTime(), 'shedule req', delay)
    // console.trace()
    _smartTimeout2.default.cancel(this.nextReqPromise);
    if (delay > 0) this.nextReqPromise = (0, _smartTimeout2.default)(this.performSheduledRequest, delay);else (0, _smartTimeout.immediate)(this.performSheduledRequest);

    this.nextReq = nextReq;
  }

  ackMessage(msgID) {
    /*console.trace(msgID)
    if (this.pendingAcks.includes(msgID)) {
      debugger
    }*/
    // console.log('ack message', msgID)
    if ((0, _contains2.default)(msgID, this.pendingAcks)) return;
    this.pendingAcks.push(msgID);
    this.sheduleRequest(30000);
  }

  reqResendMessage(msgID) {
    log(`Req resend`)(msgID);
    this.state.addResend(msgID);
    this.sheduleRequest(100);
  }

  cleanupSent() {
    var notEmpty = false;
    // console.log('clean start', this.dcID/*, this.state.sent*/)

    for (var _iterator6 = this.state.sentIterator(), _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
      var _ref7;

      if (_isArray6) {
        if (_i6 >= _iterator6.length) break;
        _ref7 = _iterator6[_i6++];
      } else {
        _i6 = _iterator6.next();
        if (_i6.done) break;
        _ref7 = _i6.value;
      }

      var [msgID, message] = _ref7;

      var complete = true;
      if (message.notContentRelated && !this.state.hasPending(msgID))
        // console.log('clean notContentRelated', msgID)
        this.state.deleteSent(message);else if (message instanceof _netMessage.NetContainer) {
        for (var _iterator7 = message.inner, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
          var _ref8;

          if (_isArray7) {
            if (_i7 >= _iterator7.length) break;
            _ref8 = _iterator7[_i7++];
          } else {
            _i7 = _iterator7.next();
            if (_i7.done) break;
            _ref8 = _i7.value;
          }

          var inner = _ref8;

          if (this.state.hasSent(inner)) {
            // console.log('clean failed, found', msgID, message.inner[i],
            // this.state.getSent(message.inner[i]).seq_no)
            notEmpty = true;
            complete = false;
            break;
          }
        }
        // console.log('clean container', msgID)
        if (complete) this.state.deleteSent(message);
      } else notEmpty = true;
    }
    return !notEmpty;
  }

  processError(rawError) {
    var matches = (rawError.error_message || '').match(/^([A-Z_0-9]+\b)(: (.+))?/) || [];
    rawError.error_code = (0, _bin.uintToInt)(rawError.error_code);

    return new RawError({
      code: !rawError.error_code || rawError.error_code <= 0 ? 500 : rawError.error_code,
      type: matches[1] || 'UNKNOWN',
      description: matches[3] || `CODE#${rawError.error_code} ${rawError.error_message}`,
      originalError: rawError
    });
  }

  processMessage(message, messageID, sessionID) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      var msgidInt = parseInt(messageID.toString(10).substr(0, -10), 10);
      if (msgidInt % 2) {
        console.warn('[MT] Server even message id: ', messageID, message);
        return;
      }
      // console.log('process message', message, messageID, sessionID)
      switch (message._) {
        case 'msg_container':
          {
            for (var _iterator8 = message.messages, _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator]();;) {
              var _ref9;

              if (_isArray8) {
                if (_i8 >= _iterator8.length) break;
                _ref9 = _iterator8[_i8++];
              } else {
                _i8 = _iterator8.next();
                if (_i8.done) break;
                _ref9 = _i8.value;
              }

              var inner = _ref9;

              yield _this3.processMessage(inner, inner.msg_id, sessionID);
            }break;
          }
        case 'bad_server_salt':
          {
            log(`Bad server salt`)(message);
            var sentMessage = _this3.state.getSent(message.bad_msg_id);
            if (!sentMessage || sentMessage.seq_no != message.bad_msg_seqno) {
              log(`invalid message`)(message.bad_msg_id, message.bad_msg_seqno);
              throw new Error('[MT] Bad server salt for invalid message');
            }

            _this3.applyServerSalt(message.new_server_salt);
            _this3.pushResend(message.bad_msg_id);
            _this3.ackMessage(messageID);
            break;
          }
        case 'bad_msg_notification':
          {
            log(`Bad msg notification`)(message);
            var _sentMessage = _this3.state.getSent(message.bad_msg_id);
            if (!_sentMessage || _sentMessage.seq_no != message.bad_msg_seqno) {
              log(`invalid message`)(message.bad_msg_id, message.bad_msg_seqno);
              throw new Error('[MT] Bad msg notification for invalid message');
            }

            if (message.error_code == 16 || message.error_code == 17) {
              if ((0, _timeManager.applyServerTime)((0, _bin.rshift32)(messageID))) {
                log(`Update session`)();
                _this3.updateSession();
              }
              var badMessage = _this3.updateSentMessage(message.bad_msg_id);
              _this3.pushResend(badMessage.msg_id);
              _this3.ackMessage(messageID);
            }
            break;
          }
        case 'message':
          {
            if (_this3.lastServerMessages.indexOf(messageID) != -1) {
              // console.warn('[MT] Server same messageID: ', messageID)
              _this3.ackMessage(messageID);
              return;
            }
            _this3.lastServerMessages.push(messageID);
            if (_this3.lastServerMessages.length > 100) {
              _this3.lastServerMessages.shift();
            }
            yield _this3.processMessage(message.body, message.msg_id, sessionID);
            break;
          }
        case 'new_session_created':
          {
            _this3.ackMessage(messageID);

            _this3.processMessageAck(message.first_msg_id);
            _this3.applyServerSalt(message.server_salt);

            var baseDcID = yield _this3.storage.get('dc');
            var updateCond = baseDcID === _this3.dcID && !_this3.upload && updatesProcessor;
            if (updateCond) updatesProcessor(message, true);

            break;
          }
        case 'msgs_ack':
          {
            message.msg_ids.forEach(_this3.processMessageAck);
            break;
          }
        case 'msg_detailed_info':
          {
            if (!_this3.state.hasSent(message.msg_id)) {
              _this3.ackMessage(message.answer_msg_id);
              break;
            }
            break;
          }
        case 'msg_new_detailed_info':
          {
            _this3.ackMessage(message.answer_msg_id);
            _this3.reqResendMessage(message.answer_msg_id);
            break;
          }
        case 'msgs_state_info':
          {
            _this3.ackMessage(message.answer_msg_id);
            var spliceCond = _this3.lastResendReq &&
            //eslint-disable-next-line
            _this3.lastResendReq.req_msg_id == message.req_msg_id;
            if (spliceCond) {
              for (var _iterator9 = _this3.lastResendReq.resend_msg_ids, _isArray9 = Array.isArray(_iterator9), _i9 = 0, _iterator9 = _isArray9 ? _iterator9 : _iterator9[Symbol.iterator]();;) {
                var _ref10;

                if (_isArray9) {
                  if (_i9 >= _iterator9.length) break;
                  _ref10 = _iterator9[_i9++];
                } else {
                  _i9 = _iterator9.next();
                  if (_i9.done) break;
                  _ref10 = _i9.value;
                }

                var _badMsgID = _ref10;

                _this3.state.deleteResent(_badMsgID);
              }
            }break;
          }
        case 'rpc_result':
          {
            _this3.ackMessage(messageID);

            var sentMessageID = message.req_msg_id;
            var _sentMessage2 = _this3.state.getSent(sentMessageID);

            _this3.processMessageAck(sentMessageID);
            if (!_sentMessage2) break;

            var deferred = _sentMessage2.deferred;
            if (message.result._ == 'rpc_error') {
              var error = _this3.processError(message.result);
              log(`ERROR, Rpc error`)(error);
              var matched = error.type.match(/^(PHONE_MIGRATE_|NETWORK_MIGRATE_|USER_MIGRATE_)(\d+)/);
              if (matched && matched.length >= 2) {
                var [,, newDcID] = matched;
                if (+newDcID !== _this3.dcID) {
                  _this3.dcID = +newDcID;
                  yield _this3.storage.set('dc', +newDcID);
                }
              } else log('non phone error')(error.code, error.description);
              if (deferred) {
                deferred.reject(error);
              }
            } else {
              if (deferred) {
                log(`Rpc response`)(message.result);
                /*if (debug) {
                  console.log(dTime(), 'Rpc response', message.result)
                } else {
                  let dRes = message.result._
                  if (!dRes)
                    dRes = message.result.length > 5
                      ? `[..${  message.result.length  }..]`
                      : message.result
                  console.log(dTime(), 'Rpc response', dRes)
                }*/
                _sentMessage2.deferred.resolve(message.result);
              }
              if (_sentMessage2.isAPI) _this3.connectionInited = true;
            }
            _this3.state.deleteSent(_sentMessage2);
            break;
          }
        default:
          {
            _this3.ackMessage(messageID);

            // console.log('Update', message)
            if (updatesProcessor) updatesProcessor(message, true);
            break;
          }
      }
    })();
  }
}

exports.NetworkerThread = NetworkerThread;

var _initialiseProps = function () {
  var _this4 = this;

  this.pendingAcks = [];
  this.state = new _state2.default();
  this.connectionInited = false;
  this.checkConnectionPeriod = 0;
  this.lastServerMessages = [];

  this.checkLongPollCond = () => this.longPoll.pendingTime > (0, _timeManager.tsNow)() || !!this.offline || akStopped;

  this.checkLongPollAfterDcCond = (isClean, baseDc) => isClean && (this.dcID !== baseDc || this.upload || this.sleepAfter && this.sleepAfter < (0, _timeManager.tsNow)());

  this.checkLongPoll = _asyncToGenerator(function* () {
    var isClean = _this4.cleanupSent();
    if (_this4.checkLongPollCond()) return false;

    var baseDc = yield _this4.storage.get('dc');
    if (_this4.checkLongPollAfterDcCond(isClean, baseDc))
      // console.warn(dTime(), 'Send long-poll for DC is delayed', this.dcID, this.sleepAfter)
      return;
    return _this4.longPoll.sendLongPool();
  });

  function* _ref15(event) {
    log(`Check connection`)(event);
    _smartTimeout2.default.cancel(_this4.checkConnectionPromise);

    var serializer = _this4.Serialization({ mtproto: true });
    var pingID = (0, _mathHelp.getRandomId)();

    serializer.storeMethod('ping', { ping_id: pingID });

    var pingMessage = new _netMessage.NetMessage(_this4.generateSeqNo(true), serializer.getBytes());

    var succ = false;

    try {
      var result = yield _this4.sendEncryptedRequest(pingMessage, { timeout: 15000 });
      succ = true;
      _this4.toggleOffline(false);
      log(`checkConnection, result`)(result);
    } catch (err) {
      log(`encrypted request fail`)(err);
    }
    if (succ) return;
    var delay = _this4.checkConnectionPeriod * 1e3;
    log(`checkConnection, Delay`)(delay);
    _this4.checkConnectionPromise = (0, _smartTimeout2.default)(_this4.checkConnection, delay);
    _this4.checkConnectionPeriod = Math.min(60, _this4.checkConnectionPeriod * 1.5);
  }

  this.checkConnection = (() => {
    var _ref14 = _asyncToGenerator(_ref15);

    return function (_x4) {
      return _ref14.apply(this, arguments);
    };
  })();

  this.performSheduledRequest = () => {
    //TODO extract huge method
    // console.log(dTime(), 'sheduled', this.dcID, this.iii)
    if (this.offline || akStopped) {
      log(`Cancel sheduled`)(``);
      return _bluebird2.default.resolve(false);
    }
    delete this.nextReq;
    if (this.pendingAcks.length) {
      var ackMsgIDs = [];
      for (var _iterator10 = this.pendingAcks, _isArray10 = Array.isArray(_iterator10), _i10 = 0, _iterator10 = _isArray10 ? _iterator10 : _iterator10[Symbol.iterator]();;) {
        var _ref16;

        if (_isArray10) {
          if (_i10 >= _iterator10.length) break;
          _ref16 = _iterator10[_i10++];
        } else {
          _i10 = _iterator10.next();
          if (_i10.done) break;
          _ref16 = _i10.value;
        }

        var ack = _ref16;

        ackMsgIDs.push(ack);
      }log('acking messages')(ackMsgIDs);
      this.wrapMtpMessage({
        _: 'msgs_ack',
        msg_ids: ackMsgIDs
      }, {
        notContentRelated: true,
        noShedule: true
      });
      // const res = await msg.deferred.promise
      // log(`AWAITED`, `ack`)(res)
    }

    this.performResend();

    var messages = [];
    var message = void 0;
    var messagesByteLen = 0;
    // const currentTime = tsNow()
    var lengthOverflow = false;
    var singlesCount = 0;

    for (var _iterator11 = this.state.pendingIterator(), _isArray11 = Array.isArray(_iterator11), _i11 = 0, _iterator11 = _isArray11 ? _iterator11 : _iterator11[Symbol.iterator]();;) {
      var _ref17;

      if (_isArray11) {
        if (_i11 >= _iterator11.length) break;
        _ref17 = _iterator11[_i11++];
      } else {
        _i11 = _iterator11.next();
        if (_i11.done) break;
        _ref17 = _i11.value;
      }

      var [messageID, value] = _ref17;

      if (value && value < (0, _timeManager.tsNow)()) continue;
      this.state.deletePending(messageID);
      if (!this.state.hasSent(messageID)) continue;
      message = this.state.getSent(messageID);
      var messageByteLength = message.size() + 32;
      var cond1 = !message.notContentRelated && lengthOverflow;
      var cond2 = !message.notContentRelated && messagesByteLen + messageByteLength > 655360; // 640 Kb
      if (cond1) continue;
      if (cond2) {
        lengthOverflow = true;
        continue;
      }
      if (message.singleInRequest) {
        singlesCount++;
        if (singlesCount > 1) continue;
      }
      messages.push(message);
      messagesByteLen += messageByteLength;
    }

    if (!message) return _bluebird2.default.resolve(false);

    if (message.isAPI && !message.longPoll) {
      var serializer = this.Serialization({ mtproto: true });
      serializer.storeMethod('http_wait', {
        max_delay: 500,
        wait_after: 150,
        max_wait: 3000
      });
      messages.push(new _netMessage.NetMessage(this.generateSeqNo(), serializer.getBytes()));
      this.longPoll.writePollTime();
    }

    if (!messages.length) {
      // console.log('no sheduled messages')
      return _bluebird2.default.resolve();
    }

    var noResponseMsgs = [];

    if (messages.length > 1) {
      var container = this.Serialization({ mtproto: true, startMaxLength: messagesByteLen + 64 });
      var contBox = container.writer;
      (0, _writer.writeInt)(contBox, 0x73f1f8dc, 'CONTAINER[id]');
      (0, _writer.writeInt)(contBox, messages.length, 'CONTAINER[count]');
      var innerMessages = [];
      var i = 0;
      for (var _iterator12 = messages, _isArray12 = Array.isArray(_iterator12), _i12 = 0, _iterator12 = _isArray12 ? _iterator12 : _iterator12[Symbol.iterator]();;) {
        var _ref18;

        if (_isArray12) {
          if (_i12 >= _iterator12.length) break;
          _ref18 = _iterator12[_i12++];
        } else {
          _i12 = _iterator12.next();
          if (_i12.done) break;
          _ref18 = _i12.value;
        }

        var msg = _ref18;

        (0, _writer.writeLong)(contBox, msg.msg_id, `CONTAINER[${i}][msg_id]`);
        innerMessages.push(msg.msg_id);
        (0, _writer.writeInt)(contBox, msg.seq_no, `CONTAINER[${i}][seq_no]`);
        (0, _writer.writeInt)(contBox, msg.body.length, `CONTAINER[${i}][bytes]`);
        (0, _writer.writeIntBytes)(contBox, msg.body, false, `CONTAINER[${i}][body]`);
        if (msg.noResponse) noResponseMsgs.push(msg.msg_id);
        i++;
      }

      message = new _netMessage.NetContainer(this.generateSeqNo(true), container.getBytes(true), innerMessages);

      log(`Container`)(innerMessages, noResponseMsgs, message.msg_id, message.seq_no);
    } else {
      if (message.noResponse) noResponseMsgs.push(message.msg_id);
    }

    this.state.addSent(message);

    this.pendingAcks = []; //TODO WTF,he just clear and forget them at all?!?
    if (lengthOverflow || singlesCount > 1) this.sheduleRequest();

    return this.requestPerformer(message, noResponseMsgs);
  };

  function* _ref20(message, options = {}) {
    // console.log(dTime(), 'Send encrypted'/*, message*/)
    // console.trace()
    var data = _this4.Serialization({ startMaxLength: message.body.length + 64 });
    var dataBox = data.writer;
    (0, _writer.writeIntBytes)(dataBox, _this4.serverSalt, 64, 'salt');
    (0, _writer.writeIntBytes)(dataBox, _this4.sessionID, 64, 'session_id');
    (0, _writer.writeLong)(dataBox, message.msg_id, 'message_id');
    (0, _writer.writeInt)(dataBox, message.seq_no, 'seq_no');

    (0, _writer.writeInt)(dataBox, message.body.length, 'message_data_length');
    (0, _writer.writeIntBytes)(dataBox, message.body, false, 'message_data');

    var url = _this4.chooseServer(_this4.dcID, _this4.upload);

    var bytes = dataBox.getBuffer();

    var bytesHash = yield _crypto2.default.sha1Hash(bytes);
    var msgKey = new Uint8Array(bytesHash).subarray(4, 20);
    var [aesKey, aesIv] = yield getMsgKeyIv(_this4.authKeyUint8, msgKey, true);
    var encryptedBytes = yield _crypto2.default.aesEncrypt(bytes, aesKey, aesIv);

    var request = _this4.Serialization({ startMaxLength: encryptedBytes.byteLength + 256 });
    var requestBox = request.writer;
    (0, _writer.writeIntBytes)(requestBox, _this4.authKeyID, 64, 'auth_key_id');
    (0, _writer.writeIntBytes)(requestBox, msgKey, 128, 'msg_key');
    (0, _writer.writeIntBytes)(requestBox, encryptedBytes, false, 'encrypted_data');

    var requestData = requestBox.getArray();

    options = Object.assign({ responseType: 'arraybuffer' }, options);

    try {
      var result = yield _http.httpClient.post(url, requestData, options);
      return !result.data || !result.data.byteLength ? _bluebird2.default.reject(new _error.ErrorBadResponse(url, result)) : result;
    } catch (error) {
      return _bluebird2.default.reject(new _error.ErrorBadRequest(url, error));
    }
  }

  this.sendEncryptedRequest = (() => {
    var _ref19 = _asyncToGenerator(_ref20);

    return function (_x5) {
      return _ref19.apply(this, arguments);
    };
  })();

  this.getMsgById = ({ req_msg_id }) => this.state.getSent(req_msg_id);

  this.processMessageAck = messageID => {
    var sentMessage = this.state.getSent(messageID);
    if (sentMessage && !sentMessage.acked) {
      delete sentMessage.body;
      sentMessage.acked = true;
      return true;
    }
    return false;
  };
};

class RawError extends Error {
  constructor(obj) {
    super(`${obj.code} ${obj.type} ${obj.description}`);
    this.code = obj.code;
    this.type = obj.type;
    this.description = obj.description;
    this.originalError = obj.originalError;
  }
}

var NetworkerFabric = exports.NetworkerFabric = (appConfig, { Serialization, Deserialization }, storage, emit) => chooseServer => (dc, authKey, serverSalt, options = {}) => new NetworkerThread({
  appConfig,
  chooseServer,
  Serialization,
  Deserialization,
  storage,
  emit
}, dc, authKey, serverSalt, options);

var getDeserializeOpts = exports.getDeserializeOpts = msgGetter => ({
  mtproto: true,
  override: {
    mt_message(result, field) {
      result.msg_id = (0, _reader.readLong)(this.typeBuffer, `${field}[msg_id]`);
      result.seqno = (0, _reader.readInt)(this.typeBuffer, `${field}[seqno]`);
      result.bytes = (0, _reader.readInt)(this.typeBuffer, `${field}[bytes]`);

      var offset = this.getOffset();

      try {
        result.body = this.fetchObject('Object', `${field}[body]`);
      } catch (e) {
        console.error((0, _timeManager.dTime)(), 'parse error', e.message, e.stack);
        result.body = { _: 'parse_error', error: e };
      }
      if (this.typeBuffer.offset != offset + result.bytes) {
        // console.warn(dTime(), 'set offset', this.offset, offset, result.bytes)
        // console.log(dTime(), result)
        this.typeBuffer.offset = offset + result.bytes;
      }
      // console.log(dTime(), 'override message', result)
    },
    mt_rpc_result(result, field) {
      result.req_msg_id = (0, _reader.readLong)(this.typeBuffer, `${field}[req_msg_id]`);

      var sentMessage = msgGetter(result);
      var type = sentMessage && sentMessage.resultType || 'Object';

      if (result.req_msg_id && !sentMessage) {
        // console.warn(dTime(), 'Result for unknown message', result)
        return;
      }
      result.result = this.fetchObject(type, `${field}[result]`);
      // console.log(dTime(), 'override rpc_result', sentMessage, type, result)
    }
  }
});

var startAll = exports.startAll = () => {
  if (akStopped) {
    akStopped = false;
    updatesProcessor({ _: 'new_session_created' }, true);
  }
};

var stopAll = exports.stopAll = () => akStopped = true;

var setUpdatesProcessor = exports.setUpdatesProcessor = callback => updatesProcessor = callback;

exports.default = NetworkerFabric;


var verifyInnerMessages = messages => {
  if (messages.length !== new Set(messages).size) {
    console.log(`!!!!!!WARN!!!!!!`, 'container check failed', messages);
    // throw new Error('Container bug')
  }
};

function* _ref12(authKey, msgKey, isOut) {
  var x = isOut ? 0 : 8;
  var sha1aText = new Uint8Array(48);
  var sha1bText = new Uint8Array(48);
  var sha1cText = new Uint8Array(48);
  var sha1dText = new Uint8Array(48);
  var promises = [];

  sha1aText.set(msgKey, 0);
  sha1aText.set(authKey.subarray(x, x + 32), 16);
  promises.push(_crypto2.default.sha1Hash(sha1aText));

  sha1bText.set(authKey.subarray(x + 32, x + 48), 0);
  sha1bText.set(msgKey, 16);
  sha1bText.set(authKey.subarray(x + 48, x + 64), 32);
  promises.push(_crypto2.default.sha1Hash(sha1bText));

  sha1cText.set(authKey.subarray(x + 64, x + 96), 0);
  sha1cText.set(msgKey, 32);
  promises.push(_crypto2.default.sha1Hash(sha1cText));

  sha1dText.set(msgKey, 0);
  sha1dText.set(authKey.subarray(x + 96, x + 128), 16);
  promises.push(_crypto2.default.sha1Hash(sha1dText));

  var results = yield _bluebird2.default.all(promises);
  var aesKey = new Uint8Array(32),
      aesIv = new Uint8Array(32),
      sha1a = new Uint8Array(results[0]),
      sha1b = new Uint8Array(results[1]),
      sha1c = new Uint8Array(results[2]),
      sha1d = new Uint8Array(results[3]);

  aesKey.set(sha1a.subarray(0, 8));
  aesKey.set(sha1b.subarray(8, 20), 8);
  aesKey.set(sha1c.subarray(4, 16), 20);

  aesIv.set(sha1a.subarray(8, 20));
  aesIv.set(sha1b.subarray(0, 8), 12);
  aesIv.set(sha1c.subarray(16, 20), 20);
  aesIv.set(sha1d.subarray(0, 8), 24);

  var result = [aesKey, aesIv];
  return result;
}
//# sourceMappingURL=index.js.map