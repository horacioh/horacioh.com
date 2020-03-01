module.exports = {
  siteMetadata: {
    title: "Horacio Herrera",
    author: "Horacio Herrera",
    description: "Personal website for Horacio. Designer & Developer",
    siteUrl: "https://horacioh.com",
    social: [
      {
        name: `twitter`,
        url: `https://hhg.link/twitter`
      },
      {
        name: `github`,
        url: `https://hhg.link/github`
      }
    ]
  },
  plugins: [
    `gatsby-plugin-theme-ui`,
    {
      resolve: `gatsby-theme-blog`,
      options: {
        basePath: "/writing"
      }
    },
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        gatsbyRemarkPlugins: [`gatsby-remark-images`],
        plugins: [`gatsby-remark-images`]
      }
    },
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./events/`
      }
    },
    {
      resolve: `gatsby-theme-notes`,
      options: {
        // basePath defaults to `/`
        basePath: `/notes`,
        mdx: true
      }
    },
    {
      resolve: "gatsby-plugin-fathom",
      options: {
        siteId: "KBDHZHTK",
        whitelistHostnames: ["horacioh.com"]
      }
    }
  ]
};
