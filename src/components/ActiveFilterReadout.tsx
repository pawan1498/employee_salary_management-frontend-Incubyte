import { Box, Chip, Link, Typography } from "@mui/material";

type ActiveFilter = {
  label: string;
  onRemove: () => void;
};

type ActiveFilterReadoutProps = {
  filters: ActiveFilter[];
  emptyMessage: string;
  onClearAll?: () => void;
};

export function ActiveFilterReadout({
  filters,
  emptyMessage,
  onClearAll,
}: ActiveFilterReadoutProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
        mb: 3,
        minHeight: 32,
      }}
    >
      {filters.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          {emptyMessage}
        </Typography>
      ) : (
        <>
          {filters.map((filter) => (
            <Chip key={filter.label} label={filter.label} size="small" onDelete={filter.onRemove} />
          ))}
          {onClearAll ? (
            <Link
              component="button"
              type="button"
              onClick={onClearAll}
              sx={{ fontSize: "0.875rem", ml: 0.5 }}
            >
              Clear filters
            </Link>
          ) : null}
        </>
      )}
    </Box>
  );
}
