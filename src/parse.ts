import type { Attr, IOptions } from './types';

import { parseTag } from './parse-tag';

const tagRE = /<[a-zA-Z0-9\-\!\/](?:"[^"]*"|'[^']*'|[^'">])*>/g;
const whitespaceRE = /^\s*$/;

// re-used obj for quick lookups of components
const empty = Object.create(null);

export interface MaybeDoc {
  type?: string;
  text?: string;
  content?: string;
  voidElement?: boolean;
  name?: string;
  style?: string[];
  attrs?: Attr;
  children?: MaybeDoc[];
  comment?: string;
}

export const parse = (html: string, options: Partial<IOptions> = {}) => {
  options || (options = {});
  options.components || (options.components = empty);
  const result: MaybeDoc[] = [];
  const arr: MaybeDoc[] = [];
  let current: MaybeDoc;
  let level = -1;
  let inComponent = false;

  // handle text at top level
  if (html.indexOf('<') !== 0) {
    var end = html.indexOf('<');
    result.push({
      type: 'text',
      content: end === -1 ? html : html.substring(0, end),
    });
  }
  // @ts-ignore
  html.replace(tagRE, function (tag, index) {
    if (inComponent) {
      if (tag !== '</' + current.name + '>') {
        return '';
      } else {
        inComponent = false;
      }
    }
    const isOpen = tag.charAt(1) !== '/';
    const isComment = tag.startsWith('<!--');
    const start = index + tag.length;
    const nextChar = html.charAt(start);

    const appendTextNode = () => {
      if (inComponent || nextChar === '<' || !nextChar) {
        return;
      }

      const parentForText =
        level === -1
          ? result
          : (arr[level] && Array.isArray(arr[level].children)
              ? (arr[level].children as MaybeDoc[])
              : undefined);

      if (!parentForText) {
        return;
      }

      const end = html.indexOf('<', start);
      let content = html.slice(start, end === -1 ? undefined : end);
      if (whitespaceRE.test(content)) {
        content = ' ';
      }

      if ((end > -1 && level + parentForText.length >= 0) || content !== ' ') {
        parentForText.push({
          type: 'text',
          content: content,
        });
      }
    };

    let parent: MaybeDoc | MaybeDoc['children'];

    if (isComment) {
      const comment = parseTag(tag);

      // if we're at root, push new base node
      if (level < 0) {
        result.push(comment);
        appendTextNode();
        return result;
      }
      parent = arr[level];
      if (parent && parent.children && Array.isArray(parent.children)) {
        parent.children.push(comment);
      }
      appendTextNode();
      return result;
    }

    if (isOpen) {
      level++;

      current = parseTag(tag);
      if (
        current.type === 'tag' &&
        current.name &&
        options.components &&
        options.components[current.name]
      ) {
        current.type = 'component';
        inComponent = true;
      }

      if (
        !current.voidElement &&
        !inComponent &&
        nextChar &&
        nextChar !== '<' &&
        Array.isArray(current.children)
      ) {
        current.children.push({
          type: 'text',
          content: html.slice(start, html.indexOf('<', start)),
        });
      }

      // if we're at root, push new base node
      if (level === 0) {
        result.push(current);
      }

      parent = arr[level - 1];

      if (parent && parent.children) {
        parent.children.push(current);
      }

      arr[level] = current;
    }

    if (!isOpen || current.voidElement) {
      if (
        level > -1 &&
        (current.voidElement || current.name === tag.slice(2, -1))
      ) {
        level--;
        // move current up a level to match the end tag
        current = level === -1 ? (result as MaybeDoc) : arr[level];
      }
      appendTextNode();
    }
  });

  return result;
};
