import { expect } from 'chai';
import { InputBox, StatusBar, VSBrowser } from 'vscode-extension-tester';
// import { generateTestingGrounds } from './utilities/prepare-testing-grounds';

console.log(`LOADED TESTS`);
describe('Example status bar tests', () => {
  let statusBar: StatusBar;

  before(() => {
    console.log(`STARTING TESTS`);
    // const testingGroundsPath = await generateTestingGrounds('basic');
    // console.log(testingGroundsPath);

    statusBar = new StatusBar();
    // most basic functions of status bar are only available when a file is opened
    // await VSBrowser.instance.openResources(testingGroundsPath);

    console.log(statusBar);
  });

  // it('Generic items', async () => {
  //   console.log(`STARTING TESTS`);
  //   // retrieve an item from the status bar by label (the text visible on the bar)
  //   // we are looking at a ts file, so we can get the language selection item like so
  //   const item = await statusBar.getItem('TypeScript');
  //   expect(item).not.undefined;

  //   // or get all the available items
  //   const items = await statusBar.getItems();
  //   expect(items.length).greaterThan(2);
  // });

  // some items are statically bound when a file is open in the editor
  // you can click them in a single step
  // they open input boxes, in this example we will only be closing them
  // it('Items bound to open file', async () => {
  //   // open encoding selection
  //   await statusBar.openEncodingSelection();
  //   // cancel the input
  //   await (await InputBox.create()).cancel();

  //   // all the following methods are available and work very much the same
  //   // await statusBar.openIndentationSelection();
  //   // await statusBar.openLanguageSelection();
  //   // await statusBar.openLineEndingSelection();
  //   // await statusBar.openLineSelection();
  // });

  // the one item that is always present is the notification center (the bell button)
  it('Notifications', async () => {
    console.log(`STARTING TESTS`);
    // open
    await statusBar.openNotificationsCenter();
    // close
    await statusBar.closeNotificationsCenter();
  });
});
