import { IStorage } from '../data_storage';

interface IContentProvider {
  getContent: (preset: IPreset) => string;
}

interface ContentProviderDeps {
  storage: IStorage;
}

function getContentProvider({ storage }: ContentProviderDeps): IContentProvider {
  function getContent(preset: IPreset) {}
  return { getContent };
}
