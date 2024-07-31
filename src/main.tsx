import "@logseq/libs";
import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";

import { logseq as PL } from "../package.json";

import { publishBlock, publishPage } from "./Nostrservice.js";


const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

const main = async () => {

  console.log('Plugin loaded!')

  logseq.Editor.registerBlockContextMenuItem('Publish block to Nostr',
    async (e) => {
      const blockUUID = e.uuid
      // 1 get the content of the block
      const currentBlock = await logseq.Editor.getBlock(blockUUID) // TIL AWAIT :D
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

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "NostrPlugin";

  logseq.provideStyle(css`
    .${openIconName} {
      opacity: 0.55;
      font-size: 20px;
      margin-top: 4px;
    }

    .${openIconName}:hover {
      opacity: 0.9;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
      <div data-on-click="show" class="${openIconName}">⚡</div>
    `,
  });

}

logseq.ready(main).catch(console.error);
