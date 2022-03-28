export interface htmlToAst {
  new (): htmlToAst;
  parse_tag(tag: string): IDoc;
  parse(html: string, options: IOptions): Array<any>;
  stringify(doc: IDoc): string;
}

export type Attr = Record<string, string | boolean | number>;
 
export interface Comment {
  type: string;
  comment: string;
}

export interface IDoc {
  type: string;
  content?: string;
  voidElement: boolean;
  name: string;
  style?: string[];
  attrs: Attr;
  children: IDoc[];
  comment?: string;
}



export interface IOptions {
  components: Record<string, string>;
}
