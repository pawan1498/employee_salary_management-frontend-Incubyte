import { Box, CircularProgress, Typography } from "@mui/material";

export function LoadingState({ message }: { message: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 6 }}>
      <CircularProgress size={22} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
