import { commands, Disposable } from 'vscode';
import selectEnvPreset from '../command-implementations/select-env-preset';
import { SELECT_ENV_COMMAND_ID } from '../utilities/consts';
import FileSystemHandler from './file-system-handler';

export default class CommandsHandler {
  private fsHandler: FileSystemHandler;

  private registeredCommands: Disposable[] = [];

  constructor(fsHandler: FileSystemHandler) {
    this.fsHandler = fsHandler;

    this.registerCommand(SELECT_ENV_COMMAND_ID, () => selectEnvPreset(this.fsHandler));
  }

  public getRegisteredCommands = () => this.registeredCommands;

  private registerCommand(commandId: string, commandCallback: (...args: unknown[]) => unknown) {
    const command = commands.registerCommand(commandId, commandCallback);

    this.registeredCommands.push(command);
  }
}
