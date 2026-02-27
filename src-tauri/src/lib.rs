mod database;

use database::Database;
use log::info;
use tauri::Manager;

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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
