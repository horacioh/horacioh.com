import React from 'react';
import { css, Styled, Flex } from 'theme-ui';
import { Twitter, Github, Dribbble, Email, Youtube, Twitch } from './icons';

export const IconLink = ({ to, icon, ...rest }) => (
  <div
    css={css({
      mr: 4
    })}
    {...rest}
  >
    <Styled.a
      css={css({
        color: 'primary',
        textDecoration: 'none',
        fontWeight: 'bold',
        ':hover': {
          textDecoration: 'underline'
        }
      })}
      href={to}
      target="_blank"
    >
      {icon}
    </Styled.a>
  </div>
);

export const LinksList = () => (
  <Flex>
    <IconLink to="https://hhg.link/stream" icon={<Twitch />} />
    <IconLink to="https://hhg.link/youtube" icon={<Youtube />} />
    <IconLink to="https://hhg.link/" icon={<Twitter />} />
    <IconLink to="https://hhg.link/github" icon={<Github />} />
    <IconLink to="https://hhg.link/dribbble" icon={<Dribbble />} />
    <IconLink to="mailto:hi@horacioh.com" icon={<Email />} />
  </Flex>
);
