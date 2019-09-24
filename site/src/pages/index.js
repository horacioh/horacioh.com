import React from 'react';
import { Link, graphql } from 'gatsby';
import { Styled, css } from 'theme-ui';
import Image from 'gatsby-image';
import Layout from '../components/layout';
// import Icon, { iconFromList } from '../components/small-icons';
import SEO from '../components/seo';
import { LinksList } from '../components/linksList';

const List = ({ title, subtitle, secondary, ...props }) => (
  <div css={{ marginBottom: '3rem' }}>
    <div
      css={{
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <h2 css={{ margin: 0 }}>{title}</h2>
      {secondary}
    </div>
    <ul css={{ listStyleType: 'none', margin: 0, padding: 0 }}>
      {props.children}
    </ul>
  </div>
);

const ListItem = ({ to, logo, children }) => {
  const Component = to.startsWith('https') ? 'a' : Link;
  return (
    <li css={{ marginBottom: '2rem' }}>
      <Component
        to={to}
        href={to}
        css={css({
          color: 'rgba(255,255,255,0.86)',
          display: 'flex',
          borderRadius: '8px',
          textDecoration: 'none',
        })}
      >
        <div css={css({ display: 'flex', flexDirection: ['column', 'row'] })}>
          {children}
        </div>
      </Component>
    </li>
  );
};

export default ({ data, ...props }) => {
  console.log('TCL: data', data);
  return (
    <Layout>
      <SEO title="Horacio Herrera" />
      <div
        css={css({
          margin: 'auto',
          marginTop: '24px',
          marginBottom: '80px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: ['column', 'row'],
        })}
      >
        <Styled.div
          css={{
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <Image fixed={data.avatar.childImageSharp.fixed} />
        </Styled.div>
        <div css={css({ flex: 1, pl: 3 })}>
          <span css={css({ fontSize: ['2rem', '3rem'], marginBottom: 0 })}>
            👋
          </span>
          <p
            css={css({
              fontSize: ['1.2rem', '1.5rem'],
              fontWeight: 300,
              lineHeight: 1.5,
            })}
          >
            <b>I'm Horacio Herrera</b>, Designer & Developer consultant from
            Panama living in Barcelona. I help companies develop digital
            products that users want.
          </p>
          <div css={{ marginTop: 40 }}>
            <LinksList />
          </div>
        </div>
      </div>
      <List
        title="Latest Posts"
        secondary={
          <Link
            to="/writing"
            css={{
              color: 'rgba(255,255,255,0.86)',
              textDecoration: 'none',
              alignSelf: 'flex-end',

              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            all posts
          </Link>
        }
      >
        {data.recentPosts.nodes.map(
          ({ id, title, slug, tags, excerpt, parent }) => (
            <ListItem to={slug} key={id}>
              {/* <Image fixed={parent.frontmatter.cover.childImageSharp.fixed} /> */}
              <div css={css({ flex: 1, p: 0 })}>
                <h3
                  css={css({
                    variant: 'text.heading',
                    fontSize: [3, 4],
                    m: 0,
                    p: 0,
                  })}
                >
                  {title}
                </h3>
                <Styled.p>{excerpt}</Styled.p>
              </div>
            </ListItem>
          ),
        )}
      </List>
    </Layout>
  );
};

export const query = graphql`
  query HomePageQuery {
    avatar: file(relativePath: { regex: "/avatar/" }) {
      absolutePath
      childImageSharp {
        fixed(width: 150, height: 150) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    recentPosts: allBlogPost(sort: { fields: [date], order: DESC }, limit: 5) {
      nodes {
        id
        title
        tags
        slug
        excerpt
        ... on MdxBlogPost {
          parent {
            ... on Mdx {
              frontmatter {
                featured
                cover {
                  id
                  childImageSharp {
                    id
                    fixed(
                      cropFocus: CENTER
                      fit: COVER
                      width: 280
                      height: 180
                    ) {
                      ...GatsbyImageSharpFixed
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
