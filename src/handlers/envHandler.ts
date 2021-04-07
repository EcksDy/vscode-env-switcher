import { workspace, GlobPattern, ConfigurationChangeEvent, Uri } from 'vscode';
import path from 'path';
import { TextEncoder } from 'util';
import { EXTENSION_PREFIX } from '../utilities/consts';
import concatFilesContent from '../utilities/bufferManipulations';
import { makeTag, extractTag } from '../utilities/stringManipulations';
import {
  IUint8Reader,
  IFileFinder,
  IStreamFirstLineReader,
  IStreamReader,
  IUint8Writer,
  IEnvPresetFinder,
  IEnvContentWithTagWriter,
  IEnvTagReader,
  IEnvLocator,
} from '../interfaces';

const NODE_MODULES_GLOB = '**/node_modules/**';

/**
 * Will get the extension `presetsGlob` config from workspace settings, with global settings fallback.
 */
function getPresetsGlob() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('presetsGlob') as string;
}

interface IFileSystemHandler
  extends IFileFinder,
    IUint8Reader,
    IStreamReader,
    IStreamFirstLineReader,
    IUint8Writer {}

interface EnvHandlerDeps {
  fsHandler: IFileSystemHandler;
}

export class EnvHandler
  implements IEnvLocator, IEnvPresetFinder, IEnvContentWithTagWriter, IEnvTagReader {
  private presetsGlob: GlobPattern;

  private fsHandler: IFileSystemHandler;

  public readonly envDir: Uri;

  public readonly envFile: Uri;

  constructor(fsHandler: IFileSystemHandler, envFile: Uri) {
    this.fsHandler = fsHandler;
    this.envDir = Uri.file(path.dirname(envFile.fsPath));
    this.envFile = envFile;
    this.presetsGlob = getPresetsGlob();

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
    const envPresetUris = await this.fsHandler.findFiles(this.presetsGlob, NODE_MODULES_GLOB);

    return envPresetUris.filter(
      (uri) => path.basename(uri.fsPath) !== '.env' && path.extname(uri.fsPath) === '.env',
    );
  }

  /**
   * Sets the content of the main `.env` file, to the content of the provided file, with a tag.
   */
  public async setEnvContentWithTag(sourceFileUri: Uri, tagText: string) {
    const tag: Uint8Array = new TextEncoder().encode(makeTag(tagText));
    const sourceFileContent: Uint8Array = await this.fsHandler.readFileToUint8Array(sourceFileUri);

    const targetFileContent = concatFilesContent([tag, sourceFileContent]);
    this.fsHandler.writeFile(this.envFile, targetFileContent);
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
