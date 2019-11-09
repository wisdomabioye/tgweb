import {randomInt} from "./utils";

const initTelegramMtproto = require ('./mproto.js');

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

        this.apiId  = apiId;
        this.apiHash = apiHash;
        this.name = name;
        this.createSendMessageId = (() => randomInt (11, 8000000007));
        this.telegramMtproto = initTelegramMtproto (this.apiId,
            this.name);
    }

    static asInputPeer (...args)  {

        if (args.length === 1) {

            return new InputPeer (...args);
        } else {

            return args.map (a => new InputPeer (a));
        }
    }

    // static asInputMedia (...args)  {

    //     if (args.length === 1) {

    //         return new InputMedia (args [0]);
    //     } else {

    //         return args.map (a => new InputMedia (a));
    //     }
    // }

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
        console.log("requestCode>>>", requestCode);
        return requestCode["phone_code_hash"];
    }

    async signInWithPhone(code, phoneCodeHash = this.phoneCodeHash, phone = this.phone) {

        console.log(phoneCodeHash, phone);
        const requestSignIn = await this.telegramMtproto("auth.signIn", {
            phone_number: this.phone || phone,
            phone_code_hash: this.phoneCodeHash || phoneCodeHash,
            phone_code: code

        });
        console.log("requestSignIn>>>", requestSignIn);
        console.log("Signed In>>>>", requestSignIn["user"]);
        return requestSignIn;
    }

    async signUpWithPhone(firstName, lastName = "", phoneCodeHash = this.phoneCodeHash, phone = this.phone) {
        const requestSignUp = await this.telegramMtproto("auth.signUp", {
            phone_number: this.phone || phone,
            phone_code_hash: this.phoneCodeHash || phoneCodeHash,
            first_name: firstName,
            last_name: lastName
        })
        console.log("requestSignUp>>>>", requestSignUp)
        return requestSignUp;
    }

    async getChats () {
    
        const dialogs = await this.telegramMtproto ('messages.getDialogs', {
    
            limit: 1000,
        });
        
        const {chats, users} = dialogs;
    
        users.forEach (user => {
    
            user.display = () => {
              
                let res = '';
                res += user.first_name;
    
                if (user.last_name !== undefined) {
    
                    res += ' ' + user.last_name;
                }
                
                if (user.username !== undefined) {
    
                    res += ' @' + user.username;
                }
    
                return res;
            };
        });
    
        chats.forEach (chat => {
    
            chat.display = () => {
              
                let res = '';
                res += chat.title;
                
                if (chat.username !== undefined) {
    
                    res += ' @' + chat.username;
                }
    
                return res;
            };
        });
    
        return [...users, ...chats];
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

    async call (...args) {
        
        return this.telegramMtproto (...args);
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

    // async sendMediaMessage (target, media, message = '') {

    //     return this.telegramMtproto ('messages.sendMedia', {
    //         peer: new InputPeer (target),
    //         random_id: this.createSendMessageId (),
    //         media: new InputMedia (media),
    //         message,
    //     });
    // }
}


export default TelegramClient;
