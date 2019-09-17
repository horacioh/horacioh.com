import React from "react"
import { Link } from "gatsby"
import { css, Styled } from "theme-ui"
// import Switch from "gatsby-theme-blog/src/components/switch"
import Bio from "./bio"
// import sun from "../../../content/assets/sun.png"
// import moon from "../../../content/assets/moon.png"
import Logo from '../../components/logo'

const rootPath = `${__PATH_PREFIX__}/`

const Title = ({ children, location }) => {
  if (location.pathname === rootPath) {
    return (
      <Styled.h1
        css={css({
          my: 0,
          fontSize: 4,
        })}
      >
        <Styled.a
          as={Link}
          css={{
            color: `inherit`,
            boxShadow: `none`,
            textDecoration: `none`,
          }}
          to={`/`}
        >
          {children}
        </Styled.a>
      </Styled.h1>
    )
  } else {
    return (
      <Styled.h3
        as="p"
        css={css({
          my: 0,
        })}
      >
        <Styled.a
          as={Link}
          css={css({
            boxShadow: `none`,
            textDecoration: `none`,
            color: `primary`,
          })}
          to={`/`}
        >
          {children}
        </Styled.a>
      </Styled.h3>
    )
  }
}

export default ({ children, title, ...props }) => {
  // const [colorMode, setColorMode] = useColorMode()
  // const isDark = colorMode === `dark`
  // const toggleColorMode = e => {
  //   setColorMode(isDark ? `light` : `dark`)
  // }

  return (
    <header>
      <div
        css={css({
          maxWidth: `container`,
          mx: `auto`,
          px: 3,
          pt: 4,
        })}
      >
        <div
          css={css({
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
            mb: 3,
          })}
        >
          <Title {...props}>
            <Logo />
          </Title>
          {children}
          {/* <Switch
            aria-label="Toggle dark mode"
            css={css({
              bg: `black`,
            })}
            checkedIcon={checkedIcon}
            uncheckedIcon={uncheckedIcon}
            checked={isDark}
            onChange={toggleColorMode}
          /> */}
        </div>
        {props.location.pathname === rootPath && <Bio />}
      </div>
    </header>
  )
}
