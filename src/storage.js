import localforage from "localforage";

/*
*
* tgweb_currentUser,
* tgweb_chatHistory,
* tgweb_dialogs 
*/


function Storage(dbName = {}) {
	this.historyDbName = dbName["chatHistory"] || "tgweb_chatHistory";
	this.userDbName = dbName["user"] || "tgweb_currentUser";
	this.dialogDbName = dbName["dialog"] || "tgweb_dialogs";
	this.stateDbName = dbName["state"] || "tgweb_appState";
}

/*
* Add extra methods to localforage
* get, set, remove, clear
* to be used by "mtproto"
*/

Storage.prototype.get = function(key) {
	return localforage.getItem(key);
}

Storage.prototype.set = function(key, value) {
	return localforage.setItem(key, value);
}

Storage.prototype.remove = function(keys) {
	if (typeof keys === "string") {
		keys = [keys];
	}
	keys.forEach(async function(key) {
		await localforage.removeItem(key);
	});
}

Storage.prototype.clear = function() {
	return localforage.clear();
}

Storage.prototype.setState = function(newState) {
	return localforage.setItem(this.stateDbName, newState);
}

Storage.prototype.getState = function() {
	return localforage.getItem(this.stateDbName);
}

Storage.prototype.signInStatus = function() {
	return localforage.getItem("signedin");
}

Storage.prototype.newUser = function(userObject) {
	return localforage.setItem(this.userDbName, userObject);
}

Storage.prototype.getUser = function() {
	return localforage.getItem(this.userDbName);
}

Storage.prototype.newDialog = function(dialogObject) {
	return localforage.setItem(this.dialogDbName, dialogObject);
}

Storage.prototype.getDialog = function() {
	return localforage.getItem(this.dialogDbName);
}

Storage.prototype.newHistory = function(historyObject) {
	return localforage.setItem(this.historyDbName, historyObject);
}

Storage.prototype.getHistory = function() {
	return localforage.getItem(this.historyDbName);
}

Storage.prototype.purgeDb = async function() {
	/*
	* Purge Db but preserve Auth status
	*/
	try {
		let dbs = await localforage.keys();
		dbs.forEach(async function(db) {
			if (db.includes("channel") || db.includes("user") || db.includes("tgweb") || db.includes("chat")) {
				await localforage.removeItem(db);
			}
		})
	} catch (error) {
		console.log(error.message);
	}
}

export default Storage;