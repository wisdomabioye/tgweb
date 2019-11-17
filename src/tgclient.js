import localforage from "localforage";
import MTProto from "./telegram-mtproto";

const randomInt = (minValue, maxValue) =>
    minValue + Math.floor (Math.random () * (maxValue - minValue));

const initTelegramMtproto = (apiId, storage) => {

    const api = {
        invokeWithLayer: 0xda9b0d0d,
        layer: 57,
        initConnection: 0x69796de9,
        api_id: apiId,
        app_version: '1.0.1',
        lang_code: 'en',
    };
    
    const server = {
        webogram: true,
        dev: false,
    };

    const app = {
        storage: storage
    };

    return MTProto ({
        api,
        server,
        app
    });
};

const store = new Storage();
const data = {
    appId: 319070,
    appHash: "8e1de208192e9cc1dcf6c63b8c42fc2d",
    name: "telegram-gweb"
};
class InputPeer {

    constructor (target) {

        switch (target._ || target.type) {

            case 'user':
                this ['_'] = 'inputPeerUser';
                this.user_id = target.id;
                this.access_hash = target.access_hash;
                break;
            case 'channel':
                this ['_'] = 'inputPeerChannel';
                this.channel_id = target.id;
                this.access_hash = target.access_hash;
                break;
            case 'chat':
                this ['_'] = 'inputPeerChat';
                this.chat_id = target.id;
                break;
            case 'chatForbidden':
                this ['_'] = 'chatForbidden';
                this.chat_id = target.id;
                break;
        
            default:
                throw new Error (`Unknown target type: '${target._}'`);
        }
    }
}

class TelegramClient {

    constructor (apiId, apiHash) {
        this.apiId  = apiId || data.appId;
        this.apiHash = apiHash || data.appHash;
        this.storage = store;
        this.createSendMessageId = (() => randomInt (11, 8000000007));
         this.telegramMtproto = initTelegramMtproto(this.apiId, this.storage);
    }

    toInputPeer(peer) {
        let newPeer = {}
        switch (peer["_"] || peer["type"]) {
            case 'user':
                newPeer['_'] = 'inputPeerUser';
                newPeer["user_id"] = peer["id"];
                newPeer["access_hash"] = peer["access_hash"];
                break;
            case 'channel':
                newPeer['_'] = 'inputPeerChannel';
                newPeer["channel_id"] = peer["id"];
                newPeer["access_hash"] = peer["access_hash"];
                break;
            case 'chat':
                newPeer['_'] = 'inputPeerChat';
                newPeer["chat_id"] = peer["id"];
                break;
            /*case 'chatForbidden':
                newPeer['_'] = 'chatForbidden';
                newPeer["chat_id"] = peer["id"];
                break;*/
            default:
                throw new Error (`Unknown peer type: '${peer._}'`);
        }
        return newPeer;
    }
    async markChannelHistoryAsRead(inputChannel, options = {}) {
        return await this.telegramMtproto("channels.readHistory", {
            channel: {
                ...this.toInputPeer(inputChannel), 
                "_": "inputChannel"
            },
            ...options
        })
    }

    async markUserHistoryAsRead(inputUser, options = {}) {
        return await this.telegramMtproto("messages.readHistory", {
            peer: this.toInputPeer(inputUser),
            ...options
        })
    }
    async sendAuthCode (phone) {
        const requestCode = await this.telegramMtproto ('auth.sendCode', {
            phone_number: phone,
            current_number: true,
            api_id: this.apiId,
            api_hash: this.apiHash,
        });
        /*
        * put phone and phone_code_hash in context
        */
        this.phone = phone;
        this.phoneCodeHash = requestCode["phone_code_hash"];
        return requestCode["phone_code_hash"];
    }

    async signInWithPhone (code, phoneCodeHash = this.phoneCodeHash, phone = this.phone) {
        const requestSignIn = await this.telegramMtproto("auth.signIn", {
            phone_number: this.phone || phone,
            phone_code_hash: this.phoneCodeHash || phoneCodeHash,
            phone_code: code

        });
        return requestSignIn;
    }

    async signUpWithPhone (firstName, lastName = "", phoneCodeHash = this.phoneCodeHash, phone = this.phone) {
        const requestSignUp = await this.telegramMtproto("auth.signUp", {
            phone_number: this.phone || phone,
            phone_code_hash: this.phoneCodeHash || phoneCodeHash,
            first_name: firstName,
            last_name: lastName
        })
        return requestSignUp;
    }

    async getDialogs () {
        const dialogs = await this.telegramMtproto ('messages.getDialogs', {
            limit: 100,
        });
        
        return dialogs;
    }

    getState () {
        return this.telegramMtproto("updates.getState");
    }
   
    async getMessageHistory(peerInfo, options = {}) {
        let peer = this.toInputPeer(peerInfo);

            let history = await this.telegramMtproto("messages.getHistory", {
                    peer: peer,
                    limit: 100,
                    offset: 0,
                    ...options
                })
        return history;
    }

    async getChannelDifference(inputChannel, options = {}) {
        return await this.telegramMtproto("updates.getChannelDifference", {
            channel: {
                 ...this.toInputPeer(inputChannel), 
                "_": "inputChannel"
            },
            ...options
        })
    }

    callMethod (name, options = {}) {
        return this.telegramMtproto(name, options);
    }

    async forwardMessages (from, to, messages) {
        
        return this.telegramMtproto ('messages.forwardMessages', {
            from_peer: new InputPeer (from),
            to_peer: new InputPeer (to),
            random_id: messages.map (() => this.createSendMessageId ()),
            id: messages.map (m => m.id),
        });
    }
    async deleteMessagesFromChannel (from, messages) {

        return this.telegramMtproto ('channels.deleteMessages', {
            channel: new InputPeer (from),
            id: messages.map (m => m.id),
        });
    }

    sendMessage (target, message) {     
        return this.telegramMtproto ('messages.sendMessage', {
            peer: new InputPeer (target),
            random_id: this.createSendMessageId (),
            message,
        });
    }

    async logout () {
        return this.telegramMtproto("auth.logOut");
    }
}

export default TelegramClient;

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