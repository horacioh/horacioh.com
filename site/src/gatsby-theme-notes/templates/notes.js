import React from "react";
import Breadcrumbs from "gatsby-theme-notes/src/components/breadcrumbs";
import DirectoryList from "gatsby-theme-notes/src/components/directory-list";
import FileList from "gatsby-theme-notes/src/components/file-list";
import Layout from "../../components/layout";
import theme from "../../gatsby-plugin-theme-ui";
import { css } from "theme-ui";
import { Global } from "@emotion/core";

export default ({
  pageContext: { groupedNotes, urls, breadcrumbs = [], siteTitle },
  ...props
}) => (
  <Layout {...props} title={siteTitle}>
    <div
      css={css`
        a {
          color: #50ceea;
          letter-spacing: 1px;
        }
      `}
    >
      {breadcrumbs.length ? <Breadcrumbs links={breadcrumbs} /> : null}
      <DirectoryList directories={groupedNotes} />
      <FileList files={urls} />
    </div>
  </Layout>
);
