import React from "react";
import { Link, graphql } from "gatsby";
import { Styled, css } from "theme-ui";
import Image from "gatsby-image";
import Layout from "../components/layout";
// import Icon, { iconFromList } from '../components/small-icons';
import SEO from "../components/seo";
import { LinksList } from "../components/linksList";
import Contact from "../components/Contact";

const List = ({ title, subtitle, secondary, ...props }) => (
  <div css={{ marginBottom: "5rem" }}>
    <div
      css={{
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "space-between"
      }}
    >
      <h2 css={{ margin: 0 }}>{title}</h2>
      {secondary}
    </div>
    <ul css={{ listStyleType: "none", margin: 0, padding: 0 }}>
      {props.children}
    </ul>
  </div>
);

const ListItem = ({ to, logo, children }) => {
  const Component = to.startsWith("https") ? "a" : Link;
  return (
    <li
      css={{
        marginBottom: "2rem",
        "&:last-child": {
          marginBottom: 0
        }
      }}
    >
      <Component
        to={to}
        href={to}
        target={to.startsWith("https") ? "_blank" : ""}
        css={css({
          color: "rgba(255,255,255,0.86)",
          textDecoration: "none",
          display: "block",
          p: 2,
          mx: -2,
          borderRadius: "8px",
          "&:hover": {
            bg: "rgba(255,255,255,0.05)",

            h3: {
              color: "highlight"
            }
          }
        })}
      >
        <div css={css({ display: "flex", flexDirection: ["column", "row"] })}>
          {children}
        </div>
      </Component>
    </li>
  );
};

export default ({ data, ...props }) => {
  return (
    <Layout>
      <SEO title="Horacio Herrera" />
      <div
        css={css({
          margin: "auto",
          marginTop: "24px",
          marginBottom: "80px",
          display: "flex",
          alignItems: "center",
          flexDirection: ["column", "row"]
        })}
      >
        <Styled.div
          css={{
            borderRadius: "50%",
            overflow: "hidden"
          }}
        >
          <Image fixed={data.avatar.childImageSharp.fixed} />
        </Styled.div>
        <div css={css({ flex: 1, pl: 3 })}>
          <span
            css={css({ fontSize: ["2rem", "3rem"], marginBottom: 0 })}
            role="img"
            aria-label="hand waving"
          >
            👋
          </span>
          <p
            css={css({
              fontSize: ["1.2rem", "1.5rem"],
              fontWeight: 300,
              lineHeight: 1.5
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

      <Contact />

      <List title="✍🏼 Latest Posts">
        {data.recentPosts.nodes.map(
          ({ id, title, slug, tags, excerpt, parent }) => (
            <ListItem to={slug} key={id}>
              <div css={css({ flex: 1, p: 0 })}>
                <div css={css({ mb: 2 })}>
                  <Styled.h3
                    css={css({
                      color: "primary",
                      fontSize: [3, 4],
                      m: 0,
                      p: 0,
                      mb: 1,
                      "&:hover": {
                        color: "highlight"
                      }
                    })}
                  >
                    {title}
                  </Styled.h3>
                  <Styled.p css={css({ m: 0, p: 0 })}>
                    {tags.map(tag => (
                      <span
                        css={css({
                          color: "primary",
                          border: "1px solid",
                          borderColor: "primary",
                          py: "2px",
                          textTransform: "uppercase",
                          px: "8px",
                          fontSize: "10px",
                          borderRadius: "20px",
                          mr: 1,
                          my: "4px",
                          display: "inline-block"
                        })}
                      >
                        {tag}
                      </span>
                    ))}
                  </Styled.p>
                </div>
                <Styled.p css={{ margin: 0, padding: 0 }}>{excerpt}</Styled.p>
              </div>
            </ListItem>
          )
        )}
      </List>

      {/* <Contact /> */}

      {/* <List
        title="🗓️ Next Workshops & Events"
        // secondary={
        //   <Link
        //     to="/writing"
        //     css={{
        //       color: 'rgba(255,255,255,0.86)',
        //       textDecoration: 'none',
        //       alignSelf: 'flex-end',

        //       '&:hover': {
        //         textDecoration: 'underline',
        //       },
        //     }}
        //   >
        //     all posts
        //   </Link>
        // }
      >
        {data.events.nodes.map(
          ({ id, title, url, type, location, venue, date }) => (
            <li css={{ marginBottom: '2rem' }}>
              <a
                href={url}
                target="_blank"
                css={css({
                  color: 'rgba(255,255,255,0.86)',
                  textDecoration: 'none',
                  display: 'block',
                  p: 2,
                  mx: -2,
                  borderRadius: '8px',
                  '&:hover': {
                    bg: 'rgba(255,255,255,0.05)',

                    h3: {
                      color: 'highlight',
                    },
                  },
                })}
              >
                <div
                  css={css({
                    display: 'flex',
                    flexDirection: 'column',
                  })}
                >
                  <Styled.h3
                    css={css({
                      m: 0,
                      p: 0,
                      mb: 1,
                      display: 'flex',
                      flexDirection: ['column', 'row'],
                      alignItems: ['flex-start', 'center'],
                      '&:hover': {
                        color: 'highlight',
                      },
                    })}
                  >
                    <span
                      css={css({
                        px: 1,
                        py: '3px',
                        borderRadius: '4px',
                        bg: 'primary',
                        color: 'white',
                        fontWeight: '800',
                        mr: 2,
                        mb: [1, 0],
                        fontSize: 0,
                        textTransform: 'uppercase',
                      })}
                    >
                      {type}
                    </span>
                    {title}
                  </Styled.h3>
                  <Styled.p
                    css={css({
                      m: 0,
                      p: 0,
                      color: 'rgba(255,255,255,0.8)',
                    })}
                  >
                    {date} - {venue}, {location}
                  </Styled.p>
                </div>
              </a>
            </li>
          ),
        )}
      </List> */}
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
      }
    }
    events: allEventsYaml {
      nodes {
        id
        title
        location
        venue
        date(formatString: "YYYY-MM-DD")
        type
        url
      }
    }
  }
`;
