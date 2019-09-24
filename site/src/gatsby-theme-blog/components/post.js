import React from 'react';
import { css } from 'theme-ui';
import Post from 'gatsby-theme-blog/src/components/post';
import Helmet from 'react-helmet';
// import slugify from "@sindresorhus/slugify";

export default (props) => {
  const newProps = props;
  newProps.data.post.date = '';
  return (
    <div
      css={css({
        maxWidth: 'container',
        mx: 'auto',
        px: 3,
        py: 4,
      })}
    >
      <Post {...newProps} />
      <Helmet
        meta={[
          {
            name: `twitter:card`,
            content: 'summary_large_image',
          },
          // {
          //   name: `twitter:image`,
          //   content: `https://www.christopherbiscardi.com/blog-post-images/${slugify(
          //     props.data.post.title
          //   )}.png`
          // },
          { name: `twitter:site`, content: `@hhg2288` },
        ]}
      />
    </div>
  );
};
