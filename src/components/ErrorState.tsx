import { Box, Button, Typography } from "@mui/material";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Box sx={{ py: 4 }}>
      <Typography color="error" sx={{ mb: onRetry ? 2 : 0 }}>
        {message}
      </Typography>
      {onRetry ? (
        <Button variant="outlined" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Box>
  );
}
