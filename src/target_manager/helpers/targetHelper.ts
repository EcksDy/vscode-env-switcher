import fsHelper from '../../utilities/fsHelper';

const NODE_MODULES_GLOB = '**/node_modules/**';

export async function getContent(path: string): Promise<Uint8Array | null> {
  if (!fsHelper.exists(path)) return null;
  return await fsHelper.readFile(path);
}

export async function getPath(glob: string): Promise<string | null> {
  const paths = await fsHelper.findFiles(glob, NODE_MODULES_GLOB, 1);

  return paths[0] ?? null;
}

export async function setContent(path: string, content: string | Uint8Array): Promise<void> {
  await fsHelper.writeFile(path, content);
}
