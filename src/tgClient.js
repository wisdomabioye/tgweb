import Storage from "./storage";
import {randomInt} from "./utils";
import initTelegramMtproto from "./mproto.js";

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

    constructor (apiId, apiHash, name) {

        this.apiId  = apiId || data.appId;
        this.apiHash = apiHash || data.appHash;
        this.name = name || data.name;
        this.storage = store;
        this.createSendMessageId = (() => randomInt (11, 8000000007));
        this.telegramMtproto = initTelegramMtproto (this.apiId,
            this.name, store);
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
    /*async getAndSaveChatsData (jsonFileName = 'chats.json',
        txtFileName = 'chats.txt') {

        const chats = await this.getChats ();
    
        const chatsData = chats.map (chat => {
    
            const result = {
            
                display: chat.display (),
                id: chat.id,
                type: chat._,
            };
    
            if (chat.access_hash !== undefined) {
    
                result.access_hash = chat.access_hash;
            }
    
            return result;
        });
    
        saveAsJson (jsonFileName, chatsData);
        save (txtFileName, chatsData.reduce ((acc, val) =>
            acc + val.type + ' ' + val.display + ' | id: ' +
            val.id + '\r\n', 'Chats:\r\n'));
    
        return chatsData;
    }*/

    callMethod (name, options = {}) {
        return this.telegramMtproto(name, options);
    }

    async chatHistory (chat) {
    
        const max = 400;
        const limit = 100;
        let offset = 0;
        let full = [];
        let messages = [];
        
        do {
    
            const history = await this.telegramMtproto ('messages.getHistory', {
                peer: new InputPeer (chat),
                max_id: offset,
                offset: -full.length,
                limit
            });
            messages = history.messages;
            full = full.concat (messages);
            messages.length > 0 && (offset = messages[0].id);
        } while (messages.length === limit && full.length < max);
        
        return full;
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

    async sendMessage (target, message) {     
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
