import "@babel/polyfill";
import moment from "moment";

import {
	toggleLoadingButton, 
	writeErrorToHTML, 
	toggleElementVisibility, 
	underscoreCasedToSentence, 
	getSubstring,
	camelCasedToSentence, 
	getPeerIcon,
	getPeerIdKey, getPeerDbName,
	toPeerObject, getPeerUserMessages,
	getPeerChatMessages


	 } from "./utils";

import TelegramClient from './tgclient';
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

async function messengerHandlersWrapper() {
	sendMessageHandler();
	handleLogout();
	setOnlineStatus();
	await getAndUpdateState();
	await getAndUpdateDialog();
	stateChangeWatcher();
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
function sendMessageHandler() {
	let btn = document.getElementById("send-message-btn");
	let msgBox = document.getElementById("message-box");
	if (!btn || !msgBox) return;

	btn.addEventListener("click", msgEventHandler);
	msgBox.addEventListener("keypress", function(e) {
		if (e.keyCode == 13) {
			msgEventHandler();
		}
	})

	async function msgEventHandler() {
		let msg = document.getElementById("message-box");
		let peerInfo = document.getElementById("conversation-list");

		if (msg && msg.value && peerInfo) {
			let id = parseInt(peerInfo.getAttribute("data-id")),
				type = peerInfo.getAttribute("data-type"),
				access_hash = peerInfo.getAttribute("data-access_hash");
			let send = await client.sendMessage({id, type, access_hash}, msg.value);
			/*
			* Reset input field
			*/
			msg.value = "";
		}
	}
}

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

function initializeAppAndRender() {
	getDialogAndRender();
}

async function reRenderDialog() {
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
}
async function getDialogAndRender() {
	/*
	* 1. Get dialogs
	* 2. Save dialogs to DB
	* 3. Send dialogs chats and users to history handler
	* 4. call getChatList to render dialogs
	*/

	let dialogs = await client.storage.getDialog();
	let currentState = await client.storage.getState();

	if (currentState) {
		setDocumentTitle(currentState["unread_count"]);
	}
	/*
	* Start rendering
	*/
	getChatList(dialogs);
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

	let lastMessage = chat["last_message"];
		lastMessage = lastMessage ? getSubstring(lastMessage, 40) : "<i>Media embeded</i>";
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
		/*
		* only get history for channel
		*/
		getChannelDifference({type, id, access_hash}, pts);
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
		if (history["messages"] && history["chats"] && history["users"]) {
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
			newHistory = {
				...oldHistory,
				...history
			}
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
function getMessageSenderInChat(messages, users) {
	let messagesWithUser = messages.map(function(msg) {
		msg["sender"] = getPeerUserInfo(msg["from_id"], users);
		return msg;
	})

	return messagesWithUser;
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

function handleLogout() {
	let signout = document.querySelector("#signout");
	
	if (signout) {
		signout.addEventListener("click", signOut);
	}

	async function signOut() {
		try {
			await client.logout();
			await client.storage.clear();
			window.location.replace("/signin.html");
		} catch (error) {
			console.log(error.message);
		}
	}
}

/*
* Worker Supposed Functions
*/

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
	reRenderDialog();
}

async function getAndUpdateDialog() {
	/*
	* 1. Get dialogs
	* 2. Save dialogs to DB
	*/
	let dialogs = await client.getDialogs();
	await client.storage.newDialog(dialogs);
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

async function getChannelDifference(inputPeer, pts) {
	let options = {
		pts,
		limit: 200,
		force: true,
	}
	try {
		let difference = await client.getChannelDifference(inputPeer, options);
		
		let dbName = getPeerDbName(inputPeer["id"], inputPeer["type"]);

		if (difference["_"] == "updates.channelDifference") {
			let {_, new_messages: messages, chats, users, pts} = difference;

			
			await updateHistoryDb(dbName, {messages, chats, users, pts});
			
		
		} else if (difference["_"] == "updates.channelDifferenceTooLong") {
			await updateHistoryDb(dbName, {pts: difference["pts"]});
		}

	} catch (error) {
		console.log(error.message);
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

