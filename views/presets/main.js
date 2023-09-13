// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { multiSwitch: false, projects: [] };

  let { projects, multiSwitch } = oldState;

  console.log(projects, multiSwitch, oldState);

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
    headLine.appendChild(createInlineButton('target'));
    const projectList = getProjectList();

    for (const project of projects) {
      if (project.visible !== false) project.visible = true;

      const projectContainer = createProjectContainer(project);
      const projectEntry = createProjectEntry(project);
      projectContainer.appendChild(projectEntry);

      if (!project.presets.length) continue;

      const presetList = createPresetList();

      for (const preset of project.presets) {
        preset.project = project.path;
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
    projectEntry.id = project.path;
    projectEntry.addEventListener('click', onProjectClicked);

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
    presetEntry.className = 'preset-entry clickable';
    presetEntry.addEventListener('click', () => {
      onProjectClicked(preset.value);
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

  function onPresetClicked(preset) {
    vscode.postMessage({
      action: 'selectPreset',
      project: preset.project,
      newPreset: preset.path,
    });
  }

  function onProjectClicked(e) {
    if (!e || !e.target || !e.target.parentElement || !e.target.parentElement.children) return;

    const { target } = e;

    const project = projects.find((p) => p.path === target.id);
    if (!project) return;

    target.parentElement.children[1].style.display = project.visible ? 'none' : 'block';
    project.visible = !project.visible;
  }

  function createInlineButton(icon, onClick) {
    const span = document.createElement('span');
    span.className = 'inline-button clickable';
    if (onClick) span.addEventListener('click', onClick);

    const i = document.createElement('i');
    i.className = `codicon codicon-${icon}`;
    span.appendChild(i);

    return span;
  }
})();
