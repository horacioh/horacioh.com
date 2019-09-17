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
    <Styled.p>
      Hola! my name is <b>Horacio Herrera</b>, Designer & Developer consultant from Panama living in Barcelona. I help companies build great products and websites.
    </Styled.p>
    <Styled.p>I'm also a coach on <a href="https://hhg.link/rgqla" target="_blank">React GraphQL academy</a> since 2017 & I'm fortunate enough to teach React, Redux & GraphQL to many designers & developers looking for a shift in their professional careers.</Styled.p>
    <LinksList />
  </Fragment>
)
