import { parse } from './parse';

describe('parse', () => {
  it('preserves text nodes surrounding comments', () => {
    const ast = parse('before<!-- comment -->after');

    expect(ast).toEqual([
      { type: 'text', content: 'before' },
      { type: 'comment', comment: ' comment ' },
      { type: 'text', content: 'after' },
    ]);
  });
});
