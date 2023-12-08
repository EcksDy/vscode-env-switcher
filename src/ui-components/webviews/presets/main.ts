// import { type Preset, type PresetsViewData, type Project } from '../../interfaces';

//#region Duplicated interfaces from src/ui-components/interfaces.ts
// Until I figure out how to import and bundle them.

interface Project {
  id: string;
  locked: boolean;
  path: string; // absolute path
  name: string;
}

interface Preset {
  id: string;
  projectId: string;
  name: string;
  selected: boolean;
  path: string; // absolute path
}

interface PresetsViewData {
  multiSwitch: boolean;
  projects: Project[];
  presets: Preset[];
}

//#endregion

type Projects = Record<string, Project>;
type Presets = Record<string, Preset>;

(() => {
  interface State {
    multiSwitch: boolean;
    projects: Projects;
    presets: Presets;
  }
  const vscode = acquireVsCodeApi<State>();

  const oldState = vscode.getState() || { multiSwitch: false, projects: {}, presets: {} };

  let { projects, presets, multiSwitch } = oldState;

  const selected: Record<
    string,
    {
      id: string;
      element: HTMLLIElement;
    }
  > = {};
  const presetLists: Record<string, HTMLUListElement> = {};

  console.log(projects, multiSwitch);

  vscode.postMessage({
    action: 'init',
  });

  window.addEventListener('message', (event) => {
    console.log(event.data);
    const {
      action,
      value: { projects: projectsArr, presets: presetsArr, multiSwitch },
    } = event.data as { action: string; value: PresetsViewData };

    projects = Object.fromEntries(projectsArr.map((project) => [project.id, project]));
    presets = Object.fromEntries(presetsArr.map((preset) => [preset.id, preset]));

    // TODO: Loader (optional)
    switch (action) {
      case 'init': {
        vscode.setState({ projects, presets, multiSwitch });
        render(projects, presets);
        break;
      }
    }
  });

  function render(projects: Projects, presets: Presets) {
    const headLineBtnContainer = document.querySelector('.head-line > .inline-buttons-container')!;
    headLineBtnContainer.appendChild(multiTargetToggleBtn);
    headLineBtnContainer.appendChild(collapseAllBtn);
    const projectList = getProjectList();

    for (const key of Object.keys(projects)) {
      const project = projects[key];

      const projectContainer = createProjectContainer();
      const projectEntry = createProjectEntry(project);
      projectContainer.appendChild(projectEntry);
      projectList.appendChild(projectContainer);

      const presetList = createPresetList();
      projectContainer.appendChild(presetList);

      presetLists[key] = presetList;
    }

    for (const key of Object.keys(presets)) {
      const preset = presets[key];
      const presetEntry = createPresetEntry(preset);
      const presetList = presetLists[preset.projectId];
      presetList.appendChild(presetEntry);
    }
  }

  function createProjectEntry(project: Project) {
    const projectEntry = document.createElement('div');
    projectEntry.className = 'project-entry show-buttons-on-hover';
    projectEntry.id = project.id;

    const chevron = createInlineButton({
      icon: 'chevron-down',
      toggleIcon: 'chevron-right',
      onClick: (e) => {
        onProjectClicked(project, e.currentTarget.parentElement);
      },
    });
    projectEntry.appendChild(chevron);

    const text = document.createElement('span');
    text.className = 'list-item-name';
    text.textContent = project.name;
    projectEntry.appendChild(text);

    const inlineButtonContainer = document.createElement('div');
    inlineButtonContainer.className = 'inline-buttons-container';
    inlineButtonContainer.appendChild(
      createInlineButton({
        icon: 'lock-small',
        tooltip: `Multi switch won't affect this project`,
        onClick: (e) => {
          e.stopPropagation();
          e.currentTarget.classList.toggle('button-always-visible');
        },
      }),
    );
    projectEntry.appendChild(inlineButtonContainer);

    return projectEntry;
  }

  function createPresetEntry(preset: Preset) {
    const presetEntry = document.createElement('li');
    presetEntry.id = preset.id;
    presetEntry.className = 'preset-entry clickable';
    presetEntry.addEventListener('click', (e) => {
      onPresetClicked(preset, e.currentTarget);
    });

    const indentation = document.createElement('span');
    indentation.className = 'indentation';
    presetEntry.appendChild(indentation);

    const icon = createIcon({ icon: 'gear' });
    presetEntry.appendChild(icon);

    const text = document.createElement('span');
    text.className = 'list-item-name';
    text.textContent = preset.name;
    presetEntry.appendChild(text);

    return presetEntry;
  }

  function onPresetClicked(preset: Preset, element: EventTarget | null) {
    if (!isTheThing<HTMLLIElement>(element)) return;

    // TODO: Behaves differently based on `multiSwitch`
    const currentlySelected = selected[preset.projectId];
    if (preset.id === currentlySelected?.id) return;

    if (currentlySelected) currentlySelected.element.classList.toggle('selected-list-item');

    selected[preset.projectId] = { id: preset.id, element };
    element.classList.toggle('selected-list-item');

    // TODO: Add selectPresets action, pass `newPresets` as array of { projectId, presetId }
    vscode.postMessage({
      action: 'selectPreset',
      project: preset.projectId,
      newPreset: preset.path,
    });

    // TODO: `multiSwitch` will require checking if project is locked or not
    // TODO: Should lock prevent selecting a single preset or just multi switch?
  }

  function onProjectClicked(project: Project, element: EventTarget | null) {
    if (!isTheThing<HTMLDivElement>(element)) return;

    element.parentElement!.children[1].classList.toggle('hidden');
  }

  const multiTargetToggleBtn = createInlineButton({
    icon: 'multi-target',
    toggleClasses: ['toggled-inline-button'],
    tooltip: 'Multi switch mode',
    classes: ['custom-icon', 'icon-multi-target'],
    onClick: () => {
      multiSwitch = !multiSwitch;
      vscode.setState({ projects, presets, multiSwitch });

      // TODO: Decide if I want to keep multiSwitch logic in the webview or in the extension
      // vscode.postMessage({
      //   action: 'toggleMultiSwitch',
      //   value: multiSwitch,
      // });
    },
  });

  const collapseAllBtn = createInlineButton({
    icon: 'collapse-all',
    toggleIcon: 'expand-all',
    onClick: () => {
      const projectList = getProjectList();
      for (const projectEntry of projectList.children as any) {
        projectEntry.children[1].classList.toggle('hidden');
      }
    },
    tooltip: 'Collapse all projects',
  });
})();

