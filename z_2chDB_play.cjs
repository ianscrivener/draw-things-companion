const { Session } = require("chdb");

const session = new Session("./chdb-node-data");
session.cleanup(); // This deletes the database files


