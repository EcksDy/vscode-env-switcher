import { QuickPickItem, commands, window, Disposable } from 'vscode';
import path from 'path';
import FileSystemHandler from './fsHandler';
import { SELECT_ENV_COMMAND_ID } from '../utilities/consts';
import { makeHeaderLine } from '../utilities/stringManipulations';
import { selectedEnvPresetEventEmitter, SelectedEnvPresetEventData } from '../utilities/events';

export interface EnvPresetQuickPickItem extends SelectedEnvPresetEventData, QuickPickItem {}

export default class CommandsHandler {
  private fsHandler: FileSystemHandler;

  private registeredCommands: Disposable[];

  constructor(fsHandler: FileSystemHandler) {
    this.fsHandler = fsHandler;
    this.registeredCommands = [];

    this.registerCommand(SELECT_ENV_COMMAND_ID, this.selectEnvPreset);
  }

  public getRegisteredCommands = () => this.registeredCommands;

  private selectEnvPreset = async () => {
    const envFiles = await this.fsHandler.getEnvFilesInEnvDir();

    const envFileQuickPickList = envFiles.map((filePath) => {
      const fileName = path.basename(filePath.fsPath, path.extname(filePath.fsPath));
      const fileNameFull = path.basename(filePath.fsPath);
      const label = `${fileName.charAt(0).toUpperCase()}${fileName.slice(1)}`;
      const description = `${path.relative(this.fsHandler.rootDir.fsPath, filePath.fsPath)}`;

      const envFileQuickPick: EnvPresetQuickPickItem = {
        description,
        label,
        fileName,
        fileNameFull,
        filePath,
      };

      return envFileQuickPick;
    });

    const selectedEnv = await window.showQuickPick(envFileQuickPickList);

    if (selectedEnv === undefined) {
      return;
    }

    const setCurrentEnvHeader = makeHeaderLine(selectedEnv.fileNameFull);
    const headerBuffer = Buffer.from(setCurrentEnvHeader);
    const selectedFileContent = this.fsHandler.readFile(selectedEnv.filePath);

    this.fsHandler.writeFile(
      this.fsHandler.envFile,
      Buffer.concat([headerBuffer, selectedFileContent]),
    );

    selectedEnvPresetEventEmitter.fire(selectedEnv);
  };

  private registerCommand(commandId: string, commandCallback: (...args: unknown[]) => unknown) {
    const command = commands.registerCommand(commandId, commandCallback);

    this.registeredCommands.push(command);
  }
}
