import {
  Command,
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode';

class PresetItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command?: Command,
  ) {
    super(label, TreeItemCollapsibleState.None);

    this.tooltip = this.label;
  }

  iconPath = new ThemeIcon('gear');

  contextValue = 'preset';
}

class ProjectItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly children?: PresetItem[],
  ) {
    super(label, TreeItemCollapsibleState.Expanded);

    this.tooltip = this.label;
  }

  iconPath = new ThemeIcon('folder');

  contextValue = 'project';
}

export class PresetPanelProvider implements TreeDataProvider<ProjectItem> {
  private _onDidChangeTreeData: EventEmitter<ProjectItem | undefined | void> = new EventEmitter<
    ProjectItem | undefined | void
  >();
  readonly onDidChangeTreeData: Event<ProjectItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ProjectItem): TreeItem {
    return element;
  }

  getChildren(element?: ProjectItem): Thenable<ProjectItem[] | PresetItem[]> {
    if (!element) {
      return new Promise<ProjectItem[]>((resolve) => {
        resolve([
          new ProjectItem('Project 1', [
            new PresetItem('test1', TreeItemCollapsibleState.None),
            new PresetItem('test2', TreeItemCollapsibleState.None),
            new PresetItem('[ test3 ]', TreeItemCollapsibleState.None),
            new PresetItem('test4', TreeItemCollapsibleState.None),
          ]),
          new ProjectItem('Project 2', [
            new PresetItem('[ 1test ]', TreeItemCollapsibleState.None),
            new PresetItem('2test', TreeItemCollapsibleState.None),
            new PresetItem('3test', TreeItemCollapsibleState.None),
            new PresetItem('4test', TreeItemCollapsibleState.None),
          ]),
        ]);
      });
    }

    if (element.children)
      return new Promise((resolve) => {
        resolve(element.children!);
      });

    return new Promise((resolve) => {
      resolve([]);
    });
  }
}
