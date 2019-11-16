export const randomInt = (minValue, maxValue) =>
    minValue + Math.floor (Math.random () * (maxValue - minValue));


export function toggleLoadingButton(btnElement) {
	if (typeof btnElement === "string") {
		btnElement = document.querySelector(btnElement);	
	}

	if (btnElement && "classList" in btnElement) {
		btnElement.classList.toggle("is-loading");
	}
}

export function writeErrorToHTML (msg, element) {

	if (typeof element === "string") {
		element = document.querySelector(element);
	}

	if (element && "innerHTML" in element) {
		element.innerHTML = msg;		
	}
}


export function findClosestElement(el, selector) {
    var matchesFn;

    // find vendor prefix
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] == 'function') {
            matchesFn = fn;
            return true;
        }
        return false;
    })

    var parent;

    // traverse parents
    while (el) {
        parent = el.parentElement;
        if (parent && parent[matchesFn](selector)) {
            return parent;
        }
        el = parent;
    }

    return null;
}

export function toggleElementVisibility(element, prop) {
	if (typeof element == "string") {
		element = document.querySelector(element);
	}

	if (element && "style" in element) {
		let visibility = ["block", "absolute", "fixed"];

		let display = element.style.display;
		if (!display || visibility.includes(display)) {
			element.style.display = "none";
		} else {
			element.style.display = prop || "";
		}
	}
}

export function camelCasedToSentence(str) {
    var spacedStr = "";
    
    for (var i = 1; i < str.length; i++) {
        
        if (str[i] == str[i].toUpperCase()) {
            spacedStr += " " + str[i].toLowerCase();
            continue;
        }

        spacedStr += str[i];
    }
    spacedStr = str[0].toUpperCase() + spacedStr;
    return spacedStr;    
}

export function underscoreCasedToSentence(str) {
	str = str.split("_").join(" ").toLowerCase();	

	return str[0].toUpperCase() + str.substring(1);
}

export function getSubstring(str, max) {
    if (!str || typeof str !== "string") {
        return str;
    }

    if (str.length > 40) {
        return str.substring(0, max) + "...";
    } else {
        return str;
    }
}

export function getPeerIcon(type) {
    switch(type) {
        case "user":
            return "user";
        case "channel":
        case "chat":
            return "group";
        default:
            return "info";
    }
}

export function getPeerIdKey(peerType) {
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

export function getPeerDbName(id, type) {
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
export function toPeerObject(id, type) {
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

export function getPeerUserMessages(peer, messages) {
    let peerMessages = messages.filter(compareMessageWithPeer);

    function compareMessageWithPeer(msg) {
        let msgPeer = msg["to_id"];
        
        let samePeerId = (peer["user_id"] == msgPeer["user_id"]) || (peer["user_id"] == msg["from_id"]); //outgoing or incoming message
        
        let samePeerType = (peer["_"] || peer["type"]) === (msgPeer["_"] || msgPeer["type"]); //always true both peerUser;

        return samePeerType && samePeerId;
    }

    return peerMessages; 
}

export function getPeerChatMessages(peer, messages, users) {
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