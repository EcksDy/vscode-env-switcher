import { EventEmitter, Uri } from 'vscode';
import { ITextSetter, IEventEmitter } from '../../interfaces';

export interface TargetEnvChangedData {
  tagInTarget: string | null;
  targetUri: Uri;
}

const targetEnvChangedEventEmitter = new EventEmitter<TargetEnvChangedData>();

interface RegisterTargetEnvChangedEventHandlerDeps {
  setter: ITextSetter;
}

export function register({
  setter,
}: RegisterTargetEnvChangedEventHandlerDeps): IEventEmitter<TargetEnvChangedData> {
  targetEnvChangedEventEmitter.event((data: TargetEnvChangedData) => {
    setter.setText(data.tagInTarget ?? undefined);
  });

  return targetEnvChangedEventEmitter;
}

export default targetEnvChangedEventEmitter as IEventEmitter<TargetEnvChangedData>;
