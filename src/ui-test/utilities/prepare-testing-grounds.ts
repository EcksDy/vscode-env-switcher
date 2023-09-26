import { mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';

const TESTING_GROUNDS_PATH = path.join(__dirname, '..', '..', '..', 'testing-grounds');

const NODE_MODULES_STRUCTURE = {
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

const FILE_STRUCTURES = {
  basic: {
    ...NODE_MODULES_STRUCTURE,
    '.env': 'NODE_ENV=local',
    'local.env': 'NODE_ENV=local',
    'prod.env': 'NODE_ENV=production',
  },
  'with-subdir': {
    ...NODE_MODULES_STRUCTURE,
    '.env': 'NODE_ENV=local',
    presets: {
      'local.env': 'NODE_ENV=local',
      'prod.env': 'NODE_ENV=production',
    },
  },
  'everything-in-subdir': {
    ...NODE_MODULES_STRUCTURE,
    presets: {
      '.env': 'NODE_ENV=local',
      'local.env': 'NODE_ENV=local',
      'prod.env': 'NODE_ENV=production',
    },
  },
  'basic-reversed-naming': {
    ...NODE_MODULES_STRUCTURE,
    '.env': 'NODE_ENV=local',
    '.env.local': 'NODE_ENV=local',
    '.env.prod': 'NODE_ENV=production',
  },
} as const;

const STRUCTURE_SETTINGS: Partial<Record<Structures, Record<string, string | boolean>>> = {
  'basic-reversed-naming': {
    'Env Switcher > Glob: Presets': '.env.*',
  },
} as const;

export type Structures = keyof typeof FILE_STRUCTURES;
type DirectoryOrContent =
  | string
  | {
      [key: string]: DirectoryOrContent;
    };

export const TEST_FILE_STRUCTURES = Object.keys(FILE_STRUCTURES) as Structures[];
export const IGNORED_DIRS_AND_FILES = ['node_modules', '.env'];

export function getStructureSettings(structureName: Structures) {
  return STRUCTURE_SETTINGS[structureName];
}

function findPresetNamesInStructure(acc: string[], structure: DirectoryOrContent) {
  const namesAndContents = Object.entries(structure);

  for (const [name, content] of namesAndContents) {
    if (IGNORED_DIRS_AND_FILES.includes(name)) continue;
    if (typeof content === 'string') {
      acc.push(name);
      continue;
    }

    findPresetNamesInStructure(acc, content);
  }
}

export function getExpectedPresetNames(structureName: Structures) {
  const structure = FILE_STRUCTURES[structureName];
  const presetNames: string[] = [];

  findPresetNamesInStructure(presetNames, structure);

  return presetNames;
}

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
  await resetTestingGrounds();
  await populateFileSystem(FILE_STRUCTURES[structure], TESTING_GROUNDS_PATH);

  return TESTING_GROUNDS_PATH;
}

export async function resetTestingGrounds() {
  await rm(TESTING_GROUNDS_PATH, { recursive: true, force: true });
  await mkdir(TESTING_GROUNDS_PATH);
}
