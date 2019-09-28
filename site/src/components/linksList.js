import React from 'react';
import { css, Styled, Flex } from 'theme-ui';
import * as Icons from './icons';

const socialStyles = {
  twitter: { backgroundColor: '#00aced', color: '#eef1f7' },
  twitch: { backgroundColor: '#6441a5', color: '#eef1f7' },
  youtube: { backgroundColor: '#c4302b', color: '#eef1f7' },
  github: { backgroundColor: '#eef1f7', color: 'black' },
};

export function IconLink({ to, icon, ...rest }) {
  const Icon = Icons[icon];
  return (
    <div
      css={css({
        mr: 4,
        mb: 2,
      })}
    >
      <Styled.a
        css={css({
          color: 'primary',
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          ':hover': {
            color: 'highlight',
          },
        })}
        href={to}
        target="_blank"
        {...rest}
      >
        <Icon />
        {/* <span css={css({ ml: 1 })}>{icon}</span> */}
      </Styled.a>
    </div>
  );
}

export function LinksList() {
  return (
    <Flex
      css={{
        flexWrap: 'wrap',
      }}
    >
      <IconLink
        aria-label="go to my streamings"
        to="https://hhg.link/stream"
        icon="Twitch"
      />
      <IconLink
        aria-label="go to my Youtube channel"
        to="https://hhg.link/youtube"
        icon="Youtube"
      />
      <IconLink
        aria-label="go to my Twitter account (@hhg2288)"
        to="https://hhg.link/twitter"
        icon="Twitter"
      />
      <IconLink
        aria-label="go to my Github profile (horacioh)"
        to="https://hhg.link/github"
        icon="Github"
      />
      <IconLink
        aria-label="go to my Dribbble Profile (horacio)"
        to="https://hhg.link/dribbble"
        icon="Dribbble"
      />
      <IconLink
        aria-label="send me an email (hi@horacioh.com)"
        to="mailto:hi@horacioh.com"
        icon="Email"
      />
    </Flex>
  );
}
