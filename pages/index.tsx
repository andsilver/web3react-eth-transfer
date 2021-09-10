import Connect from "../components/connect"
import { ThemeProvider } from "@material-ui/core";
import { theme } from "../theme";

export default function () {
  return (
    <ThemeProvider theme={theme}>
      <Connect />
    </ThemeProvider>
  )
}