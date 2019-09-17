import React from 'react';
import { css, Styled, Flex } from 'theme-ui';
import { Twitter, Github, Dribbble, Email, Youtube, Twitch } from './icons';

export function IconLink({ to, icon, ...rest }) {
  return (
    <div
      css={css({
        mr: 4,
        mb: 2
      })}
    >
      <Styled.a
        css={css({
          color: 'primary',
          textDecoration: 'none',
          fontWeight: 'bold',
          ':hover': {
            textDecoration: 'underline',
          },
        })}
        href={to}
        target="_blank"
        {...rest}
      >
        {icon}
      </Styled.a>
    </div>
  );
}

export function LinksList() {
  return (
    <Flex css={{
      flexWrap: "wrap",
    }}>
      <IconLink
        aria-label="go to my streamings"
        to="https://hhg.link/stream"
        icon={<Twitch />}
      />
      <IconLink
        aria-label="go to my Youtube channel"
        to="https://hhg.link/youtube"
        icon={<Youtube />}
      />
      <IconLink
        aria-label="go to my Twitter account (@hhg2288)"
        to="https://hhg.link/"
        icon={<Twitter />}
      />
      <IconLink
        aria-label="go to my Github profile (horacioh)"
        to="https://hhg.link/github"
        icon={<Github />}
      />
      <IconLink
        aria-label="go to my Dribbble Profile (horacio)"
        to="https://hhg.link/dribbble"
        icon={<Dribbble />}
      />
      <IconLink
        aria-label="send me an email (hi@horacioh.com)"
        to="mailto:hi@horacioh.com"
        icon={<Email />}
      />
    </Flex>
  );
}
