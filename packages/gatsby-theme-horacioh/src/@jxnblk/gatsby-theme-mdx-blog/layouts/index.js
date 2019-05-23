import React from 'react'
import { Link } from 'gatsby'
import css from '@styled-system/css'
import { Styled, Head, Box, Root, Footer, Container } from '@jxnblk/gatsby-theme-mdx-blog'
import Header from '../header';


export default props => {
  const {
    previous,
    next,
  } = props.pageContext

  return (
    <Root>
      <Head />
      <Header />
      <Container>
      <Styled.h2
        css={css({
          fontSize: [5, 6]
        })}>
        👋
      </Styled.h2>
      <Styled.p>My name is Horacio Herrera, I'm a Designer & Developer consultant from Panama living in Barcelona.</Styled.p>
        <ul
          css={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
          {props.posts.map(post => (
            <li key={post.id}>
              <Link
                to={post.slug}
                css={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Styled.h2
                  css={css({
                    fontSize: [4, 5]
                  })}>
                  {post.title}
                </Styled.h2>
                <Styled.p
                  css={css({
                    mb: 4,
                    fontSize: [0, 0],
                    fontWeight: 'bold',
                  })}>
                  {post.date}
                </Styled.p>
                <Styled.p>
                  {post.excerpt}
                </Styled.p>
              </Link>
            </li>
          ))}
        </ul>
        <Box
          css={{
            display: 'flex',
          }}
          py={4}>
          {previous && (
            <Styled.a
              as={Link}
              to={previous}
              css={css({
                fontSize: 4,
                fontWeight: 'bold',
                color: 'inherit',
                textDecoration: 'none',
              })}>
              Previous
            </Styled.a>
          )}
          <Box m='auto' />
          {next && (
            <Styled.a
              as={Link}
              to={next}
              css={css({
                fontSize: 4,
                fontWeight: 'bold',
                color: 'inherit',
                textDecoration: 'none',
              })}>
              Next
            </Styled.a>
          )}
        </Box>
      </Container>
      <Footer />
    </Root>
  )
}
