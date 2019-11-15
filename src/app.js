import "@babel/polyfill";
import moment from "moment";
import {
	toggleLoadingButton, 
	writeErrorToHTML, 
	toggleElementVisibility, 
	underscoreCasedToSentence, 
	getSubstring,
	camelCasedToSentence, 
	getPeerIcon } from "./utils";

import TelegramClient from './tgClient';
const client = new TelegramClient();


document.addEventListener("DOMContentLoaded", async function() {
	checkAuthenticationAndRegisterHandlers();
})

async function checkAuthenticationAndRegisterHandlers() {
	let imRoute = "/",
		signinRoute = "/signin.html",
		currentRoute = window.location.pathname;

	try {
		
		let signedin = await client.storage.get("signedin");
		if (currentRoute === imRoute && !signedin) {
			/*
			* sigin in first
			*/
			window.location.replace(signinRoute);
		} else if (currentRoute === signinRoute && signedin) {
			/*
			* You're already signed in
			*/
			window.location.replace(imRoute);
		} else {
			/*
			* register appropriate listener
			*/
			if (currentRoute === imRoute) {
				messengerHandlersWrapper();
			} else {
				registerSignInFlowHandlers();
			}
		}

	} catch (error) {
		console.log(error);
	}
}

function messengerHandlersWrapper() {
	handleLogout();
	initializeAppAndRender();
	setOnlineStatus();
}

function registerSignInFlowHandlers() {
	let phoneBtn = document.querySelector(".signin button.button"),
		loginCodeBtn = document.querySelector(".auth-code button.button"),
		signupBtn = document.querySelector(".signup button.button");

	if (phoneBtn) {
		phoneBtn.addEventListener("click", handlePhoneFromInput);
	}

	if (loginCodeBtn) {
		loginCodeBtn.addEventListener("click", handleLoginCodeInput);
	}

	if (signupBtn) {
		signupBtn.addEventListener("click", handleSignUp);
	}
}
/*
* SignIn Controller
*/
async function handlePhoneFromInput() {

	let phoneInput = document.querySelector(".signin input.phone-number");
	
	if (phoneInput) {
		toggleLoadingButton(".signin button.button");
		try {
			let phone = phoneInput.value;

			if (!phone) {
				throw new Error("Invalid phone number");
			}
			/*
			* request login code
			*/
			await client.sendAuthCode(phone);
			/*
			* hide the phone input div
			* display the login-code input div
			*/
			toggleElementVisibility(".signin");
			toggleElementVisibility(".auth-code");
		
		} catch(error) {
			console.log(error.message);

			if (error.message) {
				/*
				* write error to closest 'p' tag
				*/
				writeErrorToHTML(error.message, phoneInput.parentElement.parentElement.querySelector("p.help"));
			}

		} finally {
			toggleLoadingButton(".signin button.button");
		}


	}
}

async function handleSignUp() {
	let firstNameField = document.querySelector(".signup input[name='firstname']"),
		lastNameField = document.querySelector(".signup input[name='lastname']"),
		tosField = document.querySelector(".signup input[name='tos']");
	
	if (!firstNameField || !lastNameField || !tosField) {
		return;
	}

	try {
		toggleLoadingButton(".signup button.button");

		let firstName = firstNameField.value,
			lastName = lastNameField.value,
			tos = tosField.checked;

		if (!firstName || !lastName || !tos) {
			throw new Error("First and last name are required and must accept terms of service.");
		}

		let newUser = await client.signUpWithPhone(firstName, lastName);
		/*
		* Save user in Storage
		*/
		await client.storage.set("signedin", true);
		await client.storage.newUser(newUser["user"]);
		/*
		* Go to messenger
		*/
		window.location.replace("/");
	} catch (error) {
		console.log(error.message);

		if (error.message) {
			let message = underscoreCasedToSentence(error.message);
			/*
			* Check if error.message is PHONE_NUMBER_OCCUPIED (phone registered)
			*/
			if (error.message.includes("PHONE_NUMBER_OCCUPIED")) {
				message = "Phone number is already registered";
			}
			/*
			* write error to closest 'p' tag
			*/
			writeErrorToHTML(message, firstNameField.parentElement.parentElement.querySelector("p.help"));
		}

	} finally {
		toggleLoadingButton(".signup button.button");
	}
}

