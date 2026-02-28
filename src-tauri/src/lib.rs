mod database;

use database::{Database, PasswordEntry, CalendarEvent, Document};
use log::info;
use sysinfo::System;
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

// ========== 日历事件命令 ==========

#[tauri::command]
fn get_all_events(db: State<Database>) -> Result<Vec<CalendarEvent>, String> {
    db.get_all_events().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_event(db: State<Database>, event: CalendarEvent) -> Result<(), String> {
    db.add_event(&event).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_event(db: State<Database>, event: CalendarEvent) -> Result<(), String> {
    db.update_event(&event).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_event(db: State<Database>, id: String) -> Result<(), String> {
    db.delete_event(&id).map_err(|e| e.to_string())
}

// ========== 文档命令 ==========

#[tauri::command]
fn get_all_documents(db: State<Database>) -> Result<Vec<Document>, String> {
    db.get_all_documents().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_document(db: State<Database>, doc: Document) -> Result<(), String> {
    db.add_document(&doc).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_document(db: State<Database>, doc: Document) -> Result<(), String> {
    db.update_document(&doc).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_document(db: State<Database>, id: String) -> Result<(), String> {
    db.delete_document(&id).map_err(|e| e.to_string())
}

// ========== 设置命令 ==========

#[tauri::command]
fn get_setting(db: State<Database>, key: String) -> Result<Option<String>, String> {
    db.get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
fn set_setting(db: State<Database>, key: String, value: String) -> Result<(), String> {
    db.set_setting(&key, &value).map_err(|e| e.to_string())
}

// ========== 系统信息命令 ==========

#[derive(serde::Serialize)]
pub struct SystemInfo {
    os_name: String,
    os_version: String,
    kernel_version: String,
    hostname: String,
    cpu_name: String,
    cpu_cores: usize,
    total_memory: u64,
    used_memory: u64,
    total_disk: u64,
    used_disk: u64,
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    
    let os_name = System::name().unwrap_or_else(|| "Unknown".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "Unknown".to_string());
    let kernel_version = System::kernel_version().unwrap_or_else(|| "Unknown".to_string());
    let hostname = System::host_name().unwrap_or_else(|| "Unknown".to_string());
    
    let cpu_name = sys.cpus().first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    let cpu_cores = sys.cpus().len();
    
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();
    
    // 获取磁盘信息
    let mut total_disk: u64 = 0;
    let mut used_disk: u64 = 0;
    let disks = sysinfo::Disks::new_with_refreshed_list();
    for disk in disks.list() {
        total_disk += disk.total_space();
        used_disk += disk.available_space();
    }
    used_disk = total_disk.saturating_sub(used_disk);
    
    Ok(SystemInfo {
        os_name,
        os_version,
        kernel_version,
        hostname,
        cpu_name,
        cpu_cores,
        total_memory,
        used_memory,
        total_disk,
        used_disk,
    })
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
            get_all_events,
            add_event,
            update_event,
            delete_event,
            get_all_documents,
            add_document,
            update_document,
            delete_document,
            get_setting,
            set_setting,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
