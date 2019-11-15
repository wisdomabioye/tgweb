/*sendAuthCode response

flags: 3
next_type: {_: "auth.codeTypeSms"}
phone_code_hash: "09f102318b25e98b5a"
phone_registered: true
type: {_: "auth.sentCodeTypeApp", length: 5}
_: "auth.sentCode"

*/

/*signUpWithPhone

flags: 0
user:
	access_hash: "9234065558813774203"
	first_name: "Wisdom"
	flags: 1047
	id: 302689
	last_name: "Abioye"
	phone: "2348067610467"
	self: true
	_: "user"
	__proto__: Object
	_: "auth.authorization"
	__proto__: Object*/


// Dialogs
steps in web.t.me;
- updates.getState
- messages.getdialogs

rpc response - updates.state
rpc response - messages.dialogsSlice
api call - messages.receivedMessages
api call - messages.getdialogs
api call - messages.getAllStickers
Rpc response messages.allStickers
Api call messages.getStickerSet
Api call messages.getStickerSet
Api call messages.getStickerSet
Api call messages.getStickerSet
Rpc response messages.dialogsSlice

Rpc response messages.stickerSet
Rpc response messages.stickerSet
Rpc response messages.stickerSet
Api call updates.getChannelDifference
Rpc response updates.channelDifference
applying 1 channel other updates
applying 0 channel new messages
apply channel diff 92823

finished channel get diff
Api call account.updateStatus

[883.541] Api call messages.getHistory
app.js:60 [883.609] Api call messages.getHistory
app.js:60 [884.112] Rpc response messages.messagesSlice
app.js:60 [884.431] Rpc response messages.messagesSlice
app.js:60 [884.439] Api call messages.getHistory
app.js:60 [884.452] Api call account.updateStatus
push_worker.js:85 [SW] on message {type: "notifications_clear"}
app.js:60 [884.453] Api call messages.readHistory
app.js:60 [884.850] Rpc response messages.affectedMessages
app.js:60 [884.853] Rpc response true
app.js:60 [884.898] Rpc response messages.messagesSlice


Api call account.updateStatus
app.js:60 [1200.927] Rpc response true
app.js:60 [1200.971] Api call channels.getFullChannel
app.js:60 [1201.597] Rpc response messages.chatFull

 Api call messages.getHistory
app.js:60 [1263.812] Api call messages.getHistory
app.js:60 [1264.406] Rpc response messages.messagesSlice
app.js:60 [1264.408] Rpc response messages.messagesSlice

[1307.710] Api call messages.setTyping

 Api call messages.saveDraft
app.js:60 [1313.118] Rpc response true
app.js:60 [1317.677] Api call account.updateStatus

[1408.800] Api call messages.sendMessage
app.js:60 [1409.272] Rpc response updateShortSentMessage

Api call messages.receivedMessages


Api call account.updateStatus
app.js:60 [1477.210] Api call channels.readHistory
app.js:60 [1477.294] Api call channels.getMessages
app.js:60 [1477.383] Rpc response messages.channelMessages
app.js:60 [1477.385] Rpc response channels.channelParticipants
app.js:60 [1477.471] Api call messages.getHistory
app.js:60 [1477.698] Rpc response true
app.js:60 [1477.700] Rpc response true
app.js:60 [1477.996] Rpc response messages.channelMessages
app.js:60 [1478.007] Api call channels.readHistory
app.js:60 [1478.041] Api call channels.getParticipants
app.js:60 [1478.212] Rpc response messages.channelMessages
app.js:60 [1478.297] Api call channels.getMessages
app.js:60 [1478.341] Api call upload.getFile
app.js:60 [1478.344] Api call upload.getFile
app.js:60 [1478.349] Api call upload.getFile
app.js:60 [1478.353] Api call upload.getFile
app.js:60 [1478.357] Api call upload.getFile
app.js:60 [1478.363] Api call upload.getFile
app.js:60 [1478.368] Api call upload.getFile
app.js:60 [1478.374] Api call upload.getFile
app.js:60 [1479.004] Rpc response false
app.js:60 [1479.007] Rpc response channels.channelParticipants
app.js:60 [1479.060] Rpc response messages.channelMessages
app.js:60 [1479.156] Rpc response upload.file


