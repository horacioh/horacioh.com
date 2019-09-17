import merge from "deepmerge"
import typography from "./typography"
import colors from "./colors"

export default merge(typography, {
  // initialColorMode: `dark`,
  colors,
  fonts: {
    heading: `Montserrat, sans-serif`,
    monospace: `Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace`,
  },
  sizes: {
    container: 672,
  },
  // styles,
  // prism,
})
