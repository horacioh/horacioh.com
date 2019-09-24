module.exports = {
  siteMetadata: {
    title: 'Horacio Herrera',
    author: 'Horacio Herrera',
    description: 'Personal website for Horacio. Designer & Developer',
    siteUrl: 'https://horacioh.com',
    social: [
      {
        name: `twitter`,
        url: `https://hhg.link/twitter`,
      },
      {
        name: `github`,
        url: `https://hhg.link/github`,
      },
    ],
  },
  plugins: [
    `gatsby-plugin-theme-ui`,
    {
      resolve: `gatsby-theme-blog`,
      options: {
        basePath: '/writing',
      },
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        gatsbyRemarkPlugins: [`gatsby-remark-images`],
        plugins: [`gatsby-remark-images`],
      },
    },
  ],
};
