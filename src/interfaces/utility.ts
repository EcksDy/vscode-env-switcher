import { Disposable } from 'vscode';

export interface IEventEmitter<T> extends Disposable {
  fire: (data: T) => void;
}