/**
 * Hack for the weird shenenigans of the EventTarget type.
 */
function isTheThing<T>(_element: unknown): _element is T {
  return true;
}

type GenericOnClickHandler<T extends HTMLElement> = (
  this: T,
  ev: MouseEvent & {
    currentTarget: T;
  },
) => void;

type OnClickHandler = (this: HTMLElement, ev: MouseEvent) => void;

interface CreateInlineButtonParams {
  icon: string;
  onClick?: GenericOnClickHandler<HTMLSpanElement>;
  tooltip?: string;
  classes?: string[];
  toggleIcon?: string;
  toggleClasses?: string[];
}

function createInlineButton({
  icon,
  onClick,
  tooltip,
  classes,
  toggleIcon,
  toggleClasses,
}: CreateInlineButtonParams) {
  const btn = createIcon({ icon, classes: ['inline-button', 'clickable'] });
  const i = btn.children[0] as HTMLElement;

  if (tooltip) btn.title = tooltip;
  if (classes?.length) btn.classList.add(...classes);
  if (onClick)
    btn.addEventListener('click', (e) => {
      if (toggleIcon)
        [`codicon-${icon}`, `codicon-${toggleIcon}`].forEach((icon) => i.classList.toggle(icon));
      if (toggleClasses?.length)
        toggleClasses.forEach((cssClass) => btn.classList.toggle(cssClass));

      (onClick as OnClickHandler).bind(btn)(e);
    });

  return btn;
}

interface CreateIconParams {
  icon: string;
  classes?: string[];
}

function createIcon({ icon, classes }: CreateIconParams) {
  const span = document.createElement('span');
  span.className = ['icon', ...(classes ?? [])].join(' ');

  const i = document.createElement('i');
  i.className = `codicon codicon-${icon}`;
  span.appendChild(i);

  return span;
}

function getProjectList() {
  const projectList = document.querySelector('.project-list')!;
  return projectList;
}

function createPresetList() {
  const presetList = document.createElement('ul');
  presetList.className = 'preset-list';
  return presetList;
}

function createProjectContainer() {
  const projectContainer = document.createElement('li');
  projectContainer.className = 'project-container';
  return projectContainer;
}
