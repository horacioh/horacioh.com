module.exports = {
  siteMetadata: {
    // Used for the title template on pages other than the index site
    siteTitle: `Horacio Herrera`,
    // Default title of the page
    siteTitleAlt: `Horacio Herrera - Designer & Developer`,
    // Can be used for e.g. JSONLD
    siteHeadline: `Horacio Herrera - Designer & Developer`,
    // Will be used to generate absolute URLs for og:image etc.
    siteUrl: `https://horacioh.com`,
    // Used for SEO
    siteDescription: `Horacio's digital garden`,
    // Will be set on the <html /> tag
    siteLanguage: `en`,
    // Used for og:image and must be placed inside the `static` folder
    siteImage: `/defaultOGImage.jpg`,
    // Twitter Handle
    author: `@hhg2288`,
    title: `Horacio Herrera`,
    description: "Horacio's digital garden",
    siteUrl: "https://horacioh.com",
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/hhg2288`,
      },
      {
        name: `github`,
        url: `https://github.com/horacioh`,
      },
    ],
  },
  plugins: [
    `gatsby-plugin-mdx-embed`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 960,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
        ],
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 960,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-theme-notes`,
      options: {
        // basePath defaults to `/`
        basePath: `/notes`,
        mdx: false,
        mdxOtherwiseConfigured: false,
      },
    },
    {
      resolve: "@lekoarts/gatsby-theme-minimal-blog",
      options: {
        feed: true,
        feedTitle: "Horacio Herrera - Horacio's Digital Garden",
        mdx: false,
        blogPath: "/writing",
        navigation: [
          {
            title: `Writing`,
            slug: `/writing`,
          },
          {
            title: `About`,
            slug: `/about`,
          },
          {
            title: `Notes`,
            slug: `/notes`,
          },
        ],
        externalLinks: [
          {
            name: `Twitter`,
            url: `https://twitter.com/hhg2288`,
          },
          {
            name: `Twitch`,
            url: `https://twitch.tv/horacioh`,
          },
          {
            name: `Github`,
            url: `https://github.com/horacioh`,
          },
          {
            name: `aprendegatsby`,
            url: `https://aprendegatsby.com`,
          },
          {
            name: `Braindump`,
            url: `https://horacioh.github.io/braindump/`,
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-fathom",
      options: {
        siteId: "KBDHZHTK",
        // whitelistHostnames: ["horacioh.com"]
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Horacio's Digital Garden`,
        short_name: `horacioh`,
        description: `Horacio's digital Garden`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#6B46C1`,
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    `gatsby-plugin-offline`,
  ],
}
