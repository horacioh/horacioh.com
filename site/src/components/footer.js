import React from "react";
import { css } from "theme-ui";
import NavLinks from "./navLinks";

export default function Footer() {
  return (
    <footer
      css={css({
        variant: "styles.footer",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        py: 2,
        px: 0,
        justifyContent: "space-between"
      })}
    >
      <NavLinks />
      <div sx={css({ p: 2 })}>© {new Date().getFullYear()} Horacio Herrera</div>
    </footer>
  );
}
