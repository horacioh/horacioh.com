module.exports = {
  __experimentalThemes: [
    "gatsby-theme-blog"
  ],
  plugins: [
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/src/pages`,

      }
    }
  ]
}
