import { Comment, IDoc } from './types';
import { htmlVoidElements } from './element';

const attrRE = /\s([^'"\s><=]+)(?:\s*=\s*(['"])([^]*?)\2)?/g;
// Regular expression for matching and capturing attributes and their values in an HTML tag.

export const parseTag = (tag: string): IDoc | Comment => {
  const res: IDoc = {
    type: 'tag',
    name: '',
    voidElement: false,
    attrs: {},
    children: [],
  };

  const tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/);
  if (tagMatch) {
    res.name = tagMatch[1];
    res.voidElement =
      htmlVoidElements.includes(tagMatch[1]) ||
      tag.charAt(tag.length - 2) === '/';

    if (res.name.startsWith('!--')) {
      const endIndex = tag.indexOf('-->');
      return {
        type: 'comment',
        comment: endIndex !== -1 ? tag.slice(4, endIndex) : '',
      };
    }
  }

  const reg = new RegExp(attrRE);
  let result = null;
  for (;;) {
    result = reg.exec(tag);

    if (result === null) {
      break;
    }

    if (!result[0].trim()) {
      continue;
    }

    const attrName = result[1];
    const attrValue = result[3]; // Capture the attribute value without quotes

    if (attrName && attrValue !== undefined) {
      res.attrs[attrName] = attrValue;
    }
  }

  return res;
};
