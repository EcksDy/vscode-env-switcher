import { mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';

const nodeModulesStructure = {
  node_modules: {
    'basic-package': {
      '.env': 'NODE_ENV=production',
    },
    'multiple-env-package': {
      '.env': 'NODE_ENV=DEFAULT',
      'local.env': 'NODE_ENV=local',
      'prod.env': 'NODE_ENV=production',
    },
    'no-env-package': {
      'some-file': 'some-content',
    },
    'env-in-subdir-package': {
      presets: {
        '.env.local': 'NODE_ENV=local',
        '.env.staging': 'NODE_ENV=staging',
        '.env.production': 'NODE_ENV=production',
      },
      '.env': 'NODE_ENV=local',
    },
    'env-only-in-subdir-package': {
      presets: {
        '.staging.env': 'NODE_ENV=staging',
        '.env.production': 'NODE_ENV=production',
      },
    },
  },
} as const;

const fileStructures = {
  basic: {
    ...nodeModulesStructure,
    '.env': 'NODE_ENV=local',
    'local.env': 'NODE_ENV=local',
    'prod.env': 'NODE_ENV=production',
  },
  'with-subdir': {
    ...nodeModulesStructure,
    '.env': 'NODE_ENV=local',
    presets: {
      'local.env': 'NODE_ENV=local',
      'prod.env': 'NODE_ENV=production',
    },
  },
  'everything-in-subdir': {
    ...nodeModulesStructure,
    presets: {
      '.env': 'NODE_ENV=local',
      'local.env': 'NODE_ENV=local',
      'prod.env': 'NODE_ENV=production',
    },
  },
  'basic-reversed-naming': {
    ...nodeModulesStructure,
    '.env': 'NODE_ENV=local',
    '.env.local': 'NODE_ENV=local',
    '.env.prod': 'NODE_ENV=production',
  },
} as const;

type Structures = keyof typeof fileStructures;
type DirectoryOrContent = string | { [key: string]: DirectoryOrContent };

export const TEST_FILE_STRUCTURES = Object.keys(fileStructures) as Structures[];

async function populateFileSystem(structure: Record<string, DirectoryOrContent>, currentPath = '') {
  const namesAndContents = Object.entries(structure);

  for (const [name, content] of namesAndContents) {
    if (typeof content === 'string') {
      await writeFile(path.join(currentPath, name), content);
      continue;
    }

    await mkdir(path.join(currentPath, name), { recursive: true });
    await populateFileSystem(content, path.join(currentPath, name));
  }
}

export async function generateTestingGrounds(structure: Structures): Promise<string> {
  const startPath = path.join(__dirname, '..', '..', '..', 'testing-grounds');
  // await rm(startPath, { recursive: true, force: true });

  await populateFileSystem(fileStructures[structure], startPath);

  return startPath;
}
