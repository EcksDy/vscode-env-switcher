import type { Preset, Project } from '../../../src/ui-components/interfaces';

function getHash(str: string) {
  return self.crypto.randomUUID();
}

const projectId = getHash('path/to/project');
const projectId2 = getHash('path/to/project2');

export function getProjects(): Project[] {
  return [
    {
      id: projectId,
      locked: false,
      path: 'path/to/project',
      name: 'Project 1',
      open: true,
    },
    {
      id: projectId2,
      locked: false,
      path: 'path/to/project2',
      name: 'Project 2',
      open: true,
    },
  ];
}

export function getPresets(): Preset[] {
  return [
    {
      id: getHash('path/to/project/preset1'),
      name: 'preset 1',
      selected: true,
      path: 'path/to/project/preset1',
      projectId,
    },
    {
      id: getHash('path/to/project/preset2'),
      name: 'preset 2',
      selected: false,
      path: 'path/to/project/preset2',
      projectId,
    },
    {
      id: getHash('path/to/project2/preset1'),
      name: 'preset 1',
      selected: true,
      path: 'path/to/project2/preset1',
      projectId: projectId2,
    },
    {
      id: getHash('path/to/project2/preset2'),
      name: 'preset 2',
      selected: false,
      path: 'path/to/project2/preset2',
      projectId: projectId2,
    },
  ];
}
