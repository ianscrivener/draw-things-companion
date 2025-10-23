pub mod schema;
pub mod models;
pub mod operations;

use std::path::PathBuf;
use rusqlite::{Connection, Result};

#[allow(dead_code)]
pub struct Database {
    conn: Connection,
}

#[allow(dead_code)]
impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        Ok(Database { conn })
    }

    pub fn init_schema(&self) -> Result<()> {
        schema::create_tables(&self.conn)
    }
}
