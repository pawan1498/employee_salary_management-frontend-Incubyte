import { CircularProgress, Paper, Typography } from "@mui/material";

export function LoadingState({ message }: { message: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 5,
        px: 3,
      }}
    >
      <CircularProgress size={22} thickness={4} />
      <Typography color="text.secondary">{message}</Typography>
    </Paper>
  );
}
