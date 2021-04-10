import { workspace, Uri, ConfigurationChangeEvent } from 'vscode';
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
  IRootDirLocator,
} from '../interfaces';
import { envTargetChangedEventEmitter, EnvTargetChangedData } from '../utilities/events';

const NODE_MODULES_GLOB = '**/node_modules/**';
const TARGET_ENV_GLOB_DEFAULT = '**/.env';

/**
 * Will get the extension `glob.presets` config from workspace settings, with global settings fallback.
 */
function getPresetsGlobConfig() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('glob.presets') as string;
}

/**
 * Will get the extension `glob.targetEnv` config from workspace settings, with global settings fallback.
 * If none defined - will use `TARGET_ENV_GLOB_DEFAULT`
 */
function getTargetEnvGlobConfig() {
  const config = workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('glob.targetEnv') as string;
  return config !== '' ? config : TARGET_ENV_GLOB_DEFAULT;
}

function getOnlyEnvGlob(glob: string) {
  if (glob.length < 4) return TARGET_ENV_GLOB_DEFAULT;
  const includesOnlyEnvFile = glob.slice(glob.length - 4).toLowerCase() === '.env';
  if (!includesOnlyEnvFile) {
    return `${glob}.env`;
  }
  return glob;
}

interface IFileSystemHandler
  extends IRootDirLocator,
    IFileFinder,
    IUint8Reader,
    IStreamReader,
    IStreamFirstLineReader,
    IUint8Writer {}

interface EnvHandlerDeps {
  fsHandler: IFileSystemHandler;
}

export class EnvHandler
  implements IEnvLocator, IEnvPresetFinder, IEnvContentWithTagWriter, IEnvTagReader {
  private fsHandler: IFileSystemHandler;

  private _targetEnvDir: Uri;

  public get targetEnvDir(): Uri {
    return this._targetEnvDir;
  }

  private _targetEnvFile: Uri;

  public get targetEnvFile(): Uri {
    return this._targetEnvFile;
  }

  constructor(fsHandler: IFileSystemHandler, targetEnvFile: Uri) {
    this.fsHandler = fsHandler;
    this._targetEnvDir = Uri.file(path.dirname(targetEnvFile.fsPath));
    this._targetEnvFile = targetEnvFile;

    workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
      const shouldUpdateTargetEnv = event.affectsConfiguration(
        `${EXTENSION_PREFIX}.glob.targetEnv`,
      );

      if (!shouldUpdateTargetEnv) return;
      const [newTargetEnvFile] = await fsHandler.findFiles(
        getOnlyEnvGlob(getTargetEnvGlobConfig()),
        NODE_MODULES_GLOB,
        1,
      );

      if (newTargetEnvFile === undefined) {
        return;
      }

      this._targetEnvDir = Uri.file(path.dirname(newTargetEnvFile.fsPath));
      this._targetEnvFile = newTargetEnvFile;

      const tagInTarget = await this.getCurrentEnvFileTag().catch(() => null);
      const envTargetData: EnvTargetChangedData = {
        tagInTarget,
        targetUri: this._targetEnvFile,
      };
      envTargetChangedEventEmitter.fire(envTargetData);
    });
  }

  /**
   * Performs necessary actions to instantiate a FileSystemHandler.
   * @throws If no target `.env` found.
   */
  public static async build({ fsHandler }: EnvHandlerDeps) {
    const [targetEnvFile] = await fsHandler.findFiles(
      getOnlyEnvGlob(getTargetEnvGlobConfig()),
      NODE_MODULES_GLOB,
      1,
    );

    if (targetEnvFile === undefined) {
      throw new Error(
        [
          'No target .env file found',
          'check the filesystem and "Env Switcher › Glob: Target Env" configuration',
        ].join(', '),
      );
    }

    return new EnvHandler(fsHandler, targetEnvFile);
  }

  /**
   * Returns a Uri[] of `.env` files, using the configured preset glob.
   */
  public async getEnvPresetUris() {
    const envPresetUris = await this.fsHandler.findFiles(
      getOnlyEnvGlob(getPresetsGlobConfig()),
      NODE_MODULES_GLOB,
    );

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
    this.fsHandler.writeFile(this.targetEnvFile, targetFileContent);
  }

  /**
   * Returns the tag of the current `.env` file.
   * @throws If file doesn't contain a tag.
   */
  public async getCurrentEnvFileTag() {
    const stream = this.fsHandler.streamFile(this.targetEnvFile);
    const envTag = await this.fsHandler.readFirstLine(stream);

    return extractTag(envTag);
  }
}
