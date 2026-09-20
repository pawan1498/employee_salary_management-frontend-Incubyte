import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "flex-start" },
        justifyContent: "space-between",
        gap: 2,
        mb: { xs: 2.5, sm: 3 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}>{action}</Box> : null}
    </Box>
  );
}
