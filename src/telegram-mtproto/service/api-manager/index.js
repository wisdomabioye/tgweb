'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApiManager = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _propEq = require('ramda/src/propEq');

var _propEq2 = _interopRequireDefault(_propEq);

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _log = require('../../util/log');

var _log2 = _interopRequireDefault(_log);

var _authorizer = require('../authorizer');

var _authorizer2 = _interopRequireDefault(_authorizer);

var _defer = require('../../util/defer');

var _defer2 = _interopRequireDefault(_defer);

var _timeManager = require('../time-manager');

var _dcConfigurator = require('../dc-configurator');

var _rsaKeysManger = require('../rsa-keys-manger');

var _rsaKeysManger2 = _interopRequireDefault(_rsaKeysManger);

var _error = require('../../error');

var _bin = require('../../bin');

var _errorCases = require('./error-cases');

var _smartTimeout = require('../../util/smart-timeout');

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
// import UpdatesManager from '../updates'

var debug = _log2.default`api-manager`;

var baseDcID = 2;

var Ln = (length, obj) => obj && (0, _propEq2.default)('length', length, obj);

class ApiManager {
  constructor(config, tls, netFabric, { on, emit }) {
    var _this = this;

    this.cache = {
      uploader: {},
      downloader: {},
      auth: {},
      servers: {},
      keysParsed: {}
    };
    this.authPromise = (0, _defer2.default)();
    this.authBegin = false;
    this.currentDc = 2;
    this.online = false;

    this.networkSetter = (dc, options) => (authKey, serverSalt) => {
      var networker = this.networkFabric(dc, authKey, serverSalt, options);
      this.cache.downloader[dc] = networker;
      return networker;
    };

    function* _ref2(dcID, userAuth) {
      var fullUserAuth = Object.assign({ dcID }, userAuth);
      yield _this.storage.set('dc', dcID);
      yield _this.storage.set('user_auth', fullUserAuth);
      _this.emit('auth.dc', { dc: dcID, auth: userAuth });
    }

    this.setUserAuth = (() => {
      var _ref = _asyncToGenerator(_ref2);

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })();

    var {
      server,
      api,
      app: {
        storage,
        publicKeys
      },
      schema,
      mtSchema
    } = config;
    this.apiConfig = api;
    this.publicKeys = publicKeys;
    this.storage = storage;
    this.serverConfig = server;
    this.schema = schema;
    this.mtSchema = mtSchema;
    this.chooseServer = (0, _dcConfigurator.chooseServer)(this.cache.servers, server);
    this.on = on;
    this.emit = emit;
    this.TL = tls;
    this.keyManager = (0, _rsaKeysManger2.default)(this.TL.Serialization, publicKeys, this.cache.keysParsed);
    this.auth = (0, _authorizer2.default)(this.TL, this.keyManager);
    this.networkFabric = netFabric(this.chooseServer);

    //$FlowIssue
    this.mtpInvokeApi = this.mtpInvokeApi.bind(this);
    //$FlowIssue
    this.mtpGetNetworker = this.mtpGetNetworker.bind(this);

    // this.updatesManager = UpdatesManager(apiManager, this.TL)
    // apiManager.updates = this.updatesManager
  }

  mtpGetNetworker(dcID, options = {}) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      // const isUpload = options.fileUpload || options.fileDownload
      // const cache = isUpload
      //   ? this.cache.uploader
      //   : this.cache.downloader

      var cache = _this2.cache.downloader;
      if (!dcID) throw new Error('get Networker without dcID');

      if ((0, _has2.default)(dcID, cache)) return cache[dcID];

      var akk = `dc${dcID}_auth_key`;
      var ssk = `dc${dcID}_server_salt`;

      var dcUrl = _this2.chooseServer(dcID, false);

      var networkSetter = _this2.networkSetter(dcID, options);

      if (cache[dcID]) return cache[dcID];

      var authKeyHex = yield _this2.storage.get(akk);
      var serverSaltHex = yield _this2.storage.get(ssk);

      if (Ln(512, authKeyHex)) {
        if (!serverSaltHex || serverSaltHex.length !== 16) serverSaltHex = 'AAAAAAAAAAAAAAAA';
        var _authKey = (0, _bin.bytesFromHex)(authKeyHex);
        var _serverSalt = (0, _bin.bytesFromHex)(serverSaltHex);

        return networkSetter(_authKey, _serverSalt);
      }

