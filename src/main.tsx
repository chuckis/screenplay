import "@logseq/libs";
import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";

import { logseq as PL } from "../package.json";

import { publishBlock, publishPage } from "./Nostrservice.js";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.js";


const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

const main = async () => {

  console.log('Plugin loaded!')

  let settings: SettingSchemaDesc[] = [
    
    {
      key: "nsec",
      type: "string",
      title: "Enter your nsec",
      description: "Enter your nsec",
      default: "somensec "
    },
  ]

  logseq.useSettingsSchema(settings)

  function updateSettings() {
    console.log("Settings changed! ", `${logseq.settings.nsec}`)
  }

  logseq.onSettingsChanged(updateSettings);

  logseq.Editor.registerBlockContextMenuItem('Publish block to Nostr',
    async (e) => {
      const blockUUID = e.uuid
      // 1 get the content of the block
      const currentBlock = await logseq.Editor.getBlock(blockUUID)
      const currentBlockText: string = currentBlock.content
      console.log(currentBlockText);
      publishBlock(currentBlockText);
    })

  logseq.App.registerPageMenuItem('Publish Page to Nostr',
    async (e) => {
      const currentPage = await logseq.Editor.getCurrentPage()
      const pageId = currentPage.uuid
      const pageTitle: string = currentPage.name
      console.log("publishing page to Nostr");
      const currentTree = await logseq.Editor.getPageBlocksTree(pageId)
      const result: string[] = currentTree.map(a => a.content);
      let pageContent: string = `${result.join(` \n`)}`;
      console.log(pageContent, pageTitle);
      publishPage(pageTitle, pageContent)
    }
  )

  const root = ReactDOM.createRoot(document.getElementById("app")!);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  logseq.setMainUIInlineStyle({
    position: 'fixed',
    zIndex: 11,
  });

  const settingsButton = "NostrPlugin"  // Creating a unique key for the button

  // Create a button
  logseq.App.registerUIItem('toolbar', {
    key: settingsButton,
    template: `
<div>
  <a class="button icon" data-on-click="${settingsButton}" id="${settingsButton}" style="font-size: 16px" title="Plugin settings">⚡</a>
</div>
    `,
  })

  // Event
  logseq.provideModel({
    [settingsButton]: () => eventA(),
  })

  const eventA = () => {
    //Process when button is pressed here
    logseq.showSettingsUI();
  }
}

logseq.ready(main).catch(console.error);
