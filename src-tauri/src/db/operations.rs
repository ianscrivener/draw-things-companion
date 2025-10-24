use super::models::{CkptModel, CkptRelationship, ModelResponse};
use rusqlite::{params, Connection, OptionalExtension, Result};

// Model operations
pub fn get_all_models(conn: &Connection) -> Result<Vec<ModelResponse>> {
    let mut stmt = conn.prepare(
        "SELECT 
            filename, display_name, model_type, file_size, checksum, source_path,
            exists_mac_hd, exists_stash, mac_display_order, lora_strength,
            created_at, updated_at
         FROM ckpt_models
         ORDER BY 
            CASE WHEN exists_mac_hd = 1 THEN mac_display_order END ASC NULLS LAST,
            filename ASC"
    )?;

    let models = stmt.query_map([], |row| {
        Ok(CkptModel {
            filename: row.get(0)?,
            display_name: row.get(1)?,
            model_type: row.get(2)?,
            file_size: row.get(3)?,
            checksum: row.get(4)?,
            source_path: row.get(5)?,
            exists_mac_hd: row.get(6)?,
            exists_stash: row.get(7)?,
            mac_display_order: row.get(8)?,
            lora_strength: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;

    Ok(models.into_iter().map(|model| {
        let is_on_mac = model.exists_mac_hd;
        ModelResponse { model, is_on_mac }
    }).collect())
}

pub fn get_model_by_filename(conn: &Connection, filename: &str) -> Result<Option<CkptModel>> {
    let mut stmt = conn.prepare(
        "SELECT 
            filename, display_name, model_type, file_size, checksum, source_path,
            exists_mac_hd, exists_stash, mac_display_order, lora_strength,
            created_at, updated_at
         FROM ckpt_models WHERE filename = ?1"
    )?;

    let model = stmt.query_row([filename], |row| {
        Ok(CkptModel {
            filename: row.get(0)?,
            display_name: row.get(1)?,
            model_type: row.get(2)?,
            file_size: row.get(3)?,
            checksum: row.get(4)?,
            source_path: row.get(5)?,
            exists_mac_hd: row.get(6)?,
            exists_stash: row.get(7)?,
            mac_display_order: row.get(8)?,
            lora_strength: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    }).optional()?;

    Ok(model)
}

pub fn insert_or_update_model(conn: &Connection, model: &CkptModel) -> Result<()> {
    conn.execute(
        "INSERT INTO ckpt_models (
            filename, display_name, model_type, file_size, checksum, source_path,
            exists_mac_hd, exists_stash, mac_display_order, lora_strength
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        ON CONFLICT(filename) DO UPDATE SET
            display_name = excluded.display_name,
            model_type = excluded.model_type,
            file_size = excluded.file_size,
            checksum = excluded.checksum,
            source_path = excluded.source_path,
            exists_mac_hd = excluded.exists_mac_hd,
            exists_stash = excluded.exists_stash,
            mac_display_order = excluded.mac_display_order,
            lora_strength = excluded.lora_strength,
            updated_at = CURRENT_TIMESTAMP",
        params![
            model.filename,
            model.display_name,
            model.model_type,
            model.file_size,
            model.checksum,
            model.source_path,
            model.exists_mac_hd,
            model.exists_stash,
            model.mac_display_order,
            model.lora_strength,
        ],
    )?;
    Ok(())
}

pub fn update_mac_hd_status(conn: &Connection, filename: &str, is_on_mac: bool, display_order: Option<i32>) -> Result<()> {
    conn.execute(
        "UPDATE ckpt_models 
         SET exists_mac_hd = ?1, 
             mac_display_order = ?2,
             updated_at = CURRENT_TIMESTAMP
         WHERE filename = ?3",
        params![is_on_mac, display_order, filename],
    )?;
    Ok(())
}

pub fn update_display_orders(conn: &Connection, orders: &[(String, i32)]) -> Result<()> {
    let tx = conn.unchecked_transaction()?;
    
    for (filename, order) in orders {
        tx.execute(
            "UPDATE ckpt_models 
             SET mac_display_order = ?1, updated_at = CURRENT_TIMESTAMP
             WHERE filename = ?2",
            params![order, filename],
        )?;
    }
    
    tx.commit()?;
    Ok(())
}

pub fn delete_model(conn: &Connection, filename: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM ckpt_models WHERE filename = ?1",
        params![filename],
    )?;
    Ok(())
}

#[allow(dead_code)]
pub fn update_model_display_name(conn: &Connection, filename: &str, display_name: &str) -> Result<()> {
    conn.execute(
        "UPDATE ckpt_models 
         SET display_name = ?1, updated_at = CURRENT_TIMESTAMP
         WHERE filename = ?2",
        params![display_name, filename],
    )?;
    Ok(())
}

#[allow(dead_code)]
pub fn update_lora_strength(conn: &Connection, filename: &str, strength: i32) -> Result<()> {
    conn.execute(
        "UPDATE ckpt_models 
         SET lora_strength = ?1, updated_at = CURRENT_TIMESTAMP
         WHERE filename = ?2",
        params![strength, filename],
    )?;
    Ok(())
}

// Config operations
pub fn get_config(conn: &Connection, key: &str) -> Result<Option<String>> {
    let value = conn
        .query_row(
            "SELECT value FROM config WHERE key = ?1",
            [key],
            |row| row.get(0),
        )
        .optional()?;
    Ok(value)
}

pub fn set_config(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO config (key, value, updated_at) 
         VALUES (?1, ?2, CURRENT_TIMESTAMP)",
        params![key, value],
    )?;
    Ok(())
}

// Relationship operations
pub fn add_relationship(conn: &Connection, parent: &str, child: &str) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO ckpt_x_ckpt (parent_ckpt_filename, child_ckpt_filename)
         VALUES (?1, ?2)",
        params![parent, child],
    )?;
    Ok(())
}

pub fn get_relationships(conn: &Connection, parent_filename: &str) -> Result<Vec<CkptRelationship>> {
    let mut stmt = conn.prepare(
        "SELECT id, parent_ckpt_filename, child_ckpt_filename, created_at
         FROM ckpt_x_ckpt
         WHERE parent_ckpt_filename = ?1"
    )?;

    let relationships = stmt.query_map([parent_filename], |row| {
        Ok(CkptRelationship {
            id: row.get(0)?,
            parent_ckpt_filename: row.get(1)?,
            child_ckpt_filename: row.get(2)?,
            created_at: row.get(3)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;

    Ok(relationships)
}

#[allow(dead_code)]
pub fn delete_relationship(conn: &Connection, parent: &str, child: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM ckpt_x_ckpt
         WHERE parent_ckpt_filename = ?1 AND child_ckpt_filename = ?2",
        params![parent, child],
    )?;
    Ok(())
}