      if (!options.createNetworker) throw new _error.AuthKeyError();

      var auth = void 0;
      try {
        auth = yield _this2.auth(dcID, _this2.cache.auth, dcUrl);
      } catch (error) {
        return netError(error);
      }

      var { authKey, serverSalt } = auth;

      yield _this2.storage.set(akk, (0, _bin.bytesToHex)(authKey));
      yield _this2.storage.set(ssk, (0, _bin.bytesToHex)(serverSalt));

      return networkSetter(authKey, serverSalt);
    })();
  }
  doAuth() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.authBegin = true;
      try {
        var storedBaseDc = yield _this3.storage.get('dc');
        var baseDc = storedBaseDc || baseDcID;
        var opts = {
          dcID: baseDc,
          createNetworker: true
        };
        var networker = yield _this3.mtpGetNetworker(baseDc, opts);
        var nearestDc = yield networker.wrapApiCall('help.getNearestDc', {}, opts);
        var { nearest_dc, this_dc } = nearestDc;
        if (storedBaseDc == null) {
          yield _this3.storage.set('dc', nearest_dc);
          if (nearest_dc !== this_dc) yield _this3.mtpGetNetworker(nearest_dc, {
            dcID: nearest_dc,
            createNetworker: true
          });
        }
        debug(`nearest Dc`)(nearestDc);
        _this3.authPromise.resolve();
      } catch (err) {
        _this3.authPromise.reject(err);
      }
    })();
  }
  initConnection() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      if (!isAnyNetworker(_this4)) {
        if (!_this4.authBegin) _this4.doAuth();
        yield _this4.authPromise.promise;
      }
    })();
  }
  mtpInvokeApi(method, params, options = {}) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      var deferred = (0, _defer2.default)();
      var rejectPromise = function (error) {
        var err = void 0;
        if (error instanceof Error) err = error;else {
          err = new Error();
          err.data = error;
        }
        // if (!error)
        //   err = { type: 'ERROR_EMPTY', input: '' }
        // else if (!is(Object, error))
        //   err = { message: error }
        // else err = error
        deferred.reject(err);

        if (!options.noErrorBox) {
          //TODO weird code. `error` changed after `.reject`?

          /*err.input = method
           err.stack =
            stack ||
            hasPath(['originalError', 'stack'], error) ||
            error.stack ||
            (new Error()).stack*/
          _this5.emit('error.invoke', error);
        }
      };

      function _ref3(waitTime) {
        return (0, _smartTimeout.delayedCall)(_req.performRequest, +waitTime * 1e3);
      }

      function _ref4() {
        return networker;
      }

      function _ref5(networker) {
        _req.config.networker = networker;
        return _req.performRequest();
      }

      function _ref6(error) {
        var deferResolve = deferred.resolve;
        var apiSavedNet = _ref4;
        var apiRecall = _ref5;
        console.error((0, _timeManager.dTime)(), 'Error', error.code, error.type, baseDcID, _dcID);

        return (0, _errorCases.switchErrors)(error, options, _dcID, baseDcID)(error, options, _dcID, _this5.emit, rejectPromise, requestThunk, apiSavedNet, apiRecall, deferResolve, _this5.mtpInvokeApi, _this5.storage);
      }

      try {
        yield _this5.initConnection();

        var requestThunk = _ref3;

        var _dcID = options.dcID ? options.dcID : yield _this5.storage.get('dc');

        var networker = yield _this5.mtpGetNetworker(_dcID, options);

        var cfg = {
          networker,
          dc: _dcID,
          storage: _this5.storage,
          getNetworker: _this5.mtpGetNetworker,
          netOpts: options
        };
        var _req = new _request2.default(cfg, method, params);

        _req.performRequest().then(deferred.resolve, _ref6).catch(rejectPromise);
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    })();
  }

}

exports.ApiManager = ApiManager;
var isAnyNetworker = ctx => Object.keys(ctx.cache.downloader).length > 0;

var netError = error => {
  console.log('Get networker error', error, error.stack);
  return _bluebird2.default.reject(error);
};
//# sourceMappingURL=index.js.map