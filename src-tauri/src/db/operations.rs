use super::models::{MacModel, Model, ModelWithMacInfo, StashModel};
use rusqlite::{params, Connection, Result};

// Model operations
pub fn insert_model(conn: &Connection, model: &Model) -> Result<i64> {
    conn.execute(
        "INSERT INTO models (filename, display_name, model_type, file_size, checksum, source_path)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            model.filename,
            model.display_name,
            model.model_type,
            model.file_size,
            model.checksum,
            model.source_path,
        ],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn get_model_by_filename(conn: &Connection, filename: &str) -> Result<Option<Model>> {
    let mut stmt = conn.prepare(
        "SELECT id, filename, display_name, model_type, file_size, checksum, source_path, created_at, updated_at
         FROM models WHERE filename = ?1",
    )?;

    let model = stmt.query_row(params![filename], |row| {
        Ok(Model {
            id: Some(row.get(0)?),
            filename: row.get(1)?,
            display_name: row.get(2)?,
            model_type: row.get(3)?,
            file_size: row.get(4)?,
            checksum: row.get(5)?,
            source_path: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    });

    match model {
        Ok(m) => Ok(Some(m)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

pub fn get_model_by_id(conn: &Connection, id: i64) -> Result<Option<Model>> {
    let mut stmt = conn.prepare(
        "SELECT id, filename, display_name, model_type, file_size, checksum, source_path, created_at, updated_at
         FROM models WHERE id = ?1",
    )?;

    let model = stmt.query_row(params![id], |row| {
        Ok(Model {
            id: Some(row.get(0)?),
            filename: row.get(1)?,
            display_name: row.get(2)?,
            model_type: row.get(3)?,
            file_size: row.get(4)?,
            checksum: row.get(5)?,
            source_path: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    });

    match model {
        Ok(m) => Ok(Some(m)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

pub fn get_models_by_type(conn: &Connection, model_type: &str) -> Result<Vec<ModelWithMacInfo>> {
    let mut stmt = conn.prepare(
        "SELECT m.id, m.filename, m.display_name, m.model_type, m.file_size, m.checksum, m.source_path,
                m.created_at, m.updated_at, mm.display_order, mm.is_visible, mm.custom_name, mm.lora_strength
         FROM models m
         LEFT JOIN mac_models mm ON m.id = mm.model_id
         WHERE m.model_type = ?1
         ORDER BY mm.display_order ASC NULLS LAST, m.filename ASC",
    )?;

    let models = stmt
        .query_map(params![model_type], |row| {
            Ok(ModelWithMacInfo {
                model: Model {
                    id: Some(row.get(0)?),
                    filename: row.get(1)?,
                    display_name: row.get(2)?,
                    model_type: row.get(3)?,
                    file_size: row.get(4)?,
                    checksum: row.get(5)?,
                    source_path: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                },
                display_order: row.get(9)?,
                is_on_mac: row.get::<_, Option<i32>>(10)?.is_some(),
                custom_name: row.get(11)?,
                lora_strength: row.get(12)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

    Ok(models)
}

// Mac Model operations
pub fn insert_mac_model(conn: &Connection, mac_model: &MacModel) -> Result<i64> {
    conn.execute(
        "INSERT INTO mac_models (model_id, display_order, is_visible, custom_name, lora_strength)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            mac_model.model_id,
            mac_model.display_order,
            mac_model.is_visible as i32,
            mac_model.custom_name,
            mac_model.lora_strength,
        ],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn delete_mac_model(conn: &Connection, model_id: i64) -> Result<()> {
    conn.execute("DELETE FROM mac_models WHERE model_id = ?1", params![model_id])?;
    Ok(())
}

#[allow(dead_code)]
pub fn update_mac_model_order(conn: &Connection, model_id: i64, new_order: i32) -> Result<()> {
    conn.execute(
        "UPDATE mac_models SET display_order = ?1 WHERE model_id = ?2",
        params![new_order, model_id],
    )?;
    Ok(())
}

pub fn update_mac_models_batch(conn: &Connection, updates: Vec<(i64, i32)>) -> Result<()> {
    let tx = conn.unchecked_transaction()?;
    
    for (model_id, order) in updates {
        tx.execute(
            "UPDATE mac_models SET display_order = ?1 WHERE model_id = ?2",
            params![order, model_id],
        )?;
    }
    
    tx.commit()?;
    Ok(())
}

// Stash Model operations
pub fn insert_stash_model(conn: &Connection, stash_model: &StashModel) -> Result<i64> {
    conn.execute(
        "INSERT INTO stash_models (model_id, stash_path)
         VALUES (?1, ?2)",
        params![stash_model.model_id, stash_model.stash_path,],
    )?;
    Ok(conn.last_insert_rowid())
}

#[allow(dead_code)]
pub fn get_stash_model_by_model_id(conn: &Connection, model_id: i64) -> Result<Option<StashModel>> {
    let mut stmt = conn.prepare(
        "SELECT id, model_id, stash_path, last_synced
         FROM stash_models WHERE model_id = ?1",
    )?;

    let model = stmt.query_row(params![model_id], |row| {
        Ok(StashModel {
            id: Some(row.get(0)?),
            model_id: row.get(1)?,
            stash_path: row.get(2)?,
            last_synced: row.get(3)?,
        })
    });

    match model {
        Ok(m) => Ok(Some(m)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

// Config operations
pub fn get_config(conn: &Connection, key: &str) -> Result<Option<String>> {
    let mut stmt = conn.prepare("SELECT value FROM config WHERE key = ?1")?;
    
    let value = stmt.query_row(params![key], |row| row.get(0));
    
    match value {
        Ok(v) => Ok(Some(v)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

pub fn set_config(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO config (key, value) VALUES (?1, ?2)",
        params![key, value],
    )?;
    Ok(())
}
