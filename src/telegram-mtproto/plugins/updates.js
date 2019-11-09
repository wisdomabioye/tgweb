'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _log = require('../util/log');

var _log2 = _interopRequireDefault(_log);

var _networker = require('../service/networker');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// eslint-disable-next-line


var debug = _log2.default`updates`;

// const AppPeersManager = null
// const AppUsersManager = null
var AppChatsManager = null;

function _ref3(a, b) {
  return a.pts - b.pts;
}

var UpdatesManager = (api, { apiLayer, on }) => {
  var getUserID = (() => {
    var _ref = _asyncToGenerator(_ref2);

    return function getUserID() {
      return _ref.apply(this, arguments);
    };
  })();

  var getDifference = (() => {
    var _ref6 = _asyncToGenerator(_ref9);

    return function getDifference() {
      return _ref6.apply(this, arguments);
    };
  })();

  var getChannelDifference = (() => {
    var _ref10 = _asyncToGenerator(_ref11);

    return function getChannelDifference(_x) {
      return _ref10.apply(this, arguments);
    };
  })();

  var attach = (() => {
    var _ref14 = _asyncToGenerator(_ref17);

    return function attach() {
      return _ref14.apply(this, arguments);
    };
  })();

  var updatesState = {
    pendingPtsUpdates: [],
    pendingSeqUpdates: {},
    syncPending: null,
    syncLoading: true,
    pts: 0,
    seq: 0,
    date: 0
  };
  var channelStates = {};

  var myID = 0;
  getUserID().then(id => myID = id);

  function setState(state) {
    Object.assign(updatesState, state);
  }

  function* _ref2() {
    var auth = yield api.storage.get('user_auth');
    return auth.id || 0;
  }

  function popPendingSeqUpdate() {
    var nextSeq = updatesState.seq + 1;
    var pendingUpdatesData = updatesState.pendingSeqUpdates[nextSeq];
    if (!pendingUpdatesData) {
      return false;
    }
    var updates = pendingUpdatesData.updates;
    updates.forEach(saveUpdate);
    updatesState.seq = pendingUpdatesData.seq;
    if (pendingUpdatesData.date && updatesState.date < pendingUpdatesData.date) {
      updatesState.date = pendingUpdatesData.date;
    }
    delete updatesState.pendingSeqUpdates[nextSeq];

    if (!popPendingSeqUpdate() && updatesState.syncPending && updatesState.syncPending.seqAwaiting && updatesState.seq >= updatesState.syncPending.seqAwaiting) {
      if (!updatesState.syncPending.ptsAwaiting) {
        clearTimeout(updatesState.syncPending.timeout);
        updatesState.syncPending = null;
      } else {
        delete updatesState.syncPending.seqAwaiting;
      }
    }

    return true;
  }

  function popPendingPtsUpdate(channelID) {
    var curState = channelID ? getChannelState(channelID) : updatesState;
    if (!curState.pendingPtsUpdates.length) {
      return false;
    }
    curState.pendingPtsUpdates.sort(_ref3);

    var curPts = curState.pts;
    var goodPts = false;
    var goodIndex = 0;
    var update = void 0;
    var i = 0;
    for (var _iterator = curState.pendingPtsUpdates, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref4 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref4 = _i.value;
      }

      var _update = _ref4;

      curPts += _update.pts_count;
      if (curPts >= _update.pts) {
        goodPts = _update.pts;
        goodIndex = i;
      }
      i++;
    }

    if (!goodPts) {
      return false;
    }

    debug('pop pending pts updates')(goodPts, curState.pendingPtsUpdates.slice(0, goodIndex + 1));

    curState.pts = goodPts;
    for (var _i2 = 0; _i2 <= goodIndex; _i2++) {
      update = curState.pendingPtsUpdates[_i2];
      saveUpdate(update);
    }
    curState.pendingPtsUpdates.splice(0, goodIndex + 1);

    if (!curState.pendingPtsUpdates.length && curState.syncPending) {
      if (!curState.syncPending.seqAwaiting) {
        clearTimeout(curState.syncPending.timeout);
        curState.syncPending = null;
      } else {
        delete curState.syncPending.ptsAwaiting;
      }
    }

    return true;
  }

  function forceGetDifference() {
    if (!updatesState.syncLoading) {
      getDifference();
    }
  }

  function processUpdateMessage(updateMessage) {
    // return forceGetDifference()
    var processOpts = {
      date: updateMessage.date,
      seq: updateMessage.seq,
      seqStart: updateMessage.seq_start
    };

    function _ref5(update) {
      return processUpdate(update, processOpts);
    }

    switch (updateMessage._) {
      case 'updatesTooLong':
      case 'new_session_created':
        forceGetDifference();
        break;

      case 'updateShort':
        processUpdate(updateMessage.update, processOpts);
        break;

      case 'updateShortMessage':
      case 'updateShortChatMessage':
        {
          var isOut = updateMessage.flags & 2;
          var fromID = updateMessage.from_id || (isOut ? myID : updateMessage.user_id);
          /* eslint-disable */
          var toID = updateMessage.chat_id ? -updateMessage.chat_id : isOut ? updateMessage.user_id : myID;
          /* eslint-enable */

          api.emit('updateShortMessage', {
            processUpdate,
            processOpts,
            updateMessage,
            fromID,
            toID
          });
        }
        break;

      case 'updatesCombined':
      case 'updates':
        api.emit('apiUpdate', updateMessage);
        updateMessage.updates.forEach(_ref5);
        break;

      default:
        debug('Unknown update message')(updateMessage);
    }
  }

  function _ref7(update) {
    switch (update._) {
      case 'updateChannelTooLong':
      case 'updateNewChannelMessage':
      case 'updateEditChannelMessage':
        processUpdate(update);
        return;
    }
    saveUpdate(update);
  }

  function _ref8(apiMessage) {
    return saveUpdate({
      _: 'updateNewMessage',
      message: apiMessage,
      pts: updatesState.pts,
      pts_count: 0
    });
  }

  function* _ref9() {
    if (!updatesState.syncLoading) {
      updatesState.syncLoading = true;
      updatesState.pendingSeqUpdates = {};
      updatesState.pendingPtsUpdates = [];
    }

    if (updatesState.syncPending) {
      clearTimeout(updatesState.syncPending.timeout);
      updatesState.syncPending = null;
    }

    var differenceResult = yield api('updates.getDifference', {
      pts: updatesState.pts,
      date: updatesState.date,
      qts: -1
    });
    if (differenceResult._ === 'updates.differenceEmpty') {
      debug('apply empty diff')(differenceResult.seq);
      updatesState.date = differenceResult.date;
      updatesState.seq = differenceResult.seq;
      updatesState.syncLoading = false;
      api.emit('stateSynchronized');
      return false;
    }

    api.emit('difference', differenceResult);

    // Should be first because of updateMessageID
    // console.log(dT(), 'applying', differenceResult.other_updates.length, 'other updates')

    // eslint-disable-next-line
    var channelsUpdates = [];
    differenceResult.other_updates.forEach(_ref7);

    // console.log(dT(), 'applying', differenceResult.new_messages.length, 'new messages')
    var updateNewMessage = _ref8;
    differenceResult.new_messages.forEach(updateNewMessage);

    var { seq, pts, date } = differenceResult.intermediate_state || differenceResult.state;
    setState({ seq, pts, date });

    // console.log(dT(), 'apply diff', updatesState.seq, updatesState.pts)

    if (differenceResult._ == 'updates.differenceSlice') {
      getDifference();
    } else {
      // console.log(dT(), 'finished get diff')
      api.emit('stateSynchronized');
      updatesState.syncLoading = false;
    }
  }

  function* _ref11(channelID) {
    var channelState = getChannelState(channelID);
    if (!channelState.syncLoading) {
      channelState.syncLoading = true;
      channelState.pendingPtsUpdates = [];
    }
    if (channelState.syncPending) {
      clearTimeout(channelState.syncPending.timeout);
      channelState.syncPending = null;
    }
    // console.log(dT(), 'Get channel diff', AppChatsManager.getChat(channelID), channelState.pts)
    var differenceResult = yield api('updates.getChannelDifference', {
      channel: AppChatsManager.getChannelInput(channelID),
      pts: channelState.pts,
      limit: 30
    });
    // console.log(dT(), 'channel diff result', differenceResult)
    channelState.pts = differenceResult.pts;

    if (differenceResult._ == 'updates.channelDifferenceEmpty') {
      debug('apply channel empty diff')(differenceResult);
      channelState.syncLoading = false;
      api.emit('stateSynchronized');
      return false;
    }

    if (differenceResult._ == 'updates.channelDifferenceTooLong') {
      debug('channel diff too long')(differenceResult);
      channelState.syncLoading = false;
      delete channelStates[channelID];
      saveUpdate({ _: 'updateChannelReload', channel_id: channelID });
      return false;
    }

    api.emit('difference', differenceResult);

    // Should be first because of updateMessageID
    debug('applying')(differenceResult.other_updates.length, 'channel other updates');
    differenceResult.other_updates.map(saveUpdate);

    debug('applying')(differenceResult.new_messages.length, 'channel new messages');
    var updateNewChannelMessage = function (apiMessage) {
      return saveUpdate({
        _: 'updateNewChannelMessage',
        message: apiMessage,
        pts: channelState.pts,
        pts_count: 0
      });
    };
    differenceResult.new_messages.forEach(updateNewChannelMessage);

    debug('apply channel diff')(channelState.pts);

    if (differenceResult._ == 'updates.channelDifference' && !differenceResult.final) {
      getChannelDifference(channelID);
    } else {
      debug('finished channel get diff')();
      api.emit('stateSynchronized');
      channelState.syncLoading = false;
    }
  }

  function addChannelState(channelID, pts) {
    if (!pts) {
      throw new Error(`Add channel state without pts ${channelID}`);
    }
    if (channelStates[channelID] === undefined) {
      channelStates[channelID] = {
        pts,
        seq: 0,
        date: 0,
        pendingSeqUpdates: {},
        pendingPtsUpdates: [],
        syncPending: null,
        syncLoading: false
      };
      return true;
    }
    return false;
  }

  function getChannelState(channelID, pts) {
    if (channelStates[channelID] === undefined) {
      addChannelState(channelID, pts);
    }
    return channelStates[channelID];
  }

  function _ref13() {
    return getDifference();
  }

  function processUpdate(update, options = {}) {
    var channelID = void 0;
    switch (update._) {
      case 'updateNewChannelMessage':
      case 'updateEditChannelMessage':
        channelID = update.message.to_id.channel_id || update.message.to_id.chat_id;
        break;
      case 'updateDeleteChannelMessages':
        channelID = update.channel_id;
        break;
      case 'updateChannelTooLong':
        channelID = update.channel_id;
        if (channelStates[channelID] === undefined) {
          return false;
        }
        break;
    }

    var curState = channelID ? getChannelState(channelID, update.pts) : updatesState;

    // console.log(dT(), 'process', channelID, curState.pts, update)

    if (curState.syncLoading) {
      return false;
    }

    if (update._ == 'updateChannelTooLong') {
      getChannelDifference(channelID || 0);
      return false;
    }

    var popPts = void 0;
    var popSeq = void 0;

    function _ref12() {
      return channelID ? getChannelDifference(channelID) : getDifference();
    }

    if (update.pts) {
      var newPts = curState.pts + (update.pts_count || 0);
      if (newPts < update.pts) {
        // debug('Pts hole')(curState, update, channelID && AppChatsManager.getChat(channelID))
        var newPending = {
          timeout: setTimeout(_ref12, 5000)
        };
        curState.pendingPtsUpdates.push(update);
        if (!curState.syncPending) curState.syncPending = newPending;
        curState.syncPending.ptsAwaiting = true;
        return false;
      }
      if (update.pts > curState.pts) {
        curState.pts = update.pts;
        popPts = true;
      } else if (update.pts_count) {
        // console.warn(dT(), 'Duplicate update', update)
        return false;
      }
      if (channelID && options.date && updatesState.date < options.date) {
        updatesState.date = options.date;
      }
    } else if (!channelID && options.seq > 0) {
      var _seq = options.seq;
      var seqStart = options.seqStart || _seq;

      if (seqStart != curState.seq + 1) {
        if (seqStart > curState.seq) {
          // debug('Seq hole')(curState, curState.syncPending && curState.syncPending.seqAwaiting)
          var _updates = curState.pendingSeqUpdates;
          var _newPending = {
            timeout: setTimeout(_ref13, 5000)
          };
          var newSeqUpdate = { seq: _seq, date: options.date, updates: [] };

          if (_updates[seqStart] === undefined) _updates[seqStart] = newSeqUpdate;
          _updates[seqStart].updates.push(update);

          if (!curState.syncPending) curState.syncPending = _newPending;
          if (!curState.syncPending.seqAwaiting || curState.syncPending.seqAwaiting < seqStart) {
            curState.syncPending.seqAwaiting = seqStart;
          }
          return false;
        }
      }

      if (curState.seq != _seq) {
        curState.seq = _seq;
        if (options.date && curState.date < options.date) {
          curState.date = options.date;
        }
        popSeq = true;
      }
    }

    saveUpdate(update);

    if (popPts) {
      popPendingPtsUpdate(channelID);
    } else if (popSeq) {
      popPendingSeqUpdate();
    }
  }

  function saveUpdate(update) {
    api.emit('apiUpdate', update);
  }

  function _ref15(result) {
    return console.log('seq', result._, result, [...apiLayer.seqSet]);
  }

  function _ref16() {
    return setState({ syncLoading: false });
  }

  function* _ref17() {
    on('seq', _ref15);
    var { seq, pts, date } = yield api('updates.getState', {});
    (0, _networker.setUpdatesProcessor)(processUpdateMessage);
    setState({ seq, pts, date });
    setTimeout(_ref16, 1000);
  }

  return {
    processUpdateMessage,
    addChannelState,
    attach
  };
};

exports.default = UpdatesManager;
//# sourceMappingURL=updates.js.map