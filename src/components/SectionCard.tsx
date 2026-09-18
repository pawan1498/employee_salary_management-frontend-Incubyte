import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
        rowGap: 1.5,
        columnGap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function DetailLabel({ children }: { children: ReactNode }) {
  return (
    <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
      {children}
    </Typography>
  );
}

export function DetailValue({ children }: { children: ReactNode }) {
  return <Typography sx={{ fontWeight: 500 }}>{children}</Typography>;
}
