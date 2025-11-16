import { parse } from './parse';
import { stringify } from './stringify';
import type { IDoc } from './types';

describe('stringify', () => {
  it('stringifies component nodes like regular tags', () => {
    const html = '<MyWidget foo="bar"></MyWidget>';
    const ast = parse(html, { components: { MyWidget: 'component' } });

    expect(stringify(ast as unknown as IDoc[])).toBe(html);
  });

  it('supports self-closing components', () => {
    const html = '<MyWidget foo="bar" />';
    const ast = parse(html, { components: { MyWidget: 'component' } });

    expect(stringify(ast as unknown as IDoc[])).toBe('<MyWidget foo="bar"/>');
  });
});
