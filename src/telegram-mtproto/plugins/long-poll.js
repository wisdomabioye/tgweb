'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _timeManager = require('../service/time-manager');

var _index = require('../service/networker/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// import Logger from '../util/log'
// const log = Logger`long-poll`

// let inited = false

class LongPoll {

  constructor(thread) {
    this.maxWait = 25e3;
    this.pendingTime = -Infinity;
    this.requestTime = -Infinity;
    this.isActive = true;

    this.thread = thread;
    // if (inited) {
    //   log('Networker')(thread)
    //   //$ FlowIssue
    //   this.request = () => Bluebird.resolve()
    // }
    // inited = true
  }

  setPendingTime() {
    var now = (0, _timeManager.tsNow)();
    this.requestTime = now;
    this.pendingTime = now + this.maxWait;
  }
  request() {
    var _this = this;

    return _asyncToGenerator(function* () {
      var result = yield _this.thread.wrapMtpCall('http_wait', {
        max_delay: 1000,
        wait_after: 500,
        max_wait: _this.maxWait
      }, {
        noResponse: true,
        longPoll: true
      });
      _this.thread.checkLongPoll();
      return result;
    })();
  }

  writePollTime() {
    this.requestTime = (0, _timeManager.tsNow)();
  }

  allowLongPoll() {
    return this.requestTime + 3500 < (0, _timeManager.tsNow)();
  }

  sendLongPool() {
    //TODO add base dc check
    if (!this.isActive) return _bluebird2.default.resolve(false);
    if (!this.allowLongPoll()) return _bluebird2.default.resolve(false);
    this.setPendingTime();
    return this.request();
  }
}

exports.default = LongPoll;
//# sourceMappingURL=long-poll.js.map