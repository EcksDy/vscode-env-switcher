import App from './App.svelte';
import { getPresets, getProjects } from './utilities/mocks';
import { vscode } from './utilities/vscode';

vscode.setState({
  action: 'init',
  values: {
    projects: getProjects(),
    presets: getPresets(),
  },
});

const app = new App({
  target: document.body,
});

export default app;
