import React from "react";
import { Box, Flex } from "rebass";
import styled from "styled-components";
import { Twitter, Github, Dribbble, Email } from "site";

const ALink = styled.a`
  color: black;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

export const IconLink = ({ to, children, ...rest }) => (
  <Box {...rest} mr={4}>
    <ALink href={to} target="_blank">
      {children}
    </ALink>
  </Box>
);

export const LinksList = () => (
  <Flex>
    <IconLink to="https://twitter.com/hhg2288">
      <Twitter />
    </IconLink>
    <IconLink to="https://github.com/horacioh">
      <Github />
    </IconLink>
    <IconLink to="https://dribbble.com/horacio">
      <Dribbble />
    </IconLink>
    <IconLink to="mailto:me@hherrerag.com">
      <Email />
    </IconLink>
  </Flex>
);
