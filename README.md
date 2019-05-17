# Gatsby Themes experiments

My goal is to build themes of different functionallities for multiple clients. that way I can compose themes to each of my clients.

## This repo

Here I have a yarn workspace containing the following:

- *site*: my client's site. in this case is my new website
- *packages/gatsby-theme-horacioh*: the custon theme for the site. this is the only theme I will add in the `gatsby-config.js` inside `site`. it's using `gatsby-mdx` and `gatsby-plugin-page-creator` to create pages.
- *packages/gatsby-theme-blog*: gatsby theme with the blog functionality. this specific theme now depends `@jxnblk/gatsby-theme-mdx-blog`.

My idea is to everytime I have a new client, create a custom theme like `gatsby-theme-horacioh` and config all the other themes there. and the client's site leave it as simple as possible.
