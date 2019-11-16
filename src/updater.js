/*
* Worker periodically check for update
* If there's an update, it saves in the DB
* and notify app.js about the update
* app.js fetch the update from DB and update UI
*/
import "@babel/polyfill";

import TelegramClient from "./tgclient";

import {
	getPeerIdKey, getPeerDbName,
	toPeerObject, getPeerUserMessages,
	getPeerChatMessages
		} from "./utils";
		
self.importScripts("assets/scripts/mtproto.min.js");

let client = new TelegramClient(mtproto.MTProto);

self.onmessage = async function(event) {
	switch(event.data) {
		case "start":
			await getAndUpdateState();
			await getAndUpdateDialog();
			stateChangeWatcher();
			self.postMessage("ready");
		break;
		default: 
			console.log(event.data);
		break;
	}
}


async function getAndUpdateState(latestState) {
	/*
	* If latestState is supplied, update in DB
	* Otherwise, get it and update DB
	*/
	if (!latestState) {
		latestState = await client.getState();
	}
	await client.storage.setState(latestState);
	/*
	* update dialog
	*/
	await getAndUpdateDialog();
	self.postMessage("newState");
}

async function getAndUpdateDialog() {
	/*
	* 1. Get dialogs
	* 2. Save dialogs to DB
	*/
	let dialogs = await client.getDialogs();
	await client.storage.newDialog(dialogs);
	// self.postMessage("newDialog");
}

async function stateChangeWatcher() {
	try {
		let currentState = await client.storage.getState();
		if (!currentState) {
			throw new Error("State is empty");
		}
		/*
		* Get difference
		* Compare difference["state"] with currentState
		*/	
		let difference = await getUpdateDifference(currentState);
		let latestState = difference["state"] || difference["intermediate_state"];
		/*
		* if difference is empty 
		* Register next timeout
		*/
		let differenceType = difference["_"] || difference["type"];
		if (differenceType == "updates.differenceEmpty") {
			throw new Error();
		}

		/*
		* compare currentState and latestState
		*/
		let stateIsStale = false;

		if (difference["chats"] && difference["state"]) {
			stateIsStale = true;
		}

		if (stateIsStale) {
			console.log("State is stale, updating...");
			/*
			* call update 
			* updates.getDifference
			* wait for update to be patched 
			* Get the latest update difference using stale state (currentState)
			*/
			await handleUpdateDifference(difference);
		} else {
			console.log("State is fresh! :)")
		}

	} catch (error) {
		// console.log(error.message);
	} finally {
		/*
		* check state periodically;
		*/
		setTimeout(stateChangeWatcher, 2000);
	}
}

async function getUpdateDifference(state) {
	let update = await client.callMethod("updates.getDifference", {
		...state,
		pts_total_limit: 1000,
	})
	return update;
}

async function handleUpdateDifference(difference) {
	// NEEDS REVISION
	/*
	* Extract new_message and update chat/user db accordingly
	*/

	let differenceConstructor = difference["_"] || difference["type"];

	if (differenceConstructor == "updates.difference" || differenceConstructor == "updates.differenceSlice") {
		/*
		* Build the history for Each users
		* Similar to the object below
		* let allHistory = {
			  channel_8393303: {
			    messages: [],
			    chats: [],
			    users: []
			  }
			}
		*/
		let {new_messages: messages, new_encrypted_messages, other_updates, chats, users, state, intermediate_state	} = difference;

		// handleOtherTypeOfUpdate(difference);

		for (let user of users) {
			if (user["self"]) {
				/*
				* Skip if it's currentUser data
				*/
				continue;
			}
			let peerType = user["_"] || user["type"];
			let peer = toPeerObject(user["id"], peerType);
			let peerMessages = getPeerUserMessages(peer, messages);
			let peerDbName = getPeerDbName(user["id"], peerType);
			await updateHistoryDb(peerDbName, {
				chats, users,
				messages: peerMessages
			});
		}
		/*
		* Update state in storage
		*/
		await getAndUpdateState(state || intermediate_state);
		
		/*
		* use "other_updates" to 
		* getChannelDifference if updateChannelTooLong :)
		*/
	} else if (differenceConstructor == "updates.differenceTooLong") {
		let {pts} = difference;
		/*
		* TODO: :)
		*/
	}
}

function handleOtherTypeOfUpdate(difference) {
	let {other_updates, chats, users} = difference;

	for (update of other_updates) {
		let updateType = update["_"] || update["type"];
		
		if (updateType == "updateNewMessage") {

		} else if (updateType == "updateNewChannelMessage") {

		} else if (updateType == "updateChannelTooLong") {

		}
	}  
}

async function updateHistoryDb(dbName, history) {
	/*
	* 1. if exist, Merge. Otherwise, create the new db chat/channel/user
	*/
	let oldHistory = await client.storage.get(dbName);
	let newHistory;

	if (oldHistory) {
		/*
		* Merge
		*/
		let {chats, users, messages, pts} = oldHistory;
		let newChats = history["chats"].concat(oldHistory["chats"]),
			newUsers = history["users"].concat(oldHistory["users"]),
			newMessages = history["messages"].concat(oldHistory["messages"]),
			newPts = history["pts"] ? history["pts"] : "";
			
		newHistory = {
			users: newUsers,
			chats: newChats,
			messages: newMessages,
			pts: newPts
		}
	} else {
		newHistory = history;
	}
	/*
	* sort messages in newHistory by date
	*/
	newHistory["messages"].sort(function(a, b) {
		return a["date"] - b["date"];
	});
	await client.storage.set(dbName, newHistory);
}
