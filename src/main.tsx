import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import conf from './config.js'

import { logseq as PL } from "../package.json";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

const privateBind = conf.bindKey
// 自定按键命令
const bindKey: any[] = []

const posOffset = {x: 4, y: -4};

const letters = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
  'U', 'V', 'W', 'X', 'Y', 'Z'];

let keyStroke: string[] = [];

const links: any[] = [];

function main() {
  console.info(`#${pluginId}: MAIN`);
  const root = ReactDOM.createRoot(document.getElementById("app")!);


  root.render(
    <React.StrictMode>
      <App links={links}/>
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

  const openIconName = "Vim & Vimium";

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
      <div data-on-click="show" class="${openIconName}">⚙️</div>
    `,
  });

  logseq.App.registerCommandPalette(
    {
      key: "vimium-get-links",
      label: "Links",
      keybinding: {
        mode: "non-editing",
        binding: 'f',
      },
    },
    async () => {

      keyStroke = [];

      // @ts-ignore
      const block = await logseq.Editor.getCurrentBlock();
      logseq.showMainUI()
      await (() => console.log('DEBUG >> action of vimium-get-links >> \nCurrent block', block))();

      const selectorDebug = await logseq.App.queryElementById(block!.uuid);
      console.log('DEBUG >> selectorDebug', selectorDebug);
      if(selectorDebug) {
        const blockElementDebug = top!.document.querySelector<HTMLElement>(selectorDebug as string);
        console.log('DEBUG >> blockElementDebug', blockElementDebug);
      }

      const linkElements = await top?.document.querySelectorAll('a');
      await (() => console.log('DEBUG >> action of vimium-get-links >> \nlinkElements', linkElements))();

      let step1 = 0;
      let step2 = 0;

      linkElements?.forEach(async (el, idx) => {
        const rect = el.getBoundingClientRect();
        if(!links.find(link => link.element === el)) {
          let validate = true;

          if(el.id.includes('control-')) {
            const blockId = el.id.replace('control-', '');
            console.log('DEBUG >> blockId', blockId);
            const blockTopElements = top!.document.getElementsByClassName(`ls-block ${blockId}`);
            console.log('DEBUG >> blockTopElements', blockTopElements);
            if(blockTopElements.length > 0) {
              console.log('DEBUG >> blockElement', blockTopElements[0]);
              const blockChildrenElement = (blockTopElements[0] as HTMLElement).querySelector('.block-children-container');
              console.log('DEBUG >> blockChildrenElement', blockChildrenElement);
              validate = !!blockChildrenElement;
            }
          }

          if(validate) {
            if(step1 > 25) {
              step1 = 0;
              ++step2;
              if(step2 > 25) {
                console.error('Expection: Run out of letters!');
              }
            }
            const key = `${letters[step1++]}${letters[step2]}`;
            console.log(key);
            links.push({
              key,
              id: idx, 
              pos: {
                left: Math.round(rect.left + posOffset.x), 
                top: Math.round(rect.top + posOffset.y)
              },
              element: el
            });
          }
        }
      })
    }
  )

  const container = document.createElement('div')
  container.classList.add('vim-vimium-links-container')
  document!.getElementById('app')!.appendChild(container)

  startKeyListen();
}

async function startKeyListen() {
  await loadBindKey(privateBind)
  // 监听按键事件
  top!.document.onkeydown = keyEventHandler
  document.onkeydown = keyEventHandler
}

function keyEventHandler(e: KeyboardEvent){
  console.log('DEBUG >> keyEventHandler', e);
  
  if(e.keyCode === 27 || e.code === 'Escape') {
    logseq.hideMainUI();
  }

  keyStroke.push(e.key);
  console.log('DEBUG >> keyStroke', keyStroke);
  if(keyStroke.length === 2) {
    const code = keyStroke[0] as string + keyStroke[1];
    console.log('DEBUG >> code', code);
    links.forEach(link => {
      if(link.key === code.toUpperCase()) {
        logseq.hideMainUI();
        link.element.click();
        console.log('DEBUG >> click on ', link);
      }
    })

    keyStroke = [];
  }
}

/**
 * 整理命令定义
 */
function loadBindKey(binds: any) {
  bindKey[0] = []
  bindKey[1] = []
  bindKey[2] = []
  for (let i = 0; i < binds.length; i++) {
    const bin = binds[i]
    bindKey[bin.type - 1].push(bin)
  }
}

logseq.ready(main).catch(console.error);
