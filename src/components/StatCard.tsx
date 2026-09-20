import { Paper, Typography } from "@mui/material";

type StatCardProps = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        minWidth: 0,
        height: "100%",
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
        background:
          "linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(255, 255, 255, 1) 55%)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontSize: { xs: "1.35rem", sm: "2.125rem" } }}>
        {value}
      </Typography>
    </Paper>
  );
}
