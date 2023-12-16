import type { UiProject } from '../../../src/ui-components/interfaces';

const projectPath = 'path/to/project';
const projectPath2 = 'path/to/project2';

export function getProjects(): UiProject[] {
  return [
    {
      isLocked: false,
      path: projectPath,
      name: 'Project 1',
      isOpen: true,
      presets: [
        {
          name: 'preset 1',
          isSelected: true,
          path: 'path/to/project/preset1',
          projectPath,
        },
        {
          name: 'preset 2',
          isSelected: false,
          path: 'path/to/project/preset2',
          projectPath,
        },
      ],
    },
    {
      isLocked: false,
      path: 'path/to/project2',
      name: 'Project 2',
      isOpen: true,
      presets: [
        {
          name: 'preset 1',
          isSelected: true,
          path: 'path/to/project2/preset1',
          projectPath: projectPath2,
        },
        {
          name: 'preset 2',
          isSelected: false,
          path: 'path/to/project2/preset2',
          projectPath: projectPath2,
        },
      ],
    },
  ];
}
