# Gatsby Themes experiments

My goal is to build themes of different functionallities for multiple clients. that way I can compose themes to each of my clients.

## This repo

Here I have a yarn workspace containing the following:

- *site*: my client's site. in this case is my new website
- *packages/gatsby-theme-horacioh*: the custon theme for the site. this is the only theme I will add in the `gatsby-config.js` inside `site`. it's using `gatsby-mdx` and `gatsby-plugin-page-creator` to create pages.
- *packages/gatsby-theme-blog*: gatsby theme with the blog functionality. this specific theme now depends `@jxnblk/gatsby-theme-mdx-blog`.

My idea is to everytime I have a new client, create a custom theme like `gatsby-theme-horacioh` and config all the other themes there. and the client's site leave it as simple as possible.

## The problem

I'm getting an error building the site (error below). My assumption is because both `gatsby-theme-horacioh` and `@jxnblk/gatsby-theme-mdx-blog` are using MDX, both installations are making some sort of conflict.

hope this can help to debug and document a real-world usecase :)



```bash
  | -> yarn workspace site develop
yarn workspace v1.15.2
yarn run v1.15.2
$ gatsby develop
success open and validate gatsby-configs — 0.039 s
success load plugins — 0.605 s
success onPreInit — 0.002 s
success initialize cache — 0.006 s
success copy gatsby files — 0.075 s
success onPreBootstrap — 0.016 s
success source and transform nodes — 0.060 s
success building schema — 0.251 s
[ { GraphQLError: Expected type MdxFieldsEnum, found frontmatter___date; Did you mean the enum value frontmatter___title or frontmatter____PARENT?
    at Object.EnumValue (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/validation/rules/ValuesOfCorrectType.js:134:29)
    at Object.enter (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:332:29)
    at Object.enter (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:383:25)
    at visit (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:250:26)
    at validate (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/validation/validate.js:63:22)
    at graphqlImpl (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:77:50)
    at /Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:32:250
    at new Promise (<anonymous>)
    at graphql (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:30:10)
    at graphqlRunner (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/bootstrap/index.js:359:14)
    at Object.exports.createPages (/Users/horacio/workspace/gatsby-themes/node_modules/@jxnblk/gatsby-theme-mdx-blog/gatsby-node.js:41:24)
    at runAPI (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/utils/api-runner-node.js:219:37)
    at resolve (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/utils/api-runner-node.js:342:19)
    at Promise._execute (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/debuggability.js:313:9)
    at Promise._resolveFromExecutor (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/promise.js:483:18)
    at new Promise (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/promise.js:79:10)
    message: 'Expected type MdxFieldsEnum, found frontmatter___date; Did you mean the enum value frontmatter___title or frontmatter____PARENT?',
    locations: [ [Object] ] },
  { GraphQLError: Cannot query field "date" on type "MdxFrontmatter".
    at Object.Field (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/validation/rules/FieldsOnCorrectType.js:64:31)
    at Object.enter (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:332:29)
    at Object.enter (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:383:25)
    at visit (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:250:26)
    at validate (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/validation/validate.js:63:22)
    at graphqlImpl (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:77:50)
    at /Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:32:250
    at new Promise (<anonymous>)
    at graphql (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:30:10)
    at graphqlRunner (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/bootstrap/index.js:359:14)
    at Object.exports.createPages (/Users/horacio/workspace/gatsby-themes/node_modules/@jxnblk/gatsby-theme-mdx-blog/gatsby-node.js:41:24)
    at runAPI (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/utils/api-runner-node.js:219:37)
    at resolve (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/utils/api-runner-node.js:342:19)
    at Promise._execute (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/debuggability.js:313:9)
    at Promise._resolveFromExecutor (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/promise.js:483:18)
    at new Promise (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/promise.js:79:10)
    message: 'Cannot query field "date" on type "MdxFrontmatter".',
    locations: [ [Object] ] },
  { GraphQLError: Cannot query field "draft" on type "MdxFrontmatter".
    at Object.Field (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/validation/rules/FieldsOnCorrectType.js:64:31)
    at Object.enter (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:332:29)
    at Object.enter (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:383:25)
    at visit (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/language/visitor.js:250:26)
    at validate (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/validation/validate.js:63:22)
    at graphqlImpl (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:77:50)
    at /Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:32:250
    at new Promise (<anonymous>)
    at graphql (/Users/horacio/workspace/gatsby-themes/node_modules/graphql/graphql.js:30:10)
    at graphqlRunner (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/bootstrap/index.js:359:14)
    at Object.exports.createPages (/Users/horacio/workspace/gatsby-themes/node_modules/@jxnblk/gatsby-theme-mdx-blog/gatsby-node.js:41:24)
    at runAPI (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/utils/api-runner-node.js:219:37)
    at resolve (/Users/horacio/workspace/gatsby-themes/site/node_modules/gatsby/dist/utils/api-runner-node.js:342:19)
    at Promise._execute (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/debuggability.js:313:9)
    at Promise._resolveFromExecutor (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/promise.js:483:18)
    at new Promise (/Users/horacio/workspace/gatsby-themes/node_modules/bluebird/js/release/promise.js:79:10)
    message: 'Cannot query field "draft" on type "MdxFrontmatter".',
    locations: [ [Object] ] } ]
success createPages — 0.036 s
success createPagesStatefully — 0.229 s
success onPreExtractQueries — 0.000 s
success update schema — 0.023 s
error GraphQL Error Expected type MdxFieldsEnum, found frontmatter___date; Did you mean the enum value frontmatter___title or frontmatter____PARENT?

  file: /Users/horacio/workspace/gatsby-themes/node_modules/@jxnblk/gatsby-theme-mdx-blog/src/templates/index.js

   1 |
   2 |   query BlogIndex($skip: Int!, $limit: Int!) {
   3 |     allMdx(
>  4 |       sort: { fields: [frontmatter___date], order: DESC }
     |                        ^
   5 |       limit: $limit
   6 |       skip: $skip
   7 |       filter: { frontmatter: { draft: { ne: true } } }
   8 |     ) {
   9 |       edges {
  10 |         node {
  11 |           id
  12 |           excerpt
  13 |           frontmatter {
  14 |             title

success extract queries from components — 0.090 s
success run static queries — 0.001 s
error (node:21319) DeprecationWarning: Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.
success run page queries — 0.008 s — 2/2 272.68 queries/second
success write out page data — 0.006 s
success write out redirect data — 0.001 s
success onPostBootstrap — 0.001 s

info bootstrap finished - 4.878 s

error (node:21319) DeprecationWarning: Tapable.plugin is deprecated. Use new API on `.hooks` instead
error (node:21319) DeprecationWarning: Resolver#doResolve: The type arguments (string) is now a hook argument (Hook). Pass a reference to the hook instead.
 DONE  Compiled successfully in 3019ms                                                                                                                                                                  15:57:31


You can now view site in the browser.

  http://localhost:8000/

View GraphiQL, an in-browser IDE, to explore your site's data and schema

  http://localhost:8000/___graphql

Note that the development build is not optimized.
To create a production build, use npm run build

info ℹ ｢wdm｣:
info ℹ ｢wdm｣: Compiled successfully.
```
