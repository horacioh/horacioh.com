// import "resize-observer-polyfill";

import React from "react";
import theme from "./src/gatsby-plugin-theme-ui";
import { ThemeProvider } from "theme-ui";

export const wrapRootElement = ({ element }) => (
  <ThemeProvider theme={theme}>{element}</ThemeProvider>
);
