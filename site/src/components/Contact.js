import React from 'react';
import { css, Flex, Styled } from 'theme-ui';

export default function Contact() {
  return (
    <div
      css={css({
        mb: '5rem',
        py: 3,
        px: [2, 3],
        mx: [0, 0, -3],
        border: '2px solid',
        borderColor: 'highlight',
        borderRadius: '1rem',
        fontSize: '1.2rem',
        textAlign: ['center', 'left'],
      })}
    >
      <Styled.h2>How can I help?</Styled.h2>
      <p css={css({ mb: 2 })}>
        Help is what I do, <b>Is in my blood.</b> You need a website, and app,
        you are building your startup, you need more developers, you need a
        job... you name it.
      </p>
      <p css={css({ mb: 2 })}>
        <b css={css({ color: 'highlight' })}>just shoot me and email</b>, I'm
        happy to help in any way I can.
      </p>
      <Flex
        css={css({
          alignItems: 'center',
          flexDirection: ['column', 'row'],
        })}
      >
        <a
          css={css({
            color: 'background',
            bg: 'highlight',
            fontWeight: 600,
            fontSize: ['.8rem', '1rem'],
            lineHeight: 1,
            textDecoration: 'none',
            py: 2,
            px: 3,
            my: [3, 2],
            pl: 2,
            fontSize: '1.1rem',
            borderRadius: '0.3rem',
            '&:hover': {},
          })}
          href="mailto:hi@horacioh.com"
          target="_blank"
        >
          <span>👉</span>
          hi@horacioh.com
        </a>
        <p
          css={css({
            fontSize: '0.8rem',
            color: 'highlight',
            mx: 2,
          })}
        >
          available for new projects starting November!
        </p>
      </Flex>
    </div>
  );
}
