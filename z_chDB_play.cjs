const { Session } = require("chdb");

// Create a session with persistent storage
const session = new Session("./chdb-node-data");

try {
    // Create database and table
    session.query(`
            CREATE DATABASE IF NOT EXISTS myapp;
            CREATE TABLE IF NOT EXISTS myapp.users (
                id UInt32,
                name String,
                email String,
                created_at DateTime DEFAULT now()
            ) ENGINE = MergeTree() ORDER BY id
        `);

    // // Insert sample data
    session.query(`
            INSERT INTO myapp.users (id, name, email) VALUES 
            (1, 'Alice', 'alice@example.com'),
            (2, 'Bob', 'bob@example.com'),
            (3, 'Charlie', 'charlie@example.com')
        `);

    // Query the data with different formats
    const csvResult = session.query("SELECT * FROM myapp.users ORDER BY id", "CSV");
    console.log("CSV Result:", csvResult);

    const jsonResult = session.query("SELECT * FROM myapp.users ORDER BY id", "JSON");
    console.log("JSON Result:", jsonResult);

    // Aggregate queries
    const stats = session.query(`
            SELECT 
                COUNT(*) as total_users,
                MAX(id) as max_id,
                MIN(created_at) as earliest_signup
            FROM myapp.users
        `, "Pretty");
    console.log("User Statistics:", stats);

}
finally {
    // Always cleanup the session
    session.cleanup(); // This deletes the database files
}


