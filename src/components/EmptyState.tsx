import { Paper, Typography } from "@mui/material";

export function EmptyState({ message }: { message: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        py: 4,
        px: 3,
        bgcolor: "rgba(255, 255, 255, 0.7)",
      }}
    >
      <Typography color="text.secondary">{message}</Typography>
    </Paper>
  );
}
