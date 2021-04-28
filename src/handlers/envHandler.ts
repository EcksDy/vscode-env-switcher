import { workspace, Uri } from 'vscode';
import path from 'path';
import { TextEncoder } from 'util';
import { EXTENSION_PREFIX } from '../user_interfaces/vs_code/utilities/consts';
import concatFilesContent from '../dal/fs_storage/utilities/bufferManipulations';
import { makeTag, extractTag } from '../dal/fs_storage/utilities/stringManipulations';
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
  ILocation,
} from '../interfaces';
import { registerTargetEnvConfigWatcher } from '../user_interfaces/vs_code/watchers';
import { TargetEnvChanged } from './events';
import { TargetEnvChangedData, TargetEnvChangedData } from './events/targetEnvChangedEventHandler';

const NODE_MODULES_GLOB = '**/node_modules/**';
const TARGET_ENV_GLOB_DEFAULT = '**/.env';

function getOnlyEnvGlob(glob: string) {
  if (glob.length < 4) return TARGET_ENV_GLOB_DEFAULT;
  const includesOnlyEnvFile = glob.slice(glob.length - 4).toLowerCase() === '.env';
  if (!includesOnlyEnvFile) {
    return `${glob}.env`;
  }
  return glob;
}

function getTargetEnvGlobConfig() {
  return config !== '' ? config : TARGET_ENV_GLOB_DEFAULT;
}

async function onTargetEnvConfigChange(this: EnvHandler) {
  const [newTargetEnvFile] = await this.fsHandler.findFiles(
    getOnlyEnvGlob(getTargetEnvGlobConfig()),
    NODE_MODULES_GLOB,
    1,
  );

  if (newTargetEnvFile === undefined) {
    return;
  }

  this.setTargetEnvDir(Uri.file(path.dirname(newTargetEnvFile.fsPath)));
  this.setTargetEnvFile(newTargetEnvFile);

  const tagInTarget = await this.getCurrentEnvFileTag().catch(() => null);
  const targetEnvData: TargetEnvChangedData = {
    tagInTarget,
    targetUri: this.targetEnvFile,
  };
  TargetEnvChanged.default.fire(targetEnvData);
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
  protected fsHandler: IFileSystemHandler;

  public _targetEnvFile: ILocation;

  public get targetEnvFile(): ILocation {
    return this._targetEnvFile;
  }

  public set targetEnvFile(v: ILocation) {
    this._targetEnvFile = v;
  }

  constructor(fsHandler: IFileSystemHandler, targetEnvFile: Uri) {
    this.fsHandler = fsHandler;
    this.targetEnvFile = Uri.file(path.dirname(targetEnvFile.fsPath));
    this.targetEnvFile = targetEnvFile;

    registerTargetEnvConfigWatcher({ onChange: onTargetEnvConfigChange.bind(this) });
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
