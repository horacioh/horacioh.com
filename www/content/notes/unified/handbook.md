# unified handbook

https://github.com/unifiedjs/handbook

## How does it work?

- unified uses *unist*, (Universal Syntax Tree) which is an AST specification so that utilities can be shared amongst all different formats
- supported syntaxes: remarkjs, HTML, retext, MDX.

## Abstract syntax trees

- integral structure on unified
- most plugins operate solely on ASTs.
- almost all plugins receive ast as input, transforms it and return another ast.

## Constructing an AST

- unified takes an input string and with a tokenizer and a lever, transforms it to a structured ast.

```
[INPUT] => [TOKENIZER/LEXER] => [PARSER] => [AST]
```

- a compiler does the opposite, turns an ast into an string output.

```
[AST] => [COMPILER] => [OUTPUT]
```

## unist

- all ASTs in unified conform to the unist spec!!
- this is the way unified makes it simpler to developer use their tools, and ensure there’s no extra overhead when working with multiple plugins/utilities

## Visitors

- “visiting” a node is a common task when working with ASTs. You “traverse the tree” by visiting the nodes you are interested in
- unified comes with visitor utilities so you don’t have to reinvent the wheel
- the cool thing about utilities like `unist-útil-visits is that it can work on subtrees, meaning that you can pass small chunks of the red to traverse into

## Parser


