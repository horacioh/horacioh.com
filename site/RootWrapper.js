import React from "react";
import { Styled, css, ThemeProvider } from "theme-ui";
import { Global } from "@emotion/core";
import theme from "./src/gatsby-plugin-theme-ui";
import Header from "./src/components/header";
import Footer from "./src/components/footer";

export default function Layout({ children, ...props }) {
  return (
    <Styled.root>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
        `}
      />
      <div
        css={css({
          maxWidth: "container",
          mx: "auto",
          // px: 3,
          py: 4
        })}
      >
        <Header />
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
        <Footer />
      </div>
    </Styled.root>
  );
}
