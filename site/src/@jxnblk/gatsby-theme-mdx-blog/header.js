import React from "react";
import { Link } from "gatsby";
import css from "@styled-system/css";
import {
  Styled,
  Box,
  Container
} from "@jxnblk/gatsby-theme-mdx-blog";

export default props => (
  <Box as="header" block="header">
    <Container
      css={{
        display: "flex",
        alignItems: "center"
      }}
    >
      <Styled.h1
        css={css({
          fontSize: 4,
          my: 0
        })}
      >
        <Link
          to="/"
          css={{
            color: "inherit",
            textDecoration: "none"
          }}
        >
          Horacio Herrera
        </Link>
      </Styled.h1>
    </Container>
  </Box>
);
