import { ReadStream, WriteStream } from 'fs';

export interface ILocation {
  directory: string;
  object: string /* Either file or directory */;
}

export interface IRootDirLocator {
  readonly rootDir: ILocation;
}

/* EXTERNAL FS ABSTRACTIONS */
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
  findFiles: (
    include: string,
    exclude?: string | null,
    maxResults?: number,
  ) => Promise<ILocation[]>;
}
