// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { multiSwitch: false, projects: [] };

  let { projects, multiSwitch } = oldState;

  const selected = {};

  console.log(projects, multiSwitch);

  render(projects);

  window.addEventListener('message', (event) => {
    console.log(event.data);
    const {
      action,
      value: { projects, multiSwitch },
    } = event.data;
    switch (action) {
      case 'init': {
        vscode.setState({ projects, multiSwitch });
        render(projects);
        break;
      }
    }
  });

  function render(projects) {
    const headLine = document.querySelector('.head-line');
    headLine.appendChild(
      createInlineButton(
        'multi-target',
        (e) => {
          e.currentTarget.classList.toggle('active');
          multiSwitch = !multiSwitch;
          vscode.setState({ projects, multiSwitch });
          vscode.postMessage({
            action: 'toggleMultiSwitch',
            value: multiSwitch,
          });
        },
        'Multi switch mode',
      ),
    );
    const projectList = getProjectList();

    for (const project of projects) {
      if (project.visible !== false) project.visible = true;

      const projectContainer = createProjectContainer(project);
      const projectEntry = createProjectEntry(project);
      projectContainer.appendChild(projectEntry);

      if (!project.presets.length) continue;

      const presetList = createPresetList();

      for (const preset of project.presets) {
        preset.project = project.id;
        const presetEntry = createPresetEntry(preset);
        presetList.appendChild(presetEntry);
      }

      projectContainer.appendChild(presetList);
      projectList.appendChild(projectContainer);
    }
  }

  function getProjectList() {
    const projectList = document.querySelector('.project-list');
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

  function createProjectEntry(project) {
    const projectEntry = document.createElement('div');
    projectEntry.className = 'project-entry clickable';
    projectEntry.id = project.id;
    projectEntry.addEventListener('click', (e) => {
      onProjectClicked(project, e.currentTarget);
    });

    const i = document.createElement('i');
    i.className = `codicon codicon-folder`;
    projectEntry.appendChild(i);

    const text = document.createElement('span');
    text.textContent = project.name;
    projectEntry.appendChild(text);

    return projectEntry;
  }

  function createPresetEntry(preset) {
    const presetEntry = document.createElement('li');
    presetEntry.id = preset.id;
    presetEntry.className = 'preset-entry clickable';
    presetEntry.addEventListener('click', (e) => {
      onPresetClicked(preset, e.currentTarget);
    });

    const indentation = document.createElement('span');
    indentation.className = 'indentation';
    presetEntry.appendChild(indentation);

    const i = document.createElement('i');
    i.className = `codicon codicon-gear`;
    presetEntry.appendChild(i);

    const text = document.createElement('span');
    text.textContent = preset.name;
    presetEntry.appendChild(text);

    return presetEntry;
  }

  function onPresetClicked(preset, element) {
    console.log(preset, selected);
    const currentlySelected = selected[preset.project];
    if (preset.id === currentlySelected?.id) return;

    selected[preset.project] = { id: preset.id, element };
    element.classList.toggle('selected');

    vscode.postMessage({
      action: 'selectPreset',
      project: preset.project,
      newPreset: preset.path,
    });
  }

  function onProjectClicked(project, element) {
    element.parentElement.children[1].style.display = project.visible ? 'none' : 'block';
    project.visible = !project.visible;
  }

  function createInlineButton(icon, onClick, tooltip) {
    const span = document.createElement('span');
    span.className = 'inline-button clickable';
    span.title = tooltip;
    if (onClick) span.addEventListener('click', onClick);

    const i = document.createElement('i');
    i.className = `codicon codicon-${icon}`;
    span.appendChild(i);

    return span;
  }
})();
