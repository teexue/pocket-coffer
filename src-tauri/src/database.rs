use rusqlite::{Connection, Result, params};
use std::sync::Mutex;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use log::info;
use serde::{Deserialize, Serialize};

pub struct Database {
    pub conn: Mutex<Connection>,
}

// 密码条目结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordEntry {
    pub id: String,
    pub title: String,
    pub username: String,
    pub password: String,
    pub website: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// 日历事件结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalendarEvent {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: String,
    pub end_date: String,
    pub location: Option<String>,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let app_dir = app_handle.path().app_data_dir()?;
        std::fs::create_dir_all(&app_dir)?;
        
        let db_path: PathBuf = app_dir.join("pocket_coffer.db");
        info!("数据库路径: {:?}", db_path);
        
        let conn = Connection::open(&db_path)?;
        
        let db = Database {
            conn: Mutex::new(conn),
        };
        
        db.init_tables()?;
        
        Ok(db)
    }
    
    fn init_tables(&self) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        
        // 密码表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS passwords (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                website TEXT,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;
        
        // 日历事件表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                location TEXT,
                color TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;
        
        // 文档表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;
        
        // 设置表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;
        
        info!("数据表初始化完成");
        Ok(())
    }
    
    // ========== 密码管理 CRUD ==========
    
    pub fn get_all_passwords(&self) -> Result<Vec<PasswordEntry>, Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare(
            "SELECT id, title, username, password, website, notes, created_at, updated_at FROM passwords ORDER BY updated_at DESC"
        )?;
        
        let passwords = stmt.query_map([], |row| {
            Ok(PasswordEntry {
                id: row.get(0)?,
                title: row.get(1)?,
                username: row.get(2)?,
                password: row.get(3)?,
                website: row.get(4)?,
                notes: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;
        
        Ok(passwords)
    }
    
    pub fn add_password(&self, entry: &PasswordEntry) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO passwords (id, title, username, password, website, notes, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                entry.id,
                entry.title,
                entry.username,
                entry.password,
                entry.website,
                entry.notes,
                entry.created_at,
                entry.updated_at,
            ],
        )?;
        Ok(())
    }
    
    pub fn update_password(&self, entry: &PasswordEntry) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE passwords SET title = ?1, username = ?2, password = ?3, website = ?4, notes = ?5, updated_at = ?6 WHERE id = ?7",
            params![
                entry.title,
                entry.username,
                entry.password,
                entry.website,
                entry.notes,
                entry.updated_at,
                entry.id,
            ],
        )?;
        Ok(())
    }
    
    pub fn delete_password(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM passwords WHERE id = ?1", params![id])?;
        Ok(())
    }
    
    // ========== 日历事件 CRUD ==========
    
    pub fn get_all_events(&self) -> Result<Vec<CalendarEvent>, Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare(
            "SELECT id, title, description, start_date, end_date, location, color, created_at, updated_at FROM events ORDER BY start_date ASC"
        )?;
        
        let events = stmt.query_map([], |row| {
            Ok(CalendarEvent {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                location: row.get(5)?,
                color: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;
        
        Ok(events)
    }
    
    pub fn add_event(&self, event: &CalendarEvent) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO events (id, title, description, start_date, end_date, location, color, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                event.id,
                event.title,
                event.description,
                event.start_date,
                event.end_date,
                event.location,
                event.color,
                event.created_at,
                event.updated_at,
            ],
        )?;
        Ok(())
    }
    
    pub fn update_event(&self, event: &CalendarEvent) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE events SET title = ?1, description = ?2, start_date = ?3, end_date = ?4, location = ?5, color = ?6, updated_at = ?7 WHERE id = ?8",
            params![
                event.title,
                event.description,
                event.start_date,
                event.end_date,
                event.location,
                event.color,
                event.updated_at,
                event.id,
            ],
        )?;
        Ok(())
    }
    
    pub fn delete_event(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM events WHERE id = ?1", params![id])?;
        Ok(())
    }
}
