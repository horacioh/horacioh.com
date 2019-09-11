import React from 'react';
import { Styled, css } from 'theme-ui';
import BioContent from './bio-content.js';

const Bio = () => {
  return (
    <Styled.div css={css({ mb: 4 })}>
      <BioContent />
    </Styled.div>
  );
};

export default Bio;
