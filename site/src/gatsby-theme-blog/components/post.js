import React from "react";
import { Styled, css } from "theme-ui";
import PostFooter from "./post-footer";
import Layout from "../../components/layout";
import SEO from "../../components/seo";
import { MDXRenderer } from "gatsby-plugin-mdx";
import getShareImage from "../../utils/get-share-image";

function tags2String(tags) {
  const res = tags.map(tag => `#${tag}`).join(" ");
  return res;
}

const Post = ({
  data: {
    post,
    site: {
      siteMetadata: { title }
    }
  },
  location,
  previous,
  next
}) => {
  const socialImage = getShareImage({
    title: post.title,
    tagline: tags2String(post.tags),
    cloudName: "horacioh",
    imagePublicID: "horacioh.com/post-card.jpg",
    font: "verb-black.otf",
    titleFont: "verb-black.otf",
    taglineFont: "verb-medium.otf",
    titleFontSize: 56,
    taglineFontSize: 36,
    titleColor: "A6E22E",
    taglineColor: "66D9EF"
  });

  return (
    <Layout location={location} title={title}>
      <SEO title={post.title} description={post.excerpt} image={socialImage} />
      <Styled.h1
        css={css({
          fontSize: [4, 5]
        })}
      >
        {post.title}
      </Styled.h1>
      <Styled.p
        css={css({
          fontSize: 1,
          mt: -3,
          mb: 3
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
