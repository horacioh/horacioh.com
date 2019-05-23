import React from "react";
import { Text } from "rebass";
import styled from 'styled-components'

const ALink = styled.a`
  color: black;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`


export const TextLink = ({ to, children, ...rest }) => (
  <Text fontSize={[3, 4]} {...rest}>
    <ALink href={to}>
      {children}
    </ALink>
  </Text>
);

const links = [
  {
    label: "Twitter",
    value: "https://twitter.com/hhg2288"
  },
  {
    label: "Github",
    value: "https://github.com/horacioh"
  },
  {
    label: "Dribbble",
    value: "https://dribbble.com/horacio"
  },
  {
    label: "Email",
    value: "mailto:me@hherrerag.com"
  }
];

export const LinksList = () => (
  <div style={{ fontSize: 24 }}>
    <ul>
      {links.map(({ label, value }) => (
        <li>
          <TextLink to={value}>{label}</TextLink>
        </li>
      ))}
    </ul>
  </div>
);
