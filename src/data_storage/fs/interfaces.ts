import { ReadStream, WriteStream } from 'fs';
import { Disposable } from 'vscode';

export interface IRootDirLocator {
  readonly rootDir: string;
}

export interface IUint8Reader {
  readFileUint8: (path: string) => Promise<Uint8Array>;
}

export interface IUint8Writer {
  writeFileUint8: (path: string, content: Uint8Array) => Promise<void>;
}

export interface IStreamReader {
  streamReadFile: (path: string) => ReadStream;
}

export interface IStreamWriter {
  streamWriteFile: (path: string) => WriteStream;
}

export interface IFileFinder {
  findFiles: (include: string, exclude?: string | null, maxResults?: number) => Promise<string[]>;
  fileExists: (path: string) => boolean;
}

export interface FileSystemHelper
  extends IRootDirLocator,
    IUint8Reader,
    IUint8Writer,
    IStreamReader,
    IStreamWriter,
    IFileFinder {}

export interface IEventEmitter<Data> extends Disposable {
  fire: (data: Data) => void;
}

export interface IEventListener<Data> {
  (onEvent: (data: Data) => void): void;
}
