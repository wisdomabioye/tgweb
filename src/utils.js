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