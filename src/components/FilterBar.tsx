import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type FilterBarProps = {
  children: ReactNode;
};

export function FilterBar({ children }: FilterBarProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "text.secondary",
          mb: 1.5,
        }}
      >
        Filters
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>{children}</Box>
    </Paper>
  );
}
