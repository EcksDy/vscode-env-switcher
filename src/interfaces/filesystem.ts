import { Uri, GlobPattern, CancellationToken } from 'vscode';
import { ReadStream } from 'fs';
import { Readable } from 'stream';

export interface IUint8Reader {
  readFileToUint8Array: (uri: Uri) => Promise<Uint8Array>;
}

export interface IStreamReader {
  streamFile: (uri: Uri) => ReadStream;
}

export interface IUint8Writer {
  writeFile: (uri: Uri, content: Uint8Array) => Promise<void>;
}

export interface IStreamFirstLineReader {
  readFirstLine: (stream: Readable) => Promise<string>;
}

export interface IFileFinder {
  findFiles: (
    include: GlobPattern,
    exclude?: GlobPattern | null,
    maxResults?: number,
    token?: CancellationToken,
  ) => Promise<Uri[]>;
}
