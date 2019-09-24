import React from 'react';
import { css } from 'theme-ui';
import { Link } from 'gatsby';

const nav = [
  // { displayName: 'About', url: '/about' },
  { displayName: 'Writing', url: '/writing' },
  // { displayName: 'aprendegatsby', url: 'https://aprendegatsby.com' },
  { displayName: 'newsletter', url: 'https://hhg.link/newsletter' },
];

const navLinkStyles = {
  color: 'white',
  fontWeight: 600,
  fontSize: ['.8rem', '1rem'],
  lineHeight: 1,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
};

export default function NavLinks({ styles }) {
  return (
    <nav css={{ display: 'flex' }}>
      <ul
        css={{
          listStyleType: 'none',
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          // justifyContent: 'flex-end',
        }}
      >
        {nav.map(({ displayName, url }) => {
          let child = null;
          if (/^https/.test(url)) {
            child = (
              <a href={url} css={css(navLinkStyles)}>
                {displayName}
              </a>
            );
          } else {
            child = (
              <Link to={url} css={css(navLinkStyles)}>
                {displayName}
              </Link>
            );
          }

          return (
            <li key={displayName + url} css={css({ mx: '1rem' })}>
              {child}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
