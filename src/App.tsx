import React, { useRef } from "react";
import { useAppVisible } from "./utils";

function App(props: {
  links: {
    key: string, 
    id: number, 
    element: HTMLElement,
    pos: {left: number, top: number}
  }[]
}) {

  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  if (visible) {
    console.log('tsx >> props', props);
    return (
      <main
        // className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
        className="backdrop-filter fixed inset-0"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div ref={innerRef} id='plugin-container' className="text-size-2em text-yellow-200">
          {props.links.length > 0 &&
            (
              props.links.map((link, idx) => {
                return (
                  <div
                    key={idx}
                    id={`plugin-link-${link.key}`}
                    className={'absolute'}
                    style={{top: `${link.pos.top}px`, left: `${link.pos.left}px`}}
                  >
                    {link.key}
                  </div>
                )
              })
            )
            //{props.links.map(funcion (link, idx) {
            //  return (
            //    <div 
            //      id={`plugin-link-${props.links[0].key}`} 
            //      className={'absolute'}
            //      style={{top: `${props.links[0].pos.top}px`, left: `${props.links[0].pos.left}px`}}
            //    >
            //      {props.links[0].key}
            //    </div>
            //  )
            //})
            //}
          }
        </div>
      </main>
    );
  }
  return null;
}

export default App;