var dialogs = {
  "_": "messages.dialogs",
  "dialogs": [
	    {
	      "_": "dialog",
	      "flags": 1,
	      "peer": {
	        "_": "peerChannel",
	        "channel_id": 1105105608
	      },
	      "top_message": 2541525,
	      "read_inbox_max_id": 2541455,
	      "read_outbox_max_id": 2541525,
	      "unread_count": 30,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 2147483647,
	        "sound": "default"
	      },
	      "pts": 3534016
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 777000
	      },
	      "top_message": 169,
	      "read_inbox_max_id": 17,
	      "read_outbox_max_id": 0,
	      "unread_count": 1,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 1,
	      "peer": {
	        "_": "peerChannel",
	        "channel_id": 1382403007
	      },
	      "top_message": 17688,
	      "read_inbox_max_id": 17688,
	      "read_outbox_max_id": 17695,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 2147483647,
	        "sound": "default"
	      },
	      "pts": 29760
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 869402915
	      },
	      "top_message": 168,
	      "read_inbox_max_id": 168,
	      "read_outbox_max_id": 167,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 819286482
	      },
	      "top_message": 162,
	      "read_inbox_max_id": 162,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 907989241
	      },
	      "top_message": 161,
	      "read_inbox_max_id": 161,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 931070752
	      },
	      "top_message": 160,
	      "read_inbox_max_id": 160,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 801919038
	      },
	      "top_message": 159,
	      "read_inbox_max_id": 159,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 472556624
	      },
	      "top_message": 158,
	      "read_inbox_max_id": 158,
	      "read_outbox_max_id": 2,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 2,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 908897030
	      },
	      "top_message": 157,
	      "read_inbox_max_id": 157,
	      "read_outbox_max_id": 148,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      },
	      "draft": {
	        "_": "draftMessageEmpty"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 973584715
	      },
	      "top_message": 155,
	      "read_inbox_max_id": 155,
	      "read_outbox_max_id": 154,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 916164474
	      },
	      "top_message": 64,
	      "read_inbox_max_id": 64,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 688459960
	      },
	      "top_message": 63,
	      "read_inbox_max_id": 63,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 945534710
	      },
	      "top_message": 42,
	      "read_inbox_max_id": 42,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 909477114
	      },
	      "top_message": 41,
	      "read_inbox_max_id": 41,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 973027925
	      },
	      "top_message": 40,
	      "read_inbox_max_id": 38,
	      "read_outbox_max_id": 40,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 967356921
	      },
	      "top_message": 29,
	      "read_inbox_max_id": 29,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 815931855
	      },
	      "top_message": 28,
	      "read_inbox_max_id": 28,
	      "read_outbox_max_id": 27,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 910659145
	      },
	      "top_message": 26,
	      "read_inbox_max_id": 26,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 960483397
	      },
	      "top_message": 25,
	      "read_inbox_max_id": 25,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 851665143
	      },
	      "top_message": 24,
	      "read_inbox_max_id": 24,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 869940509
	      },
	      "top_message": 23,
	      "read_inbox_max_id": 23,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 754943357
	      },
	      "top_message": 22,
	      "read_inbox_max_id": 22,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 699746192
	      },
	      "top_message": 21,
	      "read_inbox_max_id": 21,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 392248779
	      },
	      "top_message": 20,
	      "read_inbox_max_id": 0,
	      "read_outbox_max_id": 20,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 361536527
	      },
	      "top_message": 19,
	      "read_inbox_max_id": 0,
	      "read_outbox_max_id": 19,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 553674224
	      },
	      "top_message": 18,
	      "read_inbox_max_id": 0,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 889987225
	      },
	      "top_message": 16,
	      "read_inbox_max_id": 16,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 870564501
	      },
	      "top_message": 15,
	      "read_inbox_max_id": 15,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 771668805
	      },
	      "top_message": 14,
	      "read_inbox_max_id": 14,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 617631344
	      },
	      "top_message": 13,
	      "read_inbox_max_id": 13,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 826309261
	      },
	      "top_message": 12,
	      "read_inbox_max_id": 12,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 771044682
	      },
	      "top_message": 11,
	      "read_inbox_max_id": 10,
	      "read_outbox_max_id": 11,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 844690441
	      },
	      "top_message": 9,
	      "read_inbox_max_id": 9,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 763472449
	      },
	      "top_message": 8,
	      "read_inbox_max_id": 8,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 761144619
	      },
	      "top_message": 7,
	      "read_inbox_max_id": 7,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 742802618
	      },
	      "top_message": 6,
	      "read_inbox_max_id": 6,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 888274171
	      },
	      "top_message": 4,
	      "read_inbox_max_id": 4,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 0,
	      "peer": {
	        "_": "peerUser",
	        "user_id": 744265315
	      },
	      "top_message": 3,
	      "read_inbox_max_id": 3,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      }
	    },
	    {
	      "_": "dialog",
	      "flags": 1,
	      "peer": {
	        "_": "peerChannel",
	        "channel_id": 1155450116
	      },
	      "top_message": 1,
	      "read_inbox_max_id": 1,
	      "read_outbox_max_id": 0,
	      "unread_count": 0,
	      "notify_settings": {
	        "_": "peerNotifySettings",
	        "flags": 1,
	        "show_previews": true,
	        "mute_until": 0,
	        "sound": "default"
	      },
	      "pts": 14
	    }
  ],
  "messages": [
	    {
	      "_": "message",
	      "flags": 264,
	      "id": 2541525,
	      "from_id": 869402168,
	      "to_id": {
	        "_": "peerChannel",
	        "channel_id": 1105105608
	      },
	      "reply_to_msg_id": 2541426,
	      "date": 1573461142,
	      "message": "👍👍"
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 169,
	      "from_id": 777000,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1573461121,
	      "message": "Login code: 23639. Do not give this code to anyone, even if they say they are from Telegram!\n\nThis code can be used to log in to your Telegram account. We never ask it for anything else.\n\nIf you didn't request this code by trying to log in on another device, simply ignore this message.",
	      "entities": [
	        {
	          "_": "messageEntityBold",
	          "offset": 0,
	          "length": 11
	        },
	        {
	          "_": "messageEntityBold",
	          "offset": 22,
	          "length": 3
	        }
	      ]
	    },
	    {
	      "_": "message",
	      "flags": 256,
	      "id": 17688,
	      "from_id": 1059166182,
	      "to_id": {
	        "_": "peerChannel",
	        "channel_id": 1382403007
	      },
	      "date": 1573344397,
	      "message": "I’m a cryptocurrency Influencer with over 88k YouTube subscribers,I promote all cryptocurrency related project through my YouTube channel...I will love to make video at every stage of your project to promote it,kindly PM me if you are interested in my service"
	    },
	    {
	      "_": "message",
	      "flags": 256,
	      "id": 168,
	      "from_id": 869402915,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1572777509,
	      "message": "Telegram account has been connected successfully on Airdropai"
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 162,
	      "from_id": 819286482,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1571451123,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 161,
	      "from_id": 907989241,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1571267115,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 160,
	      "from_id": 931070752,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1570568151,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 159,
	      "from_id": 801919038,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1570168103,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 772,
	      "id": 158,
	      "from_id": 472556624,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "fwd_from": {
	        "_": "messageFwdHeader",
	        "flags": 1,
	        "from_id": 289143360,
	        "date": 1569917291
	      },
	      "date": 1569920717,
	      "message": "",
	      "media": {
	        "_": "messageMediaUnsupported"
	      }
	    },
	    {
	      "_": "message",
	      "flags": 320,
	      "id": 157,
	      "from_id": 908897030,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1569496052,
	      "message": "Thank you for joining SaBi Exchange Giveaway.\nThe event has ended. You can now resolve issues with the administrators in the group chat. We will verify and validate each entry then proceed to distribution.",
	      "reply_markup": {
	        "_": "replyKeyboardMarkup",
	        "flags": 3,
	        "resize": true,
	        "single_use": true,
	        "rows": [
	          {
	            "_": "keyboardButtonRow",
	            "buttons": [
	              {
	                "_": "keyboardButton",
	                "text": "👤Info"
	              },
	              {
	                "_": "keyboardButton",
	                "text": "👥Referral"
	              }
	            ]
	          },
	          {
	            "_": "keyboardButtonRow",
	            "buttons": [
	              {
	                "_": "keyboardButton",
	                "text": "💡About SaBi"
	              },
	              {
	                "_": "keyboardButton",
	                "text": "⁉️Help"
	              }
	            ]
	          }
	        ]
	      }
	    },
	    {
	      "_": "message",
	      "flags": 256,
	      "id": 155,
	      "from_id": 973584715,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1569364024,
	      "message": "Yes sir😊"
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 64,
	      "from_id": 916164474,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1567811324,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 63,
	      "from_id": 688459960,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1567503608,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 42,
	      "from_id": 945534710,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1565983196,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 41,
	      "from_id": 909477114,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1565893110,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 258,
	      "out": true,
	      "id": 40,
	      "from_id": 871968332,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 973027925
	      },
	      "date": 1565245656,
	      "message": "Thanks so much sir,"
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 29,
	      "from_id": 967356921,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1565032560,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 28,
	      "from_id": 815931855,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1564252016,
	      "message": "Welcome to our community, please first prove me that you are a human by solving this simple math task: 40 - 37 =",
	      "entities": [
	        {
	          "_": "messageEntityBold",
	          "offset": 103,
	          "length": 9
	        }
	      ]
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 26,
	      "from_id": 910659145,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1563777334,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 25,
	      "from_id": 960483397,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1563538762,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 8576,
	      "silent": true,
	      "id": 24,
	      "from_id": 851665143,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1562573900,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 23,
	      "from_id": 869940509,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1562556392,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 22,
	      "from_id": 754943357,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1561547802,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 21,
	      "from_id": 699746192,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1561225379,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 386,
	      "out": true,
	      "id": 20,
	      "from_id": 871968332,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 392248779
	      },
	      "date": 1560418085,
	      "message": "Good day,\n\nYou can now use our web based application to distribute tokens to over 30k wallet addresses without having to pay a dime. This application will help you reduce gas spent to the minimum and save a whole lot of time.\n\nYou can also leverage on this application to save cost, time and the need to employ the service of a coder because it is 100% do-it-yourself based.\n\nFor access, check https://exsender.com\n\nThank you",
	      "entities": [
	        {
	          "_": "messageEntityUrl",
	          "offset": 394,
	          "length": 20
	        }
	      ]
	    },
	    {
	      "_": "message",
	      "flags": 386,
	      "out": true,
	      "id": 19,
	      "from_id": 871968332,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 361536527
	      },
	      "date": 1560418009,
	      "message": "Good day,\n\nYou can now use our web based application to distribute tokens to over 30k wallet addresses without having to pay a dime. This application will help you reduce gas spent to the minimum and save a whole lot of time.\n\nYou can also leverage on this application to save cost, time and the need to employ the service of a coder because it is 100% do-it-yourself based.\n\nFor access, check https://exsender.com\n\nThank you",
	      "entities": [
	        {
	          "_": "messageEntityUrl",
	          "offset": 394,
	          "length": 20
	        }
	      ]
	    },
	    {
	      "_": "message",
	      "flags": 386,
	      "out": true,
	      "id": 18,
	      "from_id": 871968332,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 553674224
	      },
	      "date": 1560417998,
	      "message": "Good day,\n\nYou can now use our web based application to distribute tokens to over 30k wallet addresses without having to pay a dime. This application will help you reduce gas spent to the minimum and save a whole lot of time.\n\nYou can also leverage on this application to save cost, time and the need to employ the service of a coder because it is 100% do-it-yourself based.\n\nFor access, check https://exsender.com\n\nThank you",
	      "entities": [
	        {
	          "_": "messageEntityUrl",
	          "offset": 394,
	          "length": 20
	        }
	      ]
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 16,
	      "from_id": 889987225,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1560365407,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 15,
	      "from_id": 870564501,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1559767041,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 14,
	      "from_id": 771668805,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1557828089,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 13,
	      "from_id": 617631344,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1557248519,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 12,
	      "from_id": 826309261,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1556363869,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 258,
	      "out": true,
	      "id": 11,
	      "from_id": 871968332,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 771044682
	      },
	      "date": 1556179017,
	      "message": "Welcome on board"
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 9,
	      "from_id": 844690441,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1555801374,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 8576,
	      "silent": true,
	      "id": 8,
	      "from_id": 763472449,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1554821316,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 7,
	      "from_id": 761144619,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1554821185,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 6,
	      "from_id": 742802618,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1554753981,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 4,
	      "from_id": 888274171,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1554662231,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "message",
	      "flags": 384,
	      "id": 3,
	      "from_id": 744265315,
	      "to_id": {
	        "_": "peerUser",
	        "user_id": 871968332
	      },
	      "date": 1554594276,
	      "message": "joined Telegram",
	      "entities": []
	    },
	    {
	      "_": "messageService",
	      "flags": 16384,
	      "post": true,
	      "id": 1,
	      "to_id": {
	        "_": "peerChannel",
	        "channel_id": 1155450116
	      },
	      "date": 1534318093,
	      "action": {
	        "_": "messageActionChannelCreate",
	        "title": "Bitlion"
	      }
	    }
  ],
  "chats": [
	    {
	      "_": "channel",
	      "flags": 8448,
	      "megagroup": true,
	      "id": 1105105608,
	      "access_hash": "17057064959805480506",
	      "title": "همسـالقواﻓ̲يے",
	      "photo": {
	        "_": "chatPhoto",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447908215",
	          "local_id": 24081,
	          "secret": "7609709576197252167"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447908215",
	          "local_id": 24083,
	          "secret": "16523120287716001939"
	        }
	      },
	      "date": 1570236700,
	      "version": 0
	    },
	    {
	      "_": "chatForbidden",
	      "id": 163071749,
	      "title": "ﮬ̲̌ﮧﻣ̲ﺳ̲ ﺂ̲ﻟ̲قۆﺂ̲ﻓ̲يے"
	    },
	    {
	      "_": "channel",
	      "flags": 9536,
	      "megagroup": true,
	      "democracy": true,
	      "id": 1382403007,
	      "access_hash": "5500601691859905929",
	      "title": "Exclusive Platform Chat",
	      "username": "xpl_chat",
	      "photo": {
	        "_": "chatPhoto",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "446629884",
	          "local_id": 400448,
	          "secret": "8072829796988894395"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "446629884",
	          "local_id": 400450,
	          "secret": "16373020659798611671"
	        }
	      },
	      "date": 1567440886,
	      "version": 0
	    },
	    {
	      "_": "chatForbidden",
	      "id": 348796829,
	      "title": "Exclusive Platform Chat"
	    },
	    {
	      "_": "channel",
	      "flags": 8288,
	      "broadcast": true,
	      "id": 1155450116,
	      "access_hash": "4234588577387396383",
	      "title": "ESportsBlock",
	      "username": "esportsblock",
	      "photo": {
	        "_": "chatPhoto",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "463510854",
	          "local_id": 171403,
	          "secret": "2842594950253526678"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "463510854",
	          "local_id": 171405,
	          "secret": "786017485830810208"
	        }
	      },
	      "date": 1570470401,
	      "version": 0
	    }
  ],
  "users": [
	    {
	      "_": "user",
	      "flags": 131187,
	      "verified": true,
	      "id": 777000,
	      "access_hash": "8546303590961225573",
	      "first_name": "Telegram",
	      "phone": "42777",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3337190045231023",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 1,
	          "volume_id": "107738948",
	          "local_id": 13226,
	          "secret": "7783484911272969335"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 1,
	          "volume_id": "107738948",
	          "local_id": 13228,
	          "secret": "233435793543147525"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1565655224
	      }
	    },
	    {
	      "_": "user",
	      "flags": 81963,
	      "bot": true,
	      "bot_nochats": true,
	      "id": 869402915,
	      "access_hash": "16157549706188547963",
	      "first_name": "Airdrop AI",
	      "username": "AirdropAI_bot",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3734057087428306859",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "463508456",
	          "local_id": 206007,
	          "secret": "16738645568139534832"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "463508456",
	          "local_id": 206009,
	          "secret": "682646436825354692"
	        }
	      },
	      "bot_info_version": 7
	    },
	    {
	      "_": "user",
	      "flags": 2171,
	      "contact": true,
	      "id": 819286482,
	      "access_hash": "9981801089747712939",
	      "first_name": "Uche Geo",
	      "username": "Uchmoney",
	      "phone": "2348145936756",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3518808646701131689",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "448304082",
	          "local_id": 155800,
	          "secret": "8177937050470441436"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "448304082",
	          "local_id": 155802,
	          "secret": "17773548233225263603"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573214479
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2163,
	      "contact": true,
	      "id": 907989241,
	      "access_hash": "7294376072668931006",
	      "first_name": "Lucky Gel",
	      "phone": "2348092103975",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3899784095671101353",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447823469",
	          "local_id": 411218,
	          "secret": "14817356272795913067"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447823469",
	          "local_id": 411220,
	          "secret": "996998952528177466"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573217097
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2139,
	      "contact": true,
	      "id": 931070752,
	      "access_hash": "7808219959281603640",
	      "first_name": "HabydynEngr",
	      "username": "Abenugan4real",
	      "phone": "2348067023887",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573332855
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 801919038,
	      "access_hash": "16995697379274386572",
	      "first_name": "EduAjibola",
	      "phone": "2347039221528",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1570975716
	      }
	    },
	    {
	      "_": "user",
	      "flags": 111,
	      "id": 472556624,
	      "access_hash": "15956908750492517766",
	      "first_name": "Wisdom",
	      "last_name": "A (Will not ask for Coin or Token)",
	      "username": "Wisdomabioye",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "2029615246044407729",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447807697",
	          "local_id": 19835,
	          "secret": "8528828082980757167"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447807697",
	          "local_id": 19837,
	          "secret": "4870217861041795365"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573460167
	      }
	    },
	    {
	      "_": "user",
	      "flags": 16427,
	      "bot": true,
	      "id": 908897030,
	      "access_hash": "14167628531936301977",
	      "first_name": "SaBi Exchange Bot",
	      "username": "SaBiExchange_bot",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3903683019737769897",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447817334",
	          "local_id": 347976,
	          "secret": "5419284668795923387"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447817334",
	          "local_id": 347978,
	          "secret": "13015667173271362794"
	        }
	      },
	      "bot_info_version": 3
	    },
	    {
	      "_": "user",
	      "flags": 2171,
	      "contact": true,
	      "id": 973584715,
	      "access_hash": "7502733857729334232",
	      "first_name": "RostavilyGle",
	      "username": "AbooRumaysa",
	      "phone": "2348163961240",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "4181514511266719657",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464131160",
	          "local_id": 141534,
	          "secret": "12069751645330274924"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464131160",
	          "local_id": 141536,
	          "secret": "561712868333945517"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1569365211
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2163,
	      "contact": true,
	      "id": 916164474,
	      "access_hash": "2728554641210266678",
	      "first_name": "President Segun",
	      "phone": "2347069128177",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3934896454043281321",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447908257",
	          "local_id": 76802,
	          "secret": "16475017159085007625"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447908257",
	          "local_id": 76804,
	          "secret": "142331324733251377"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573210881
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2163,
	      "contact": true,
	      "id": 688459960,
	      "access_hash": "1059277101526408913",
	      "first_name": "SciAlfa MajydComp",
	      "phone": "2348137386217",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "2956913013261707177",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464133726",
	          "local_id": 156876,
	          "secret": "5503527561268452697"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464133726",
	          "local_id": 156878,
	          "secret": "4080514945360133088"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573419466
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2171,
	      "contact": true,
	      "id": 945534710,
	      "access_hash": "8608458339167943237",
	      "first_name": "Ramat",
	      "username": "Bukairo",
	      "phone": "2347032425782",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "4061040657139083179",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447815483",
	          "local_id": 326135,
	          "secret": "6742681322203361202"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447815483",
	          "local_id": 326137,
	          "secret": "12140317165561505719"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573330804
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 909477114,
	      "access_hash": "17890183332952418195",
	      "first_name": "Bussy Cekblok",
	      "phone": "2348169008679",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573460674
	      }
	    },
	    {
	      "_": "user",
	      "flags": 6267,
	      "contact": true,
	      "mutual_contact": true,
	      "id": 973027925,
	      "access_hash": "4679796276187379404",
	      "first_name": "IbGle",
	      "username": "Adetunji147",
	      "phone": "2347052688338",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "4179123116425979817",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464021163",
	          "local_id": 58625,
	          "secret": "14397179310625287557"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464021163",
	          "local_id": 58627,
	          "secret": "18156178712216170442"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1570895653
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 967356921,
	      "access_hash": "2355342738867828824",
	      "first_name": "AdexReuben",
	      "phone": "2348057658472",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1572798078
	      }
	    },
	    {
	      "_": "user",
	      "flags": 16427,
	      "bot": true,
	      "id": 815931855,
	      "access_hash": "7600037774137385848",
	      "first_name": "Netbox. Global Airdrop Bot",
	      "username": "NetboxGlobalAirdropBot",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3504400633445853097",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 2,
	          "volume_id": "263837516",
	          "local_id": 3510,
	          "secret": "8020603410011149252"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 2,
	          "volume_id": "263837516",
	          "local_id": 3512,
	          "secret": "809215190169692839"
	        }
	      },
	      "bot_info_version": 4
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 910659145,
	      "access_hash": "4249780181914083073",
	      "first_name": "Igi-AnuSam",
	      "phone": "2348032230434",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1570559916
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2163,
	      "contact": true,
	      "id": 960483397,
	      "access_hash": "8820689185688763313",
	      "first_name": "Password",
	      "phone": "2348154544647",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "4125244778922223529",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464021078",
	          "local_id": 16565,
	          "secret": "17902324491249254172"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "464021078",
	          "local_id": 16567,
	          "secret": "5540833898540422753"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573369286
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 851665143,
	      "access_hash": "10017936789462931283",
	      "first_name": "Timothy Gel",
	      "phone": "2348034064437",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1566475283
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2139,
	      "contact": true,
	      "id": 869940509,
	      "access_hash": "17652444195299031669",
	      "first_name": "Gle Solo",
	      "username": "WorldSolex",
	      "phone": "2348039092351",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1572347038
	      }
	    },
	    {
	      "_": "user",
	      "flags": 6227,
	      "contact": true,
	      "mutual_contact": true,
	      "id": 754943357,
	      "access_hash": "4049161242277815051",
	      "first_name": "RoyZainab",
	      "phone": "2348140505865",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1568894458
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2163,
	      "contact": true,
	      "id": 699746192,
	      "access_hash": "4224014289772832203",
	      "first_name": "Mubahrahq",
	      "phone": "2348034427461",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3005387010596775849",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447817971",
	          "local_id": 163499,
	          "secret": "17746429455232383514"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447817971",
	          "local_id": 163501,
	          "secret": "8937879149082328122"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1566082934
	      }
	    },
	    {
	      "_": "user",
	      "flags": 111,
	      "id": 392248779,
	      "access_hash": "1952222170831357597",
	      "first_name": "tom",
	      "last_name": "crypto",
	      "username": "tomcrypt12",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "1684695678157170601",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 5,
	          "volume_id": "853235222",
	          "local_id": 266655,
	          "secret": "434541131427753722"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 5,
	          "volume_id": "853235222",
	          "local_id": 266657,
	          "secret": "2013248675402748356"
	        }
	      },
	      "status": {
	        "_": "userStatusRecently"
	      }
	    },
	    {
	      "_": "user",
	      "flags": 107,
	      "id": 361536527,
	      "access_hash": "8679955148040933805",
	      "first_name": "Rafael",
	      "username": "rafaelferreiracrypto",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "1552787560230660011",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 1,
	          "volume_id": "806119690",
	          "local_id": 320429,
	          "secret": "7903614938393761537"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 1,
	          "volume_id": "806119690",
	          "local_id": 320431,
	          "secret": "7442920831368571624"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573448051
	      }
	    },
	    {
	      "_": "user",
	      "flags": 107,
	      "id": 553674224,
	      "access_hash": "2773294601520665940",
	      "first_name": "Sagar",
	      "username": "sagarbansal21",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "2378012685174417321",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 5,
	          "volume_id": "852840127",
	          "local_id": 199808,
	          "secret": "8642396719939282520"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 5,
	          "volume_id": "852840127",
	          "local_id": 199810,
	          "secret": "8667383960336707590"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573447506
	      }
	    },
	    {
	      "_": "user",
	      "flags": 6227,
	      "contact": true,
	      "mutual_contact": true,
	      "id": 889987225,
	      "access_hash": "2210317690447795064",
	      "first_name": "KemySis",
	      "phone": "2348030595594",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1564337894
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2139,
	      "contact": true,
	      "id": 870564501,
	      "access_hash": "5876513128704035809",
	      "first_name": "Mr. Omanayin",
	      "username": "geoyao1",
	      "phone": "2348038388110",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1569932565
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 771668805,
	      "access_hash": "12540757766049369412",
	      "first_name": "Onilede Bayo",
	      "phone": "2348167380599",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1568453799
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 617631344,
	      "access_hash": "6325871646039620783",
	      "first_name": "X-man",
	      "phone": "2348165428177",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1571823346
	      }
	    },
	    {
	      "_": "user",
	      "flags": 8193,
	      "deleted": true,
	      "id": 826309261,
	      "access_hash": "12932557351005285983"
	    },
	    {
	      "_": "user",
	      "flags": 2139,
	      "contact": true,
	      "id": 771044682,
	      "access_hash": "17955210245849227725",
	      "first_name": "AbdulmajydGle",
	      "username": "MajikWardrobe",
	      "phone": "2347036008407",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1572963458
	      }
	    },
	    {
	      "_": "user",
	      "flags": 8193,
	      "deleted": true,
	      "id": 844690441,
	      "access_hash": "3425729176416048587"
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 763472449,
	      "access_hash": "13434723913477812510",
	      "first_name": "Asiwaju Aboladee",
	      "phone": "2348035020186",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1559417762
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2163,
	      "contact": true,
	      "id": 761144619,
	      "access_hash": "2795054147301674675",
	      "first_name": "Asiwaju Abolade",
	      "phone": "2347057396086",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3269091246587619241",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "449011767",
	          "local_id": 399766,
	          "secret": "11199445566307337308"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "449011767",
	          "local_id": 399768,
	          "secret": "6987229411221684407"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1558274164
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 742802618,
	      "access_hash": "11902596089346962863",
	      "first_name": "Master Turnitin",
	      "phone": "2348062696059",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573357063
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2171,
	      "contact": true,
	      "id": 888274171,
	      "access_hash": "1610363812861219617",
	      "first_name": "Hussein Stand",
	      "username": "Husseininda62",
	      "phone": "2347065718639",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3815108514782750633",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447820421",
	          "local_id": 7379,
	          "secret": "9306563545568678038"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447820421",
	          "local_id": 7381,
	          "secret": "2585587291298024100"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573280876
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2131,
	      "contact": true,
	      "id": 744265315,
	      "access_hash": "15118156785874121494",
	      "first_name": "Johnson Stand",
	      "phone": "2347038834352",
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1568924573
	      }
	    },
	    {
	      "_": "user",
	      "flags": 99,
	      "id": 869402168,
	      "access_hash": "13493113778326893405",
	      "first_name": "ابوسلطان",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "3734053879087736767",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447807556",
	          "local_id": 470483,
	          "secret": "7087267732769840235"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447807556",
	          "local_id": 470485,
	          "secret": "2649695613603670511"
	        }
	      },
	      "status": {
	        "_": "userStatusOnline",
	        "expires": 1573461408
	      }
	    },
	    {
	      "_": "user",
	      "flags": 1115,
	      "self": true,
	      "id": 871968332,
	      "access_hash": "4142366978175477727",
	      "first_name": "Abk",
	      "username": "Abkaby",
	      "phone": "2348111144016",
	      "status": {
	        "_": "userStatusOnline",
	        "expires": 1573461445
	      }
	    },
	    {
	      "_": "user",
	      "flags": 2171,
	      "contact": true,
	      "id": 289143360,
	      "access_hash": "8025364120888405213",
	      "first_name": "Noble",
	      "username": "Westeroff",
	      "phone": "2348136611779",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "1241861275511793598",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "455029803",
	          "local_id": 34445,
	          "secret": "16182315813018307078"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "455029803",
	          "local_id": 34447,
	          "secret": "1233628144257261091"
	        }
	      },
	      "status": {
	        "_": "userStatusRecently"
	      }
	    },
	    {
	      "_": "user",
	      "flags": 111,
	      "id": 1059166182,
	      "access_hash": "47809141131798593",
	      "first_name": "Tone",
	      "last_name": "Vays",
	      "username": "tonevays_official1",
	      "photo": {
	        "_": "userProfilePhoto",
	        "photo_id": "4549084113175422889",
	        "photo_small": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447819465",
	          "local_id": 469951,
	          "secret": "6706496987826214054"
	        },
	        "photo_big": {
	          "_": "fileLocation",
	          "dc_id": 4,
	          "volume_id": "447819465",
	          "local_id": 469953,
	          "secret": "12333202339863779929"
	        }
	      },
	      "status": {
	        "_": "userStatusOffline",
	        "was_online": 1573423506
	      }
	    }
  ]
}