async function handleLoginCodeInput() {
	let loginCodeInput = document.querySelector(".auth-code input.login-code");
	
	if (loginCodeInput) {
		toggleLoadingButton(".auth-code button.button");

		try {
			let code = loginCodeInput.value;

			if (!code) {
				throw new Error("Invalid login code");
			}
			/*
			* request sign
			*/
			let newLogin = await client.signInWithPhone(code);
			/*
			* Save user in Storage
			*/
			await client.storage.set("signedin", true);
			await client.storage.newUser(newLogin["user"]);
			/*
			* redirect to messenger index "/"
			*/
			window.location.replace("/");
		} catch(error) {
			console.log(error.message);

			if (error.message) {
				let message = underscoreCasedToSentence(error.message);
				/*
				* Check if error.message is PHONE_NUMBER_UNOCCUPIED (phone not registered)
				*/
				if (error.message.includes("PHONE_NUMBER_UNOCCUPIED")) {
					message = "You need to signup first";
					/*
					* hide login-code input
					* show sign up form
					*/
					toggleElementVisibility(".auth-code");
					toggleElementVisibility(".signup");
				}
				/*
				* write error to closest 'p' tag
				*/
				writeErrorToHTML(message, loginCodeInput.parentElement.parentElement.querySelector("p.help"));
			}

		} finally {
			toggleLoadingButton(".auth-code button.button");
		}

	}
}

/*
* Instant messenger functions
*/
function setOnlineStatus() {
	window.addEventListener("focus", async function() {
		/*
		* User is online
		*/
		await client.callMethod("account.updateStatus", {offline: false});
	})

	window.addEventListener("blur", async function() {
		/*
		* User is offline
		*/
		await client.callMethod("account.updateStatus", {offline: true});
	})
}

async function initializeAppAndRender() {
	/*
	* 1. Get dialogs
	* 2. Render dialogs
	* 3. Get State (updates.getState)
	* 4. Save state to DB
	* 5. Register stateChangeWatcher (keep watching state changes)
	*    TODO: stateChangeWatcher should be a webworker
	*/

	getDialogAndRender()
	getAndUpdateState()
	stateChangeWatcher()


	// getChatList();
}

