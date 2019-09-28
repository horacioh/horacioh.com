import React from 'react';
import { Styled, css } from 'theme-ui';
import Helmet from 'react-helmet';
import PostFooter from './post-footer';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { MDXRenderer } from 'gatsby-plugin-mdx';

const Post = ({
  data: {
    post,
    site: {
      siteMetadata: { title },
    },
  },
  location,
  previous,
  next,
}) => {
  console.log('TCL: post', post);
  return (
    <Layout location={location} title={title}>
      <SEO title={post.title} description={post.excerpt} />
      <Helmet
        meta={[
          {
            name: `twitter:card`,
            content: 'summary_large_image',
          },
          { name: `twitter:site`, content: `@hhg2288` },
        ]}
      />

      <Styled.h1
        css={css({
          fontSize: [4, 5],
        })}
      >
        {post.title}
      </Styled.h1>
      <Styled.p
        css={css({
          fontSize: 1,
          mt: -3,
          mb: 3,
        })}
      >
        {post.date}
      </Styled.p>
      <MDXRenderer>{post.body}</MDXRenderer>
      <PostFooter {...{ previous, next }} />
    </Layout>
  );
};

export default Post;
