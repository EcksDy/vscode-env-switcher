interface Config<Ui, Storage> {
  ui: Ui;
  storage: Storage;
}

export function getConfig<Ui, Storage>(ui: Ui, storage: Storage): Config<Ui, Storage> {
  return {
    ui,
    storage,
  };
}
