import shutil
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

DB_PATH = "banking.db"
BACKUP_DIR = "backups"

def backup_database():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        
    if not os.path.exists(DB_PATH):
        logger.warning(f"Database {DB_PATH} does not exist.")
        return False
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"banking_backup_{timestamp}.db")
    
    try:
        shutil.copy2(DB_PATH, backup_path)
        logger.info(f"Database backed up successfully to {backup_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to backup database: {e}")
        return False

def restore_database(backup_filename):
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    if not os.path.exists(backup_path):
        logger.error(f"Backup file {backup_path} does not exist.")
        return False
        
    try:
        shutil.copy2(backup_path, DB_PATH)
        logger.info(f"Database restored successfully from {backup_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to restore database: {e}")
        return False

if __name__ == "__main__":
    print("Testing backup and restore process...")
    
    if os.path.exists(DB_PATH):
        success = backup_database()
        print(f"Backup Status: {'Success' if success else 'Failed'}")
        
        # Test restore
        backups = os.listdir(BACKUP_DIR)
        if backups:
            latest_backup = sorted(backups)[-1]
            success = restore_database(latest_backup)
            print(f"Restore Status: {'Success' if success else 'Failed'}")
    else:
        print(f"Skipping test: {DB_PATH} not found.")
