import { createTheme, alpha } from "@mui/material/styles";

const primary = "#4f46e5";
const primaryDark = "#4338ca";

export const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f1f5f9",
      paper: "#ffffff",
    },
    primary: {
      main: primary,
      dark: primaryDark,
      light: "#eef2ff",
      contrastText: "#ffffff",
    },
    divider: "#e2e8f0",
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    success: {
      main: "#059669",
      light: "#ecfdf5",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Helvetica, Arial, sans-serif',
    h4: {
      fontSize: "1.75rem",
      fontWeight: 700,
      letterSpacing: "-0.03em",
      lineHeight: 1.2,
    },
    h5: {
      fontSize: "0.95rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontSize: "0.95rem",
      fontWeight: 650,
      letterSpacing: "-0.02em",
    },
    body2: {
      fontSize: "0.875rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f1f5f9",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(79, 70, 229, 0.06), transparent 28%), radial-gradient(circle at top right, rgba(14, 165, 233, 0.05), transparent 24%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "inherit",
      },
      styleOverrides: {
        root: {
          backgroundColor: alpha("#ffffff", 0.82),
          backdropFilter: "blur(12px)",
          color: "#0f172a",
          borderBottom: "1px solid #e2e8f0",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 16,
        },
        contained: {
          boxShadow: "0 1px 2px rgba(79, 70, 229, 0.24)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.24)",
          },
        },
        outlined: {
          borderColor: "#cbd5e1",
          backgroundColor: "#ffffff",
          "&:hover": {
            backgroundColor: "#f8fafc",
            borderColor: "#94a3b8",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        outlined: {
          borderColor: "#e2e8f0",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#cbd5e1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: primary,
            boxShadow: `0 0 0 3px ${alpha(primary, 0.12)}`,
          },
        },
        notchedOutline: {
          borderColor: "#e2e8f0",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#f8fafc",
          color: "#64748b",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          borderBottomColor: "#e2e8f0",
          whiteSpace: "nowrap",
        },
        body: {
          fontSize: "0.9rem",
          borderBottomColor: "#f1f5f9",
          fontVariantNumeric: "tabular-nums",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease",
          "&:last-child td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      },
    },
  },
});
