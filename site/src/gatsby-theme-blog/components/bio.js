import React, { Fragment } from 'react';
import { Styled, css } from 'theme-ui';

/**
 * Shadow me to add your own bio content
 */

export default () => (
  <Fragment>
    (Words by | Palabras de){' '}
    <Styled.a
      css={css({ display: 'inline-block', mb: 4 })}
      href="https://hhg.link/twitter"
    >
      Horacio Herrera
    </Styled.a>
    .
  </Fragment>
);
