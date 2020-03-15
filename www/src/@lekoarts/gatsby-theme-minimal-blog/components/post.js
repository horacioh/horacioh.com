/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { MDXRenderer } from "gatsby-plugin-mdx";
import React from "react";
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout";
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags";
import SEO from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo";
import getShareImage from "../../../components/share-image";

const px = [`32px`, `16px`, `8px`, `4px`];
const shadow = px.map(v => `rgba(0, 0, 0, 0.15) 0px ${v} ${v} 0px`);

const Post = ({ data: { post } }) => {
  console.log("Post -> post", post);
  const socialImage = getShareImage({
    title: post.title,
    // tagline: tags2String(post.tags),
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
    <Layout>
      <SEO
        title={post.title}
        description={post.description ? post.description : post.excerpt}
        image={
          socialImage
            ? socialImage
            : post.banner
            ? post.banner.childImageSharp.resize.src
            : undefined
        }
      />
      <Styled.h2>{post.title}</Styled.h2>
      <p
        sx={{
          color: `secondary`,
          mt: 3,
          a: { color: `secondary` },
          fontSize: [1, 1, 2]
        }}
      >
        <time>{post.date}</time>
        {post.tags && (
          <React.Fragment>
            {` — `}
            <ItemTags tags={post.tags} />
          </React.Fragment>
        )}
        {` — `}
        <span>{post.timeToRead} min read</span>
      </p>
      <section
        sx={{
          my: 5,
          ".gatsby-resp-image-wrapper": {
            my: [4, 4, 5],
            boxShadow: shadow.join(`, `)
          }
        }}
      >
        <MDXRenderer>{post.body}</MDXRenderer>
      </section>
    </Layout>
  );
};

export default Post;
