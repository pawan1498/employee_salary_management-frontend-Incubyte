import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
  display: "block",
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

const drawerNavLinkSx = {
  ...navLinkSx,
  px: 2,
  py: 1.25,
  borderRadius: 2,
  fontSize: "1rem",
};

function MenuIcon() {
  return (
    <Box component="span" sx={{ display: "grid", gap: "5px", width: 20 }}>
      {[0, 1, 2].map((line) => (
        <Box
          key={line}
          component="span"
          sx={{ height: 2, borderRadius: 1, bgcolor: "text.primary" }}
        />
      ))}
    </Box>
  );
}

function NavLinks({ sx, onNavigate }: { sx: typeof navLinkSx; onNavigate?: () => void }) {
  return (
    <>
      <Box component={NavLink} to="/" end sx={sx} onClick={onNavigate}>
        Insights
      </Box>
      <Box component={NavLink} to="/employees" sx={sx} onClick={onNavigate}>
        Employees
      </Box>
    </>
  );
}

export function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 64 } }}>
            {isMobile ? (
              <IconButton
                edge="start"
                aria-label="Open navigation menu"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            ) : null}

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
                flexShrink: 0,
              }}
            >
              HR
            </Box>
            <Typography
              variant="h6"
              sx={{
                mr: { xs: 0, sm: 2 },
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1rem", sm: "1.25rem" },
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Salary Management
            </Typography>

            {!isMobile ? (
              <Box component="nav" sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
                <NavLinks sx={navLinkSx} />
              </Box>
            ) : null}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 260,
            pt: 1,
            px: 1.5,
          },
        }}
      >
        <Typography
          sx={{
            px: 2,
            py: 1.5,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Navigation
        </Typography>
        <Box component="nav" sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <NavLinks sx={drawerNavLinkSx} onNavigate={closeDrawer} />
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
