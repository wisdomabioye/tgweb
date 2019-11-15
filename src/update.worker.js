/*
* Worker periodically check for update
* If there's an update, it saves in the DB
* and notify app.js about the update
* app.js fetch the update from DB and update UI
*/

import TelegramClient from './tgClient';
const client = new TelegramClient();

self.postMessage("Update Worker ready!!");

self.addEventListener("message", function(event) {
	console.log("message received in worker", event.data);
})
console.log('ran')