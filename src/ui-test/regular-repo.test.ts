import { expect } from 'chai';
import {
  InputBox,
  StatusBar,
  VSBrowser,
  WebElement,
  Workbench,
  before,
} from 'vscode-extension-tester';
import {
  Structures,
  TEST_FILE_STRUCTURES,
  generateTestingGrounds,
  getExpectedPresetNames,
  getStructureSettings,
  resetTestingGrounds,
} from './utilities/prepare-testing-grounds';
import forEach from 'mocha-each';

const DEFAULT_BUTTON_TEXT = 'Select preset';

describe('regular repo setup', () => {
  before(async () => {
    await VSBrowser.instance.waitForWorkbench();
  });

  forEach(TEST_FILE_STRUCTURES).describe('%s structure', (structure: Structures) => {
    let envSwitcherButton: WebElement;
    let expectedPresetNames: string[];

    before(async () => {
      const testingGroundsPath = await generateTestingGrounds(structure);
      expectedPresetNames = getExpectedPresetNames(structure);
      const settings = getStructureSettings(structure);
      if (settings) {
        const settingsEditor = await new Workbench().openSettings();
        for await (const [settingStr, value] of Object.entries(settings)) {
          const { title, categories } = splitStringToTitleAndCategories(settingStr);
          const setting = await settingsEditor.findSetting(title, ...categories);
          await setting.setValue(value);
        }
      }

      await VSBrowser.instance.openResources(testingGroundsPath);

      const statusBar = new StatusBar();
      envSwitcherButton = await VSBrowser.instance.driver.wait(async () => {
        return (await statusBar.getItem(DEFAULT_BUTTON_TEXT))!;
      }, 5_000);
    });

    after(async () => {
      await resetTestingGrounds();
    });

    it('should suggest the expected presets', async () => {
      await envSwitcherButton.click();

      const presetSelect = await InputBox.create();
      const availablePresets = await presetSelect.getQuickPicks();

      const presetNames = await Promise.all(
        availablePresets.map(async (preset) => (await preset.getLabel()).toLowerCase()),
      );

      expect(presetNames).to.have.members(expectedPresetNames);
    });
  });
});

function splitStringToTitleAndCategories(key: string): { title: string; categories: string[] } {
  const [categoriesStr, title] = key.split(': ');
  const categories = categoriesStr.split(' > ');
  return { title, categories };
}
