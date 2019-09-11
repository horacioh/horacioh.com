import React, { Fragment } from "react"
import { Styled, css } from "theme-ui"
import { LinksList } from "../../components/linksList"

/**
 * Change the content to add your own bio
 */

export default () => (
  <Fragment>
    <Styled.p css={css({
      fontSize: 5,
      mb: 0
    })}><span role="img" aria-label="wave emoji">👋</span></Styled.p>
    <Styled.h3>I'm Horacio Herrera, Designer & Developer consultant from Panama living in Barcelona. I help companies develop digital products that users want.</Styled.h3>
    <LinksList />
  </Fragment>
)
