mod database;

use database::{Database, PasswordEntry};
use log::info;
use tauri::{Manager, State};

// ========== 密码管理命令 ==========

#[tauri::command]
fn get_all_passwords(db: State<Database>) -> Result<Vec<PasswordEntry>, String> {
    db.get_all_passwords().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_password(db: State<Database>, entry: PasswordEntry) -> Result<(), String> {
    db.add_password(&entry).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_password(db: State<Database>, entry: PasswordEntry) -> Result<(), String> {
    db.update_password(&entry).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_password(db: State<Database>, id: String) -> Result<(), String> {
    db.delete_password(&id).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            info!("应用启动中...");
            
            // 初始化数据库
            let db = Database::new(&app.handle())?;
            app.manage(db);
            
            info!("数据库初始化完成");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_passwords,
            add_password,
            update_password,
            delete_password,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
