import baseTheme from 'gatsby-theme-blog/src/gatsby-plugin-theme-ui';

export default {
  ...baseTheme,
  initialColorMode: `dark`,
  colors: {
    ...baseTheme.colors.modes.dark,
    background: '#1C1C1C',
    highlight: '#92D825',
    primary: '#50CEEA',
    prism: {
      ...baseTheme.colors.prism,
    },
    modes: {
      dark: {
        ...baseTheme.colors.modes.dark,
        background: '#1C1C1C',
        highlight: '#92D825',
        primary: '#50CEEA',
        prism: {
          ...baseTheme.colors.prism,
        },
      },
    },
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'system-ui, sans-serif',
    monospace: 'monospace',
  },
  fontWeights: {
    ...baseTheme.fontWeights,
    heading: 800,
  },
  sizes: {
    container: 800,
  },
  styles: {
    ...baseTheme.styles,
    p: {
      ...baseTheme.styles.p,
      m: 0,
    },
  },
};
