import React from "react";
import { Link } from "gatsby";
import css from "@styled-system/css";
import {
  Styled,
  Head,
  Box,
  Root,
  Footer,
  Container
} from "@jxnblk/gatsby-theme-mdx-blog";
import Header from "../header";
import { LinksList } from 'gatsby-theme-horacioh'

export default props => {
  const { previous, next } = props.pageContext;

  return (
    <Root>
      <Head />
      <Header />
      <Container>
        <Box css={css({
          pb: [4, 5],
          mb: [4, 5],
          borderBottom: "1px solid lightgrey"
        })}>
        <Styled.h2
          css={css({
            fontSize: [5, 6],
            m: 0,
            mb: 3
          })}
        >
          <span role="img" aria-label="wave emoji. Hi!">👋</span>
        </Styled.h2>
        <Styled.p css={css({
            fontSize: [3, 4]
          })}>
          I'm Horacio Herrera, <b>Designer & Developer consultant</b> from Panama living in Barcelona.
          I help companies develop digital products that users want.
        </Styled.p>
        <LinksList />
        </Box>
        <ul
          css={{
            listStyle: "none",
            padding: 0,
            margin: 0
          }}
        >
          {props.posts.map(post => (
            <li key={post.id}>
              <Link
                to={post.slug}
                css={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit"
                }}
              >
                <Styled.h2
                  css={css({
                    fontSize: [4, 5]
                  })}
                >
                  {post.title}
                </Styled.h2>
                <Styled.p
                  css={css({
                    mb: 4,
                    fontSize: [0, 0],
                    fontWeight: "bold"
                  })}
                >
                  {post.date}
                </Styled.p>
                <Styled.p>{post.excerpt}</Styled.p>
              </Link>
            </li>
          ))}
        </ul>
        <Box
          css={{
            display: "flex"
          }}
          py={4}
        >
          {previous && (
            <Styled.a
              as={Link}
              to={previous}
              css={css({
                fontSize: 4,
                fontWeight: "bold",
                color: "inherit",
                textDecoration: "none"
              })}
            >
              Previous
            </Styled.a>
          )}
          <Box m="auto" />
          {next && (
            <Styled.a
              as={Link}
              to={next}
              css={css({
                fontSize: 4,
                fontWeight: "bold",
                color: "inherit",
                textDecoration: "none"
              })}
            >
              Next
            </Styled.a>
          )}
        </Box>
      </Container>
      <Footer />
    </Root>
  );
};
