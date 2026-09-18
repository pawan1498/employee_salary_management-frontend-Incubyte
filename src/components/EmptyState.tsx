import { Typography } from "@mui/material";

export function EmptyState({ message }: { message: string }) {
  return (
    <Typography color="text.secondary" sx={{ py: 4 }}>
      {message}
    </Typography>
  );
}
