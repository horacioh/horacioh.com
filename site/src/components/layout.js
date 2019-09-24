import React from 'react';
import Header from './header';
import Footer from './footer';
import { Styled, css } from 'theme-ui';
import { Global } from '@emotion/core';

export default function Layout({ children, ...props }) {
  return (
    <Styled.root>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
        `}
      />
      <div
        css={css({
          maxWidth: 'container',
          mx: 'auto',
          px: 3,
          py: 4,
        })}
      >
        <Header />
        <main css={css({ my: 4 })}>{children}</main>
        <Footer />
      </div>
    </Styled.root>
  );
}
