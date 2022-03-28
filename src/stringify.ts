import { Attr, IDoc } from './types';

function attrString(attrs: Attr) {
  const buff = [];
  for (let key in attrs) {
    buff.push(key + '="' + attrs[key] + '"');
  }
  if (!buff.length) {
    return '';
  }
  return ' ' + buff.join(' ');
}

function _stringify(buff: string, doc: IDoc): string {
  switch (doc.type) {
    case 'text':
      return buff + doc.content;
    case 'tag':
      buff +=
        '<' +
        doc.name +
        (doc.attrs ? attrString(doc.attrs) : '') +
        (doc.voidElement ? '/>' : '>');
      if (doc.voidElement) {
        return buff;
      }
      return buff + doc.children.reduce(_stringify, '') + '</' + doc.name + '>';
    case 'comment':
      buff += '<!--' + doc.comment + '-->';
      return buff;
    default:
      return '';
  }
}

export const stringify = (doc: IDoc[]) => {
  return doc.reduce(function (token: string, rootEl: IDoc) {
    return token + _stringify('', rootEl);
  }, '');
};