async function stateChangeWatcher() {
	console.log("Watching update");
	try {
		let currentState = await client.storage.getState();
		if (!currentState) {
			throw new Error("State is empty");
		}

		let latestState = await client.getState();
		/*
		* compare currentState and latestState
		*/
		let stateIsStale = false;
		for (let field in latestState) {
			/*
			* do not watch date because date changes every milliseconds
			*/
			if (latestState[field] != currentState[field] && field != "date") {
				stateIsStale = true;				
				//no further check is needed
				break;
			}
		}

		if (stateIsStale) {
			console.log("State is stale, updating...");
			/*
			* call update 
			* updates.getDifference
			* wait for update to be patched 
			* Get the latest update difference using stale state (currentState)
			*/
			let difference = await getUpdateDifference(currentState);
			console.log(difference);
			await handleUpdateDifference(difference);
		}

	} catch (error) {
		console.log(error.message);
	} finally {
		/*
		* check state periodically;
		*/
		setTimeout(stateChangeWatcher, 3000);
	}
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

		handleOtherTypeOfUpdate(other_updates);
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
		* Get currently active/selected chat
		* Refresh dialogs/chat list
		* Dispatch click on selected active if any
		*/
		let selectedChat = document.querySelector("#chat-list .is-active");
		let newSelector = selectedChat ? selectedChat.parentElement.getAttribute("data-id") : "";
		
		await getDialogAndRender();

		if (newSelector) {

			let target = document.querySelector(`#chat-list [data-id='${newSelector}']`);
			target.dispatchEvent(new Event("click"));
		}
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

function handleOtherTypeOfUpdate(updates) {
	for (let update of updates) {

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
	/*
	* Set document title
	*/
	setDocumentTitle(latestState["unread_count"]);
	await client.storage.setState(latestState);
}

async function getUpdateDifference(state) {
	let update = await client.callMethod("updates.getDifference", {
		...state,
		pts_total_limit: 1000, // limit update to 1000 - should be increased with web worker
	})
	return update;
}
 
async function getDialogAndRender() {
	/*
	* 1. Get dialogs
	* 2. Save dialogs to DB
	* 3. Send dialogs chats and users to history handler
	* 4. call getChatList to render dialogs
	*/

	let dialogs = await client.getDialogs();
	await client.storage.newDialog(dialogs);

	/*
	* Send dialogs to getMessageHistory
	* DON'T DO THIS - MTPROTO SERVER FORBID IT (FLOOD)
	*/
	// getManyDialogsHistory(dialogs);

	/*
	* Start rendering
	*/
	getChatList(dialogs);
}

function dialogHandler(dialogsDb) {
	/*
	* dialogsDb contains
	* "dialogs", "messages",
	* "chats", "users"
	*/
	if (!dialogsDb) { 
		return [];
	}

	let {dialogs, messages, chats, users} = dialogsDb;

	let chatList = dialogs.map(function(log, index) {
		let tempLog = {
			// "peer": {...log["peer"]}, //log["peer"] is an object
			"unread_count": log["unread_count"],
			"last_read": log["read_inbox_max_id"],
			"top_message": log["top_message"],
			"unread_mentions_count": log["unread_mentions_count"] || 0,
			"mute_until": log["notify_settings"]["mute_until"],
			last_message: messages[index]["message"], 
		}
		/*
		* get peer info from either "chat" or "user";
		*/
		switch (log["peer"]["_"] || log["peer"]["type"]) {
			case "peerUser":
				tempLog["type"] = "user";
				tempLog["id"] = log["peer"]["user_id"];

				tempLog["peerInfo"] = getPeerUserInfo(log["peer"]["user_id"], users);
				tempLog["icon"] = "user";
				break;
			
			case "peerChannel":
				tempLog["type"] = "channel";
				tempLog["id"] = log["peer"]["channel_id"];
				tempLog["peerInfo"] = getPeerChatInfo(log["peer"]["channel_id"], chats);
				tempLog["icon"] = tempLog["peerInfo"]["megagroup"] ? "group" : "channel";

				break;

			case "peerChat":
				tempLog["type"] = "chat";
				tempLog["id"] = log["peer"]["chat_id"];

				tempLog["peerInfo"] = getPeerChatInfo(log["peer"]["chat_id"], chats);
				tempLog["icon"] = "group";
				break;
		}

		/*
		* Not sure if the order of "dialogs" and "messages"
		* in "messages.dialogs" are guaranteed to be the same.
		* If it is not, I'll use the below to get the last message
		*/
		
		/*let lastMessage = messages.find(function(msg) {
			return msg["id"] == tempLog["top_message"];
		})

		tempLog["last_message"] = lastMessage["message"];*/

		return tempLog;
	})

	return chatList;
}

async function getSingleDialogHistory(peerInfo, options = {}) {
	try {
		let peerHistory = await client.getMessageHistory(peerInfo, options);
		/*
		* Save to db
		*/
		let peerDbName = getPeerDbName(peerInfo["id"], (peerInfo["_"] || peerInfo["type"]));
		
		await updateHistoryDb(peerDbName, peerHistory);
		
		return peerHistory;

	} catch(error) {
		console.log(error.messages);
	}	
}

async function getManyDialogsHistory({messages, users, chats}) {
	// WE ARE NOT DOING THIS!!!!, FLOOD
	const maxPeerHistory = 40; // max dialogs history
	/*
	* proto server ban for 19 seconds for doing this
	*/
	for (let i = 0; i < messages.length; i++) {
		if (i >= maxPeerHistory) {
			/*
			* Do not read more than maxPeerHistory
			*/
			break;
		}
		/*
		* We have to read peer [to_id] directly from messages or dialogs
		* to avoid getting history for channel/user we do not need.
		* We can simply loop through users or chats
		* and do client.getMessageHistory(chat | user)
		* but it'll get user history for mentioned users and
		* groups/channels where messages are forwarded from 
		*/
		let peer = messages[i]["to_id"];
		let peerType = peer["_"] || peer["type"];
		let peerIdField = getPeerIdKey(peerType); //user_id | channel_id | chat_id;

		try {
			let peerInfo;

			if (peerType == "peerChannel" || peerType == "peerChat") {
				peerInfo = getPeerChatInfo(peer[peerIdField], chats);

			} else if (peerType == "peerUser") {
				peerInfo = getPeerUserInfo(peer[peerIdField], users);
			}

			let peerHistory = await client.getMessageHistory(peerInfo);
			/*
			* Save to db
			*/
			let peerDbName = getPeerDbName(peerInfo["id"], (peerInfo["_"] || peerInfo["type"]));

			await client.storage.set(peerDbName, peerHistory);

		} catch(error) {
			console.log(error.messages);
		}		
	}
	console.log(`Done getting ${maxHistory} peer history`);
}
async function getChatList(dialogs) {

	try {
		let dialogsDb;

		if (dialogs) {
			dialogsDb = dialogs;

		} else {
			dialogsDb = await client.storage.getDialog();
		}
		/*
		* build chat list
		*/
		renderChatList(dialogHandler(dialogsDb));
		// return dialogHandler(dialogsDb);

	} catch (error) {
		console.log(error.message);
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

function renderChatList(chats) {
	let chatListWrapper = document.querySelector("#chat-list");
	/*
	* empty chatListWrapper node
	*/
	chatListWrapper.innerHTML = "";

	if (!chats || !chats.length) {
		let empty = "<li class='has-text-centered mt-4'> No chat to show </li>";

		chatListWrapper.innerHTML = empty;
		return;
	}

	for (let chat of chats) {
		let temp = singleChatListItem(chat);
		chatListWrapper.appendChild(temp);
	}
}

function singleChatListItem(chat) {
	let li = document.createElement("li");
		li.classList.add("mt-1", "mb-1", "bb-1");
		li.addEventListener("click", chatSwitchHandler);
		li.setAttribute("data-type", chat["type"]);
		li.setAttribute("data-id", chat["id"]);
		li.setAttribute("data-access_hash", chat["peerInfo"]["access_hash"]);
		li.setAttribute("data-top_message", chat["top_message"]);
		li.setAttribute("data-last_read", chat["last_read"]);

	let lastMessage = getSubstring(chat["last_message"], 40);
	let name = getSubstring(chat["peerInfo"]["name"], 20);
	let unread = buildUnreadNode(chat);

	let content = `<a class='is-block'>
					<div class='column is-12'>
						<div class='is-pulled-left'>
						${name}&nbsp; <img src='/assets/icons/${chat["icon"]}_1x.png' class='is-inline image is-16x16' />
						</div>
						<div class='is-pulled-right tags are-small'> 
							${unread}
						</div>
					</div>
					<div class='column is-12'>
						<small class='is-size-7'>${lastMessage || "<br/>"}</small>
					</div>
				</a>`;

	li.innerHTML = content;
	
	return li;
}

function buildUnreadNode({unread_count, unread_mentions_count, mute_until}) {

	let unreadContainer = "",
		muted = mute_until > 0 ? "is-dark" : "is-danger"; 

	if (!unread_count && !unread_mentions_count) {
		return "";
	}

	if (unread_mentions_count) {
		unreadContainer += `<span class='tag is-danger' title='Unread mentions'> @${unread_mentions_count} </span>`;
	}

	if (unread_count) {
		unreadContainer += `<span class='tag ${muted}' title='Unread'> ${unread_count} </span>`;
	}


	return unreadContainer;
}

function chatSwitchHandler(e) {
	/*
	* remove last is-active class
	*/
	let lastSelectedChat = document.querySelector("#chat-list .is-active");
	
	if (lastSelectedChat) {
		lastSelectedChat.classList.remove("is-active");
	}
	/*
	* add is-active to the currently selected chat
	*/
	let target = e.currentTarget;

	if (target) {
		let id = parseInt(target.getAttribute("data-id")),
			type = target.getAttribute("data-type"),
			access_hash = target.getAttribute("data-access_hash"),
			top_message = parseInt(target.getAttribute("data-top_message")),			
			last_read = parseInt(target.getAttribute("data-last_read"));			

		getConversationInfo({id, type, access_hash, top_message, last_read});
		target.querySelector("a").classList.add("is-active");
	}
}

async function getConversationInfo(attr) {
	let {id, type, access_hash, top_message, last_read} = attr;
	let convoContainer = document.querySelector("#conversation-list");
	/*
	* loading animation
	*/
	convoContainer.innerHTML = loadingIcon();

	let peerDbName = getPeerDbName(id, type);
	let history = await client.storage.get(peerDbName);

	if (!history) {
		/*
		* We need to get this channel history first
		*/
		history = await getSingleDialogHistory({id, type, access_hash});
	}
	let {messages, chats, users, pts} = history;
	
	let peerInfo = {}, peerMessages;
	
	if (type === "user") {
	 	/*extract this user info from the users array
		* the users array contains this current chat user info,
		* to_id and from_id users,
		* all users mentioned in the converstion, and 
		* all users where messages are forwarded from
		*/
		peerMessages = messages;
	 	peerInfo = getPeerUserInfo(id, users);
	 	peerInfo["lastSeen"] = getUserLastSeen(peerInfo["status"]);
	
	} else if (type === "channel" || type === "chat") {
		/*extract this chat/channel info from the chats array
		* the chats array contains this current chat info,
		* all chats mentioned in converstion, and 
		* all chats where messages are forwarded from
		*/
		peerMessages = getMessageSenderInChat(messages, users);
		peerInfo = getPeerChatInfo(id, chats);
	} else {
		throw new Error("Unknown Peer type");
	}

	setConversationHeader(peerInfo);
	renderConversation(peerMessages, peerInfo, last_read);
	/*
	* finally mark History as read
	*/
	await markMessagesAsRead({id, type, access_hash, top_message});
}

function setConversationHeader(peerInfo) {
	let header = document.querySelector("#selected-chat-header");
	if (header) {
		let content = `
			<h2 class='is-size-5'> ${peerInfo["name"]} </h2>
			<span> ${peerInfo["lastSeen"] || ""} </span>
		`;

		header.innerHTML = content;	
	}	
}
function renderConversation(messages, peerInfo, lastReadMsg) {
	let convoContainer = document.querySelector("#conversation-list");
	let {_: type, access_hash, id} = peerInfo;
		/*
		* attach 
		* access_hash, id 
		* and type to convoContainer
		*/
		convoContainer.setAttribute("data-type", type);
		convoContainer.setAttribute("data-access_hash", access_hash);
		convoContainer.setAttribute("data-id", id);

	let row = document.createElement("div");
		row.classList.add("columns", "is-multiline");

	for (let msg of messages) {
		let column = document.createElement("div");
			column.classList.add("column", "is-10");
		let columnContent = buildSingleMessageNode(msg);
		column.innerHTML = columnContent;

		// row.appendChild(column);
		row.insertAdjacentElement("beforeend", column);
	}
	convoContainer.innerHTML = "";
	convoContainer.appendChild(row);
	/*
	* scroll to the last read message
	*/
	scrollToLastMessage(lastReadMsg);
	
}
async function markMessagesAsRead(peerInfo) {
	let mark;
	if (peerInfo["type"] == "user" || peerInfo["type"] == "chat") {
		mark = await client.markUserHistoryAsRead(peerInfo, {max_id: peerInfo["top_message"]});
	} else if (peerInfo["type"] == "channel") {
		mark = await client.markChannelHistoryAsRead(peerInfo, {max_id: peerInfo["top_message"]});
	} 
}
function buildSingleMessageNode(msg) {
	let type = msg["_"] || msg["type"]; //messageService or message
	let content = "";
	if (type === "messageService") {
		content = buildMessageServiceNode(msg);

	} else if (type === "message") {
		if (msg["out"]) {
			/*
			* message sent by currentUser
			*/
			content = buildOutgoingMessage(msg);
		} else {
			content = buildIncomingMessage(msg);
		}
	}
	return content;
}

function buildMessageServiceNode(msg) {
	/*
	* TODO: cover all messageService type;
	*/

	let actionType = camelCasedToSentence((msg["action"]["_"] || msg["action"]["type"]));

	let title = msg["action"]["title"] || "";

	let content = `<div class='has-text-centered has-text-grey is-size-7'>
				<span>
					${title}
				</span><br/>
				<span>${actionType}</span>
			</div>`;
	return content;
}

function buildOutgoingMessage(msg) {
	let date = parseInt(msg["date"]) * 1000,
		time = moment(date).format("hh:mm"),
		fwdFrom = msg["fwd_from"] ? buildForwardedMessage() : "",
		media = msg["media"] ? "<i>media embeded</i>" : "",
		message = msg["message"];

	let label = fwdFrom || media ? `<span class='is-size-7'>${fwdFrom} ${media}</span><br/>` : "";

	let content = `
			<div class='has-text-left has-background-light box pt-2 pb-4 pr-2 pl-2 column is-6 is-pulled-right' data-mgs_id='${msg["id"]}'>
				${label}
				<p class='preserve-format wrap-text fs-12'>${message}</p>
				<span class='is-pulled-right' style='font-size:10px;'>
					${time} <img src="/assets/icons/1check_svg.svg" />
				</span>
			</div>
			`;
	return content;
}

function buildIncomingMessage(msg) {
	let date = parseInt(msg["date"]) * 1000,
		time = moment(date).format("hh:mm"),
		fwdFrom = msg["fwd_from"] ? buildForwardedMessage() : "",
		media = msg["media"] ? "<i>media embeded</i>" : "",
		message = msg["message"],
		sender = buildSenderName(msg["sender"]);

	let label = fwdFrom || media ? `<span class='is-size-7'>${fwdFrom} ${media}</span><br/>` : "";

	let content = `
			<div class='has-text-left has-background-light box pt-2 pb-4 pr-2 pl-2 column is-6' data-mgs_id='${msg["id"]}'>
				${sender}
				${label}
				<p class='preserve-format wrap-text fs-12'>${message}</p>
				<span class='is-pulled-right' style='font-size:10px;'>
					${time}
				</span>
			</div>
			`;
	return content;
}

function buildSenderName(sender) {
	let colors = ["danger", "primary", "info", "link", "warning"];
	if (!sender) {
		return "";
	}
	let random = Math.round(Math.random() * (colors.length - 1));
	let color = colors[random];
	let name = `<span class='is-size-7 strong has-text-${color}'>${sender["name"]}</span><br/>`;

	return name;
}

function buildForwardedMessage() {
	return "<i>Forwarded message</i>";
}

function setDocumentTitle(unreadCount) {
	let title = "Telegram Web";
	if (unreadCount == 0) {
		document.title = title;
	} else {
		let unread = unreadCount > 1 ? "unread messages" : "unread message";
		document.title = `${unreadCount} ${unread}`;
	}
}



function getUserLastSeen(status) {
	let lastSeen = "";

	if (!status) {
		return lastSeen;
	}

	switch(status["_"] || status["type"]) {
		case "userStatusOnline":
			lastSeen = "Online";
		break;

		case "userStatusOffline":
			let date = parseInt(status["was_online"]) * 1000; //seconds to milliseconds

			lastSeen = "Last seen " + moment(date).fromNow();
		break;

		case "userStatusRecently":
			lastSeen = "Last seen recently";
		break;

		case "userStatusLastWeek":
			lastSeen = "Last seen last week";
		break;

		case "userStatusLastMonth":
			lastSeen = "Last seen last month";
		break;
	}

	return lastSeen;
}

function getPeerUserInfo(id, users) {
	let userInfo = users.find(user => user["id"] == id);
	try {
		if (userInfo["deleted"]) {
			userInfo["name"] = "Deleted Account";	
		} else {
			userInfo["name"] = userInfo["first_name"] + " " + (userInfo["last_name"] || "");
		}
		return userInfo;
	} catch (error) {
		console.log(error.message);
	}
}

function getPeerChatInfo(id, chats) {
	let chatInfo = chats.find(chat => chat["id"] == id);
	try {
		chatInfo["name"] = chatInfo["title"];
		return chatInfo;	
	} catch (error) {
		console.log(error.message);
	}
	
}

function getPeerUserMessages(peer, messages) {
	let peerMessages = messages.filter(compareMessageWithPeer);

	function compareMessageWithPeer(msg) {
		let msgPeer = msg["to_id"];
		
		let samePeerId = (peer["user_id"] == msgPeer["user_id"]) || (peer["user_id"] == msg["from_id"]); //outgoing or incoming message
		
		let samePeerType = (peer["_"] || peer["type"]) === (msgPeer["_"] || msgPeer["type"]); //always true both peerUser;

		return samePeerType && samePeerId;
	}

	return peerMessages; 
}

function getMessageSenderInChat(messages, users) {
	let messagesWithUser = messages.map(function(msg) {
		msg["sender"] = getPeerUserInfo(msg["from_id"], users);
		return msg;
	})

	return messagesWithUser;
}

function getPeerChatMessages(peer, messages, users) {
	let peerMessages = messages.filter(compareMessageWithPeer);

	function compareMessageWithPeer(msg) {
		let msgPeer = msg["to_id"];
		
		let peerIdField = getPeerIdKey(msgPeer["_"] || msgPeer["type"]); // could be chat_id or channel_id;

		let samePeerId = peer[peerIdField] == msgPeer[peerIdField]; // the value of chat_id or channel_id;
		
		let samePeerType = (peer["_"] || peer["type"]) === (msgPeer["_"] || msgPeer["type"]); // could be peerChat or peerChannel;

		return samePeerType && samePeerId;
	}

	return peerMessages; 
}

function getPeerIdKey(peerType) {
	let key = "";
	switch(peerType) {
		case "peerUser":
			key = "user_id";
		break;

		case "peerChannel":
			key = "channel_id";
		break;

		case "peerChat":
			key = "chat_id";
		break;
	}

	return key;
}

function getPeerDbName(id, type) {
	if (Number(id)) {
		/*
		* peer type must be the prefix
		*/
		return `${type}_${id}`
	}
	/*
	* "id" has been mistakenly put in place of "type"
	*/
	return `${id}_${type}`;
}
function toPeerObject(id, type) {
	let peer = {};
	switch(type) {
		case "channel":
			peer["_"] = "peerChannel";
			peer["channel_id"] = parseInt(id);
		break;

		case "user":
			peer["_"] = "peerUser";
			peer["user_id"] = parseInt(id);
		break;
		
		case "chat":
			peer["_"] = "peerChat";
			peer["chat_id"] = parseInt(id);
 		break;
 	}

 	return peer;
}
function handleLogout() {
	let signout = document.querySelector("#signout");
	
	if (signout) {
		signout.addEventListener("click", signOut);
	}

	async function signOut() {
		try {
			await client.logout();
			await client.storage.clear();
			window.location.reload();
		} catch (error) {
			console.log(error.message);
		}
	}
}

function scrollToLastMessage(lastReadMsg) {
	try {
		let convoContainer = document.querySelector("#conversation-list .columns");
		
		let lastReadMsgContainer = convoContainer.querySelector(`[data-mgs_id='${lastReadMsg}']`);
		if (lastReadMsgContainer) {
			lastReadMsgContainer.scrollIntoView();
		} else {
			convoContainer.lastElementChild.scrollIntoView();
		}
	} catch (error) {
		console.log(error.message);
	}
}

function loadingIcon() {
	return `<div class='buttons is-centered'><button class="button is-large is-white is-loading"></button></div>`;
}
/*
* TODO: Worker functions
*/
function workerEntry() {
	/*
	* Import Worker
	*/
	const UpdateWorker = require("worker-loader?inline!./update.worker.js");

	let updateWorker = new UpdateWorker();
	updateWorker.onmessage = function(event) {
		console.log("Message from worker >>>", event.data);
	}
	
	updateWorker.postMessage("app.js");

	updateWorker.onerror = function(error) {
		console.log("Error in update worker >>>", error.message);
	}
}
// workerEntry();