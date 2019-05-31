import React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
export { LinksList } from './src/components/LinksList'

const Page = props => {
  return (
    <>
      <Helmet>
        <link
          rel='icon'
          type='image/png'
          href='https://horacioh.com/favicon.png'
        />
        <link
          rel='apple-touch-icon-precomposed'
          href='https://horacioh.com/avatar.png'
        />
        <meta
          name='twitter:site'
          content='@hhg2288'
        />
        <meta name='twitter:image' content='https://horacioh.com/avatar.png' />
      </Helmet>
      {props.children}
    </>
  )
}



export const BlockQuote = styled.blockquote`
  margin: 0;
  padding: 16px;
  background-color: whitesmoke;
  border-radius: 6px;
  margin-bottom: 32px;

  p {
    margin: 0;
    padding: 0;
  }
`

export const List = styled.div`
  ul {
    margin: 0 0 32px 0;
    padding: 0 0 0 24px;
    font-size: 18px;
  }
  

  li {
    margin: 0;
    padding: 0;
  }
`

export const wrapPageElement = ({ element, props }) =>
  <Page {...props}>
    {element}
  </Page>
