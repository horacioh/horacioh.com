module.exports = {
  __experimentalThemes: [
    {
      resolve: "horacio-gatsby-theme-blog",
      options: {
        name: ""
      }
    }
  ],
  plugins: [
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 1035
            }
          }
        ]
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `src/posts`
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-87410585-3",
        // Defines where to place the tracking script - `true` in the head and `false` in the body
        head: false,
        // Enables Google Optimize using your container Id
        // optimizeId: "YOUR_GOOGLE_OPTIMIZE_TRACKING_ID",
        // Enables Google Optimize Experiment ID
        // experimentId: "YOUR_GOOGLE_EXPERIMENT_ID",
        // Set Variation ID. 0 for original 1,2,3....
        // variationId: "YOUR_GOOGLE_OPTIMIZE_VARIATION_ID",
        // Any additional create only fields (optional)
        sampleRate: 5,
        siteSpeedSampleRate: 10
        // cookieDomain: "example.com",
      }
    },
    `gatsby-plugin-offline`
  ]
};
