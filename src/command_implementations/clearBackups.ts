import BackupHandler from '../handlers/backupHandler';

const clearAllBackups = async (backupHandler: BackupHandler) => {
  await backupHandler.clearAllBackups();
};

const clearWorkspaceBackups = async (backupHandler: BackupHandler) => {
  await backupHandler.clearWorkspaceBackups();
};

export { clearAllBackups, clearWorkspaceBackups };
