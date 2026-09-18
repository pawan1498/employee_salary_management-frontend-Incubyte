import { Button, Paper, Typography } from "@mui/material";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Paper variant="outlined" sx={{ py: 4, px: 3 }}>
      <Typography color="error.main" sx={{ fontWeight: 500, mb: onRetry ? 2 : 0 }}>
        {message}
      </Typography>
      {onRetry ? (
        <Button variant="outlined" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Paper>
  );
}
