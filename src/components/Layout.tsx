import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";

const navLinkSx = {
  color: "text.secondary",
  textDecoration: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
  px: 1.75,
  py: 0.85,
  borderRadius: 999,
  transition: "all 0.15s ease",
  "&:hover": {
    color: "text.primary",
    backgroundColor: "rgba(15, 23, 42, 0.04)",
  },
  "&.active": {
    color: "primary.main",
    backgroundColor: "primary.light",
    fontWeight: 650,
  },
};

export function Layout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 64 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "-0.02em",
                mr: 0.5,
              }}
            >
              HR
            </Box>
            <Typography variant="h6" sx={{ mr: 2, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Salary Management
            </Typography>
            <Box component="nav" sx={{ display: "flex", gap: 0.5 }}>
              <Box component={NavLink} to="/" end sx={navLinkSx}>
                Insights
              </Box>
              <Box component={NavLink} to="/employees" sx={navLinkSx}>
                Employees
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
