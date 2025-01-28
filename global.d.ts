import * as React from "react";

declare global {
  namespace JSX {
    // Use React's type for JSX.Element
    type Element = React.ReactElement<
      unknown,
      string | React.JSXElementConstructor<unknown>
    >;
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/71395?utm_source=chatgpt.com
