import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";

// for assets(resources) served via rust
// import { resolveResource, appDataDir, appLocalDataDir, dataDir, localDataDir, resourceDir } from '@tauri-apps/api/path';
import { readFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { resourceDir, resolveResource, appDataDir, appLocalDataDir, localDataDir, dataDir } from '@tauri-apps/api/path';

import DuckDB from './DuckDB.js';

// import { appState, findCkpt } from './appState.svelte.js';
// import { app_init } from "./lib/init/app_init.js";
// import { check_setup } from "./lib/init/check_setup";
// import { read_ckpts } from "./lib/ckpt_ls/read_ckpts";
// import { get_type } from "./lib/data/get_type.js";
// import { read_json } from "./lib/data/read_json";
// import { check_parquet_updates } from "./lib/updates/check_parquet_updates.js";
// import { get_children } from "./lib/data/get_children";
// import { get_parents } from "./lib/data/get_parents";

const app = mount(App, { target: document.getElementById("app") });

export default app;

// ###############################################################################
// ###############################################################################
// Test parquet read

// console.log('resourceDir:', await resourceDir());
// console.log('appDataDir:', await appDataDir());
// console.log('appLocalDataDir:', await appLocalDataDir());
// console.log('dataDir:', await dataDir());
// console.log('localDataDir:', await localDataDir());

// // Fetch a remote Parquet file and convert its content to a Uint8Array
// const res = await fetch('https://origin/remote.parquet');
// const buffer = new Uint8Array(await res.arrayBuffer());
// // Register the buffer as a virtual file named 'buffer.parquet'
// await db.registerFileBuffer('buffer.parquet', buffer);
// // Now you can query the data using SQL
// const result = await c.query(`SELECT * FROM 'buffer.parquet'`);
// console.log(result.toArray());

// ###############################################################################
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

// ###############################################################################
try {


	let csv_path = "/Users/ianscrivener/.drawthings_companion/community-models.csv";
	const file_exists = await exists(csv_path);

	// fail
	if (!file_exists) {
		console.error('CSV file does not exist, aborting test.');
	}

	// success
	else {

		const conn = await DuckDB.connect();
		console.log('DuckDB connection established successfully.');


		// read the CSV
		const data = await readTextFile(csv_path)
			.then((content) => {
				console.log(`CSV file exists:`, file_exists, ' - Filesize:', content.length);
				return content;
			})
			.catch((err) => {
				console.error('Error reading CSV file:', err);
				return null;
			});



		// Register as virtual file
		await DuckDB.registerFileText('community-models.csv', data)
		console.log('CSV file registered successfully.');


		// Query it
		const result = await conn.query("SELECT * FROM 'community-models.csv' LIMIT 10;")
		// console.log('CSV model count query result:', res.toArray());

		// Convert to plain JavaScript objects
		const rows = result.toArray().map(row => row.toJSON());
		console.log(rows);

		await conn.close();
		console.log('DuckDB connection closed.');
	}
}
catch (error) {
	console.error('Error reading CSV file:', error);
}



// ###############################################################################

// try {

// 	let json_path = "/Users/ianscrivener/Library/Containers/com.liuliu.draw-things/Data/Documents/Models/custom.json";
// 	const file_exists = await exists(json_path);

// 	// fail
// 	if (!file_exists) {
// 		console.error('JSON file does not exist, aborting test.');
// 	}
// 	// success
// 	else {

// 		// read the JSON
// 		const data = await readTextFile(json_path);
// 		console.log(`JSON file exists:`, file_exists, ' - Filesize:', data.length);

// 		// Register as virtual file
// 		await db.registerFileText('mac-custom.json', data);

// 		// await conn.query(`
// 		// 	SELECT * FROM 'community-models.csv';
// 		// `);

// 		// // Query it
// 		// let result = await conn.query(`
// 		// 	SELECT * FROM 'community-models.csv' LIMIT 10;
// 		// `);
// 		// // console.log('CSV model count query result:', result.toArray());

// 		// // Convert to plain JavaScript objects
// 		// const rows = result.toArray().map(row => row.toJSON());
// 		// // console.log(rows);

// 	}
// }
// catch (error) {
// 	console.error('Error reading CSV file:', error);
// }


// // Basic query
// console.log("Basic query");
// let q = await conn.query(`SELECT count(*)::INTEGER as v
// FROM generate_series(0, 100) t(v)`); // Returns v = 101
// console.log("Query result (Arrow Table):", q);

// // Copy of query result (JSON instead of Arrow Table)
// console.log('Query result copy (JSON):', JSON.parse(JSON.stringify(q.toArray())));
// console.log('');

// // Prepare query
// console.log("Prepared query statement")
// const stmt = await conn.prepare(
// 	`SELECT (v + ?) as v FROM generate_series(0, 1000) as t(v);`
// );

// // ... and run the query with materialized results
// const res = await stmt.query(234); // Returns 1001 entries ranging from v = 234 to 1,234
// console.log("Statement result (Table):", res);
// console.log('Statement result copy (JSON):',
// 	// Bug fix explained at: https://github.com/GoogleChromeLabs/jsbi/issues/30
// 	JSON.parse(JSON.stringify(res.toArray(), (key, value) =>
// 		typeof value === 'bigint'
// 			? value.toString()
// 			: value // return everything else unchanged
// 	))
// );




// ###############################################################################
// Shut down DuckDB 
// await conn.close();
// await db.terminate();
// await worker.terminate();
