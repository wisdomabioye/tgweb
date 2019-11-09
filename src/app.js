import "@babel/polyfill";
import {toggleLoadingButton, writeErrorToHTML, toggleElementVisibility, underscoreCasedToSentence} from "./utils";
import TelegramClient from './tgClient';

document.addEventListener("DOMContentLoaded", function() {
	registerChatSwitch();
	registerSignInFlowHandlers()
})


function registerChatSwitch() {
	let chatList = document.querySelectorAll("#chat-list li");

	chatList.forEach(function(chat) {
		chat.addEventListener("click", function(e) {
			/*
			* remove last is-active class
			*/
			let lastSelectedChat = document.querySelector("#chat-list .is-active");
			
			if (lastSelectedChat) {
				lastSelectedChat.classList.remove("is-active");
			}
			/*
			* add is-active to the currently clicked chat
			*/
			let target = e.currentTarget;
			if (target) {
				target.querySelector("a").classList.add("is-active");
			}
		})
	})
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

const data = {
	appId: 319070,
	appHash: "8e1de208192e9cc1dcf6c63b8c42fc2d"
};

const client = new TelegramClient (data.appId, data.appHash, "uniquesnameforstorage");


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
			console.log(error);

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
		lastNameField = document.querySelector(".signup input[name='lastname']");
	
	if (!firstNameField || !lastNameField) {
		return;
	}

	try {
		toggleLoadingButton(".signup button.button");

		let firstName = firstNameField.value,
			lastName = lastNameField.value;
		if (!firstName || !lastName) {
			throw new Error("First name and last name are required");
		}

		await client.signUpWithPhone(firstName, lastName);
		console.log("done registered")
		window.location.replace("/");
	} catch (error) {
		console.log(error);

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
			await client.signInWithPhone(code);
			/*
			* redirect to messenger index "/"
			*/
			window.location.replace("/");
		} catch(error) {
			console.log(error);

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




/*const main = async () => {

    const client = new TelegramClient (data.appId, data.appHash,
        data.phone,
        async () => data.phone,
        () => {

        	let phone = window.prompt("Type in your phone number");

        	if (!phone) {
        		return window.alert("Invalid phone");
        	}

            return new Promise (resolve => {
                resolve(phone);
            });
        });

    await client.login ();

    const chats = await client.getChats ();
    const me = chats.find ((chat) => chat.self);
    // let chats = await Promise.resolve(data);

    console.log(chats);

    // client.sendMessage (me, 'Hello, is it me you\'re looking for?');
};
*/
// main();


