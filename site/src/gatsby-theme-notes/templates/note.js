import React from "react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import Layout from "../../components/layout";
import { graphql } from "gatsby";

export const pageQuery = graphql`
  query($id: String!, $title: String) {
    note: mdx(id: { eq: $id }) {
      id
      body
    }
    image: ogImage {
      src(text: $title)
    }
    site: site {
      siteMetadata {
        title
      }
    }
  }
`;

const WikiPage = ({
  data: {
    note,
    site: {
      siteMetadata: { title }
    }
  },
  ...props
}) => (
  <Layout {...props} title={title}>
    {console.log(note)}
    <MDXRenderer>{note.body}</MDXRenderer>
  </Layout>
);

export default WikiPage;
