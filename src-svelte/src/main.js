import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";

import { appState, findCkpt } from './appState.svelte.js';

import { app_init } from "./lib/init/app_init.js";
import { check_setup } from "./lib/init/check_setup";
import { read_ckpts } from "./lib/ckpt_ls/read_ckpts";
import { get_type } from "./lib/data/get_type.js";
import { read_json } from "./lib/data/read_json";
import { check_parquet_updates } from "./lib/updates/check_parquet_updates.js";
import { get_children } from "./lib/data/get_children";
import { get_parents } from "./lib/data/get_parents";

const app = mount(App, { target: document.getElementById("app") });

export default app;

let jsonObj;

// ################################################################################
await app_init();

// ################################################################################
await check_setup();


// ################################################################################
// read JSON models for Mac

for (const item of appState.settings.ckpt_types) {
	jsonObj = await read_json("mac", item);
	if (jsonObj.code === 0) {
		appState.mac[`${item}s`] = jsonObj.result;
		appState.init.load_json.mac[item] = true;
	}
}
// ################################################################################
// read JSON models for Stash

for (const item of appState.settings.ckpt_types) {
	jsonObj = await read_json("stash", item);
	if (jsonObj.code === 0) {
		appState.stash[`${item}s`] = jsonObj.result;
		appState.init.load_json.stash[item] = true;
	}
}

// ################################################################################
// read Parquet
await check_parquet_updates();


// ################################################################################
// list ckpt files for Mac
for (const item of appState.settings.ckpt_types) {
	jsonObj = await read_ckpts("mac", item);
	if (jsonObj.code === 0) {
		console.log(`[main.js] read_ckpts mac models - count: ${jsonObj.result.length} - success: ${jsonObj.code === 0}`);
		appState.ckpts.mac = jsonObj.result;
		appState.init.cktp_list.mac = true;
	}
}

// ################################################################################
// list ckpt files for Mac
for (const item of appState.settings.ckpt_types) {
	jsonObj = await read_ckpts("stash", item);
	if (jsonObj.code === 0) {
		console.log(`[main.js] read_ckpts stash models - count: ${jsonObj.result.length} - success: ${jsonObj.code === 0}`);
		appState.ckpts.stash = jsonObj.result;
		appState.init.cktp_list.stash = true;
	}
}

let filename = "qwen_image_1.0_q6p.ckpt";

// jsonObj = await get_children(filename);
// console.log(`[main.js] get_children ${JSON.stringify(jsonObj)}`)

jsonObj = await findCkpt(filename);
console.log(`[main.js] get_children2 ${JSON.stringify(jsonObj)}`)

// jsonObj = appState.mac.models.forEach(xxx => {
// 	console.log(`[main.js] Mac model: ${xxx.file}`);
// });
// jsonObj = appState.mac.loras.forEach(xxx => {
// 	console.log(`[main.js] Mac lora: ${xxx.file}`);
// });
// jsonObj = appState.mac.controls.forEach(xxx => {
// 	console.log(`[main.js] Mac control: ${xxx.file}`);
// });




// if (res.code === 0) {
// 	for (let i = 0; i < res.result.length; i++) {

// 		let ckpt_type = await get_type(res.result[i].ckpt_filename);
// 		let j = i + 1;

// 		console.log(`[main.js] Processing CKPT ${j}/${res.result.length} : ${res.result[i].ckpt_filename} - type: ${ckpt_type.result}`);

// 		if (ckpt_type.code === 0) {
// 			console.log('[main.js] ');
// 			if (ckpt_type.result === "model") {
// 				appState.mac.models.push(ckpt);
// 			}
// 			else if (ckpt_type.result === "lora") {
// 				appState.mac.loras.push(ckpt);
// 			}
// 			else if (ckpt_type.result === "control") {
// 				appState.mac.controls.push(ckpt);
// 			}
// 			console.log(`[main.js] Processing CKPT ${j}/${res.result.length} : ${res.result[i].ckpt_filename} - type: ${ckpt_type.result}`);
// 		}
// 		else {
// 			console.log(`[main.js] Processing CKPT ${j}/${res.result.length} : ${res.result[i].ckpt_filename} - error determining model type`);
// 		}
// 	}
// }
// else {
// 	console.error('[main.js] Error reading Mac models:', res.error);
// }



// // ls Stash models
// res = await read_ckpts("stash", "model");
// if (res.code === 0) {
// 	appState.mac.models = res.result;
// }

// await read_ckpts("mac", "lora");
// await read_ckpts("mac", "control");




