import { Box, Button, Paper, Typography } from "@mui/material";

type PaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, perPage, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        mt: 2.5,
        px: { xs: 1.5, sm: 2 },
        py: 1.5,
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem", textAlign: { xs: "center", sm: "left" } }}>
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
        <Button variant="outlined" size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem", minWidth: 96, textAlign: "center" }}>
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </Box>
    </Paper>
  );
}
