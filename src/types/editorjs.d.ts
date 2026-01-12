declare module "@editorjs/header" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Header implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/list" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class List implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/paragraph" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Paragraph implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/quote" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Quote implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/code" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Code implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/image" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Image implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/embed" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Embed implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/table" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Table implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/warning" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Warning implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/marker" {
  import { InlineTool } from "@editorjs/editorjs";
  export default class Marker implements InlineTool {
    constructor(config: any);
    static get isInline(): boolean;
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
}

declare module "@editorjs/inline-code" {
  import { InlineTool } from "@editorjs/editorjs";
  export default class InlineCode implements InlineTool {
    constructor(config: any);
    static get isInline(): boolean;
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
}

declare module "@editorjs/delimiter" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Delimiter implements BlockTool {
    constructor(config: any);
    static get toolbox(): { icon: string; title: string };
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
}

declare module "@editorjs/link" {
  import { InlineTool } from "@editorjs/editorjs";
  export default class LinkTool implements InlineTool {
    constructor(config: any);
    static get isInline(): boolean;
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
}
