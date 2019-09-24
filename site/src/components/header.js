import React from 'react';
import NavLinks from './navLinks';
import { css, Flex } from 'theme-ui';
import Logo from './logo';

export default function Header(props) {
  return (
    <Flex
      as="header"
      css={css({
        maxWidth: 'container',
        margin: 'auto',
        marginTop: '24px',
        justifyContent: ['center', 'space-between'],
        alignItems: ['center'],
        flexDirection: ['column', 'row'],
      })}
    >
      <div css={css({ mb: [3, 0] })}>
        <a
          href="/"
          css={css({ color: 'white', '&:hover': { color: 'highlight' } })}
        >
          <Logo />
        </a>
      </div>
      <NavLinks />
    </Flex>
  );
}
