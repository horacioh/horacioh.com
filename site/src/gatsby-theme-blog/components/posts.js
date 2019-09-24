import React from 'react';
import { css } from 'theme-ui';
import Posts from 'gatsby-theme-blog/src/components/posts';
import Helmet from 'react-helmet';
// import slugify from "@sindresorhus/slugify";

export default (props) => {
  return (
    <div
      css={css({
        maxWidth: 'container',
        mx: 'auto',
        px: 3,
        py: 4,
      })}
    >
      <Posts
        {...props}
        posts={props.posts.map(({ node }) => ({ node: { ...node, date: '' } }))}
      />
    </div>
  );
};
