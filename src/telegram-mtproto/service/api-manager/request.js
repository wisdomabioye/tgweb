'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _error = require('../../error');

var _smartTimeout = require('../../util/smart-timeout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// import Logger from '../../util/log'
// const log = Logger`request`

class Request {
  constructor(config, method, params = {}) {
    var _this = this;

    this.initNetworker = _asyncToGenerator(function* () {
      if (!_this.config.networker) {
        var { getNetworker, netOpts, dc } = _this.config;
        var networker = yield getNetworker(dc, netOpts);
        _this.config.networker = networker;
      }
      return _this.config.networker;
    });

    this.performRequest = () => this.initNetworker().then(this.requestWith);

    this.requestWith = networker => networker.wrapApiCall(this.method, this.params, this.config.netOpts).catch({ code: 303 }, this.error303).catch({ code: 420 }, this.error420);

    this.config = config;
    this.method = method;
    this.params = params;

    this.performRequest = this.performRequest.bind(this);
    //$FlowIssue
    this.error303 = this.error303.bind(this);
    //$FlowIssue
    this.error420 = this.error420.bind(this);
    this.initNetworker = this.initNetworker.bind(this);
  }

  error303(err) {
    var matched = err.type.match(/^(PHONE_MIGRATE_|NETWORK_MIGRATE_|USER_MIGRATE_)(\d+)/);
    if (!matched || matched.length < 2) return _bluebird2.default.reject(err);
    var [,, newDcID] = matched;
    if (+newDcID === this.config.dc) return _bluebird2.default.reject(err);
    this.config.dc = +newDcID;
    delete this.config.networker;
    /*if (this.config.dc)
      this.config.dc = newDcID
    else
      await this.config.storage.set('dc', newDcID)*/
    //TODO There is disabled ability to change default DC
    //NOTE Shouldn't we must reassign current networker/cachedNetworker?
    return this.performRequest();
  }
  error420(err) {
    var matched = err.type.match(/^FLOOD_WAIT_(\d+)/);
    if (!matched || matched.length < 2) return _bluebird2.default.reject(err);
    var [, waitTime] = matched;
    console.error(`Flood error! It means that mtproto server bans you on ${waitTime} seconds`);
    return +waitTime > 60 ? _bluebird2.default.reject(err) : (0, _smartTimeout.delayedCall)(this.performRequest, +waitTime * 1e3);
  }
}

exports.default = Request;
//# sourceMappingURL=request.js.map