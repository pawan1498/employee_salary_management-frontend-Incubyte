import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";

const navLinkSx = {
  color: "inherit",
  textDecoration: "none",
  fontSize: "0.95rem",
  px: 1.5,
  py: 0.5,
  borderBottom: "2px solid transparent",
  "&.active": {
    borderBottomColor: "common.white",
    fontWeight: 600,
  },
};

export function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ gap: 3 }}>
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 2, fontWeight: 600 }}>
            HR Salary Management
          </Typography>
          <Box component="nav" sx={{ display: "flex", gap: 1 }}>
            <Box component={NavLink} to="/" end sx={navLinkSx}>
              Insights
            </Box>
            <Box component={NavLink} to="/employees" sx={navLinkSx}>
              Employees
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
