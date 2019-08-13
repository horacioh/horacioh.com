import React from "react";
import { Box, Flex } from "rebass";
import styled from "styled-components";
import { Twitter, Github, Dribbble, Email, Youtube } from "site";

const ALink = styled.a`
  color: black;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

export const IconLink = ({ to, icon, ...rest }) => (
  <Box mr={4} {...rest}>
    <ALink href={to} target="_blank">
      {icon}
    </ALink>
  </Box>
);

export const LinksList = () => (
  <Flex>
    <IconLink to="https://www.youtube.com/channel/UC-MHIQayBciRoA4HXx873jg" icon={<Youtube />} />
    <IconLink to="https://twitter.com/hhg2288" icon={<Twitter />} />
    <IconLink to="https://github.com/horacioh" icon={<Github />} />
    <IconLink to="https://dribbble.com/horacio" icon={<Dribbble />} />
    <IconLink to="mailto:me@hherrerag.com" icon={<Email />} />
  </Flex>
);
