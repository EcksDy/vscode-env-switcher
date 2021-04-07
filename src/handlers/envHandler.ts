import { workspace, GlobPattern, ConfigurationChangeEvent, Uri } from 'vscode';
import globTypes from 'glob';
import glob from 'glob-promise';
import path from 'path';
import { TextEncoder } from 'util';
import { EXTENSION_PREFIX } from '../utilities/consts';
import concatFilesContent from '../utilities/bufferManipulations';
import { FileSystemHandler } from './fsHandler';
import { makeTag, extractTag } from '../utilities/stringManipulations';

const NODE_MODULES_GLOB = '**/node_modules/**';

/**
 * Will get the extension `presetsGlob` config from workspace settings, with global settings fallback.
 */
function getPresetsGlob() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('presetsGlob') as string;
}

interface EnvHandlerDeps {
  fsHandler: FileSystemHandler;
}

export class EnvHandler {
  private presetsGlob: GlobPattern;

  private fsHandler: FileSystemHandler;

  private globOptions: globTypes.IOptions;

  public readonly envDir: Uri;

  public readonly envFile: Uri;

  constructor(fsHandler: FileSystemHandler, envFile: Uri) {
    this.fsHandler = fsHandler;
    this.envDir = Uri.file(path.dirname(envFile.fsPath));
    this.envFile = envFile;
    this.presetsGlob = getPresetsGlob();

    this.globOptions = {
      matchBase: true,
      root: this.envDir.fsPath,
      nodir: true,
      ignore: NODE_MODULES_GLOB,
    };

    workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
      const shouldUpdatePresetsGlob = event.affectsConfiguration(`${EXTENSION_PREFIX}.presetsGlob`);

      if (!shouldUpdatePresetsGlob) return;

      this.presetsGlob = getPresetsGlob();
    });
  }

  /**
   * Performs necessary actions to instantiate a FileSystemHandler.
   */
  public static async build({ fsHandler }: EnvHandlerDeps) {
    const [firstEnvFile] = await fsHandler.findFiles('**/.env', NODE_MODULES_GLOB, 1);

    return new EnvHandler(fsHandler, firstEnvFile);
  }

  /**
   * Returns a Uri[] of `.env` files, using the configured preset glob.
   */
  public async getEnvPresetUris() {
    const envPresetUris = await workspace.findFiles(this.presetsGlob);

    return envPresetUris.filter(
      (uri) => path.basename(uri.fsPath) !== '.env' && path.extname(uri.fsPath) === '.env',
    );
  }

  /**
   * Sets the content of the main `.env` file with a tag of the selected preset.
   */
  public async setEnvContentWithTag(presetFileUri: Uri, presetName: string) {
    const presetEnvTag: Uint8Array = new TextEncoder().encode(makeTag(presetName));
    const presetFileContent: Uint8Array = await this.fsHandler.readFileToUint8Array(presetFileUri);

    const targetFileContent = concatFilesContent([presetEnvTag, presetFileContent]);
    this.fsHandler.writeFile(this.envFile, targetFileContent);
  }

  /**
   * Returns an array of `.env` files.
   */
  public async findEnvFiles(pattern: string, globOptions?: globTypes.IOptions) {
    const filePaths = await glob(pattern, globOptions || this.globOptions);

    return filePaths.map((file) => Uri.file(file));
  }

  /**
   * Returns the tag of the current `.env` file.
   * @throws `No tag found in .env` if file doesn't contain a tag.
   */
  public async getCurrentEnvFileTag() {
    const stream = this.fsHandler.streamFile(this.envFile);
    const envTag = await this.fsHandler.readFirstLine(stream);

    return extractTag(envTag);
  }
}
