import { Comment, IDoc } from './types';

import { htmlVoidElements } from './element';

const attrRE = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;

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

    // handle comment tag
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

    if (result[1]) {
      const attr = result[1].trim();
      let arr = [attr, ''];

      if (attr.indexOf('=') > -1) {
        arr = attr.split('=');
      }

      res.attrs[arr[0]] = arr[1];
      reg.lastIndex--;
    } else if (result[2]) {
      res.attrs[result[2]] = result[3]
        .trim()
        .substring(1, result[3].length - 1);
    }
  }

  return res;
};
