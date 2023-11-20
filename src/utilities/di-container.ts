import {
  InjectionToken,
  Provider,
  container,
  isClassProvider,
  isFactoryProvider,
  isTokenProvider,
  isValueProvider,
} from 'tsyringe';
import { FsPresetManager, TargetManager } from '../managers';
import { FileWatcher } from '../watchers';

container.register(FsPresetManager, { useClass: FsPresetManager });
container.register(TargetManager, { useClass: TargetManager });
container.register(FileWatcher, { useClass: FileWatcher });

export function registerInContainer<T>(...providers: [InjectionToken<T>, Provider<T>][]) {
  for (const [token, provider] of providers) {
    if (
      isClassProvider(provider) ||
      isTokenProvider(provider) ||
      isValueProvider(provider) ||
      isFactoryProvider(provider)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      container.register(token, provider as unknown as any);
    }
  }

  return container;
}
