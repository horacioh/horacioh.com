import React from "react";
import { Styled, css } from "theme-ui";
import Helmet from "react-helmet";
import PostFooter from "./post-footer";
import Layout from "../../components/layout";
import SEO from "../../components/seo";
import { MDXRenderer } from "gatsby-plugin-mdx";
// import getShareImage from "@jlengstorf/get-share-image";
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

/*

https://res.cloudinary.com/demo/image/upload/w_400,h_250,c_fill,g_south/l_nice_couple,w_90,g_center,y_18,x_-20/coffee_cup.jpg


https://res.cloudinary.com/horacioh/image/upload/v1578437419/horacioh.com/social-card-base.jpg
https://res.cloudinary.com/horacioh/image/upload/w_1280,h_669,c_fill,q_auto,f_auto/w_760,c_fit,co_rgb:A6E22E,g_south_west,x_480,y_254,l_text:verb-black.otf_56:Build%20a%20Post%20activity%20log%20using%20React%20%26%20AWS%20Amplify/w_760,c_fit,co_rgb:66D9EF,g_north_west,x_480,y_445,l_text:verb-medium.otf_36:%23english%20%23tutorial%20%23React%20%23Amplify%20%23GraphQL/horacioh.com/social-card-base.jpg
aHR0cHM6Ly93d3cuaG9yYWNpb2guY29tL3N0YXRpYy80MTAwMzM3MzU0MWM4MmM0NWVmYzJkNTIyMDgzNzg0NS84MTc5Yy9jb3Zlci5qcGc

,w_100,h_100,g_south_west,x_20,y_20

https://res.cloudinary.com/horacioh/image/upload/w_1280,h_669,c_fill,q_auto,f_auto/w_760,c_fit,co_rgb:A6E22E,g_south_west,x_480,y_254,l_text:verb-black.otf_56:Build%20a%20Post%20activity%20log%20using%20React%20%26%20AWS%20Amplify/w_760,c_fit,co_rgb:66D9EF,g_north_west,x_480,y_445,l_text:verb-medium.otf_36:%23english%20%23tutorial%20%23React%20%23Amplify%20%23GraphQL/horacioh.com/social-card-base.jpg


https://res.cloudinary.com/horacioh/image/upload/l_fetch:aHR0cHM6Ly93d3cuaG9yYWNpb2guY29tL3N0YXRpYy80MTAwMzM3MzU0MWM4MmM0NWVmYzJkNTIyMDgzNzg0NS84MTc5Yy9jb3Zlci5qcGc/v1578437419/horacioh.com/social-card-base.jpg

*/
