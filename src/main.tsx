import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { logseq as PL } from "../package.json";
import { IHookEvent } from "@logseq/libs/dist/LSPlugin";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;


const main = async () => {

  console.log('Plugin loaded!')

  logseq.Editor.registerBlockContextMenuItem('Make block Uppercase',
     async (e) => {
      const blockUUID = e.uuid
      // 1 get the content of the block
      const currentBlock: any = await logseq.Editor.getBlock(blockUUID) // TIL AWAIT :D
      // console.log(e.uuid)
      // 2 change content to uppercase
      const currentBlockText = currentBlock.content
      console.log(currentBlockText)
      const uppercaseText: string = currentBlockText?.toUpperCase()
      console.log(uppercaseText)
      // 3 save the block
      logseq.Editor.updateBlock(blockUUID, uppercaseText)
    
  })
  
  const root = ReactDOM.createRoot(document.getElementById("app")!);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // function createModel() {
  //   return {
  //     show() {
  //       logseq.showMainUI();
  //     },
  //   };
  // }

  // logseq.provideModel(createModel());
  // logseq.setMainUIInlineStyle({
  //   zIndex: 11,
  // });

  // const openIconName = "template-plugin-open";

  // logseq.provideStyle(css`
  //   .${openIconName} {
  //     opacity: 0.55;
  //     font-size: 20px;
  //     margin-top: 4px;
  //   }

  //   .${openIconName}:hover {
  //     opacity: 0.9;
  //   }
  // `);

  // logseq.App.registerUIItem("toolbar", {
  //   key: openIconName,
  //   template: `
  //     <div data-on-click="show" class="${openIconName}">⚙️</div>
  //   `,
  // });
}

logseq.ready(main).catch(console.error);
