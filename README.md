# html-to-ast
Lightweight approach to enable quickly parsing HTML into an AST and stringify'ing it back to the original string.

Fork of https://github.com/henrikjoreteg/html-parse-stringify and made type more safe.

## How to use

```bash
npm i html-to-ast

# or yarn add html-to-ast
# or pnpm add html-to-ast

```

## So why this?

Well, there are other things React expects me to do if I use it that I don't like. Such as the custom templating and syntax you have to use.

If, hypothetically, you could instead diff an HTML string (generated by _whatever_ templating language of your choice) against the DOM, then you'd get the same benefit, sans React's impositions.

This may all turn out to be a bad idea altogether, but initial results seem promising when paired with [virtual-dom](https://github.com/Matt-Esch/virtual-dom).

But you can't just diff HTML strings, as simple strings, very easily, in order to diff two HTML node trees you have to first turn that string into a tree structure of some sort. Typically, the thing you generate from parsing something like this is called an AST (abstract syntax tree).

This lib does exactly that.

It has two methods:

1. parse
2. stringify

## `.parse(htmlString, options)`

Takes a string of HTML and turns it into an AST, the only option you can currently pass is an object of registered `components` whose children will be ignored when generating the AST.

## `.stringify(AST)`

Takes an AST and turns it back into a string of HTML.

## What does the AST look like?


See comments in the following example:

```typescript
import { parse } from 'html-to-ast'

// this html:
var html = '<div class="oh"><p>hi</p></div>'

// becomes this AST:
var ast = parse(html)

console.log(ast)
/*
{
    // can be `tag`, `text` or `component`
    type: 'tag',

    // name of tag if relevant
    name: 'div',
    
    // parsed attribute object
    attrs: {
        class: 'oh'
    },

    // whether this is a self-closing tag
    // such as <img/>
    voidElement: false,

    // an array of child nodes
    // we see the same structure
    // repeated in each of these
    children: [
        {
            type: 'tag',
            name: 'p',
            attrs: {},
            voidElement: false,
            children: [
                // this is a text node
                // it also has a `type`
                // but nothing other than
                // a `content` containing
                // its text.
                {
                    type: 'text',
                    content: 'hi'
                }
            ]
        }
    ]
}
*/
```

## the AST node types

### 1. tag

properties:

- `type` - will always be `tag` for this type of node
- `name` - tag name, such as 'div'
- `attrs` - an object of key/value pairs. If an attribute has multiple space-separated items such as classes, they'll still be in a single string, for example: `class: "class1 class2"`
- `voidElement` - `true` or `false`. Whether this tag is a known void element as defined by [spec](http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements).
- `children` - array of child nodes. Note that any continuous string of text is a text node child, see below.

### 2. text

properties:

- `type` - will always be `text` for this type of node
- `content` - text content of the node

### 3. component

If you pass an object of `components` as part of the `options` object passed as the second argument to `.parse()` then the AST won't keep parsing that branch of the DOM tree when it one of those registered components.

This is so that it's possible to ignore sections of the tree that you may want to handle by another "subview" in your application that handles it's own DOM diffing.

properties:

- `type` - will always be `component` for this type of node
- `name` - tag name, such as 'div'
- `attrs` - an object of key/value pairs. If an attribute has multiple space-separated items such as classes, they'll still be in a single string, for example: `class: "class1 class2"`
- `voidElement` - `true` or `false`. Whether this tag is a known void element as defined by [spec](http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements).
- `children` - it will still have a `children` array, but it will always be empty.

## license

MIT