module.exports = {
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-blog',
      options: {
        name: '',
      }
    }
  ],
  plugins: [
    {
      resolve: `gatsby-mdx`,
      options: {
        extensions: [`.mdx`, `.md`]
      }
    }
  ]
}
