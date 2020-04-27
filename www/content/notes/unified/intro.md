# Unified

## Introduction

https://unifiedjs.com/learn/guide/introduction-to-unified/

- is a friendly interface backed by an ecosystem of plugins built for creating and manipulating content.
- takes data in different formats, and translate them into structured data[^1]
- usified is a chain of processes, with many plugins you can connect with
- no manual parsing or syntax handling

### Three part act

- **Parse:** any input needs to be parsed to a workable format (mdast, hast...)[^2]
- **Transform:** all the magic happens here. here's where all the plugins transform the input depending on the order too.
- **Stringify:** take the formatted content and stringify it to Markdown, HTML or prose.

## Using unified

- check repo for the example: https://github.com/horacioh/unified-intro
- in this example we will learn how to turn Markdown into HTML.
- for that we need a Markdown parser (`remark-parse`) and an HTML stringifier (`rehype-stringify`)
- to transform between Markdown and HTML we need `remark-rehype`
- to glue all and stream it, we are going to use `unified`.
- you have a bunch of plugins available to work with content (that's COOL)
- Note that remark plugins work on a Markdown tree, and rehype plugins work on an HTML tree. It’s important that you place your .use calls in the correct places.
- I use [the `remark-heading-id` plugin](https://github.com/imcuttle/remark-heading-id/blob/master/package.json) to enable custom heading links on the HTML result (❤️)

---

### Questions and comments

[^1]: are all transformation following the same structure? (HTML -> structure1 ; MD -> structure2 ; structure1 === structure 2 ?)
[^2]: (https://github.com/syntax-tree)

### Resources and links

- [fast-author: electron app to create/edit markdown files directly to the filesystem](https://dev.to/exampro/i-had-to-build-my-own-markdown-editor-because-no-tool-was-fast-enough-for-me-3b3o) [blog post](https://dev.to/exampro/i-had-to-build-my-own-markdown-editor-because-no-tool-was-fast-enough-for-me-3b3o) - [code](https://github.com/ExamProCo/fast-author#How-to-run-the-application-in-development)
- [Transform Content With Abstract Syntax Trees — Learn With Jason](https://www.youtube.com/watch?v=acb2osL1VPE)

  links from video:

  - https://unifiedjs.com/
  - https://github.com/remarkjs/remark
  - https://github.com/rehypejs/rehype
  - https://github.com/syntax-tree/unist-util-map
  - [Netlify Build Plugins Beta](https://www.netlify.com/build/plugins...)
  - https://github.com/syntax-tree/unist
  - https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js#L65-L74
  - https://github.com/leonardodino/gatsby-remark-figure-caption/blob/master/src/index.js
  - https://dev.to/mlennox/abstract-syntax-trees-for-fun-and-profit-4mej

* https://twitter.com/hhg2288/status/1254775731285983232
* https://css-tricks.com/how-to-modify-nodes-in-an-abstract-syntax-tree/

- [Sharing my unified journey in building unified-doc](https://spectrum.chat/unified/general/sharing-my-unified-journey-in-building-unified-doc~77f7e2d8-6496-4764-b040-a4250199ce69)
- [rehype-react](https://github.com/rehypejs/rehype-react) - [example](https://codesandbox.io/s/rehype-react-example-rc7bg)

#### Collaboration

- https://togetherjs.com/
