import { Autocomplete, TextField } from "@mui/material";

type ReportingCurrencySelectProps = {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  minWidth?: number;
};

export function ReportingCurrencySelect({
  label = "View in currency",
  value,
  options,
  onChange,
  minWidth = 200,
}: ReportingCurrencySelectProps) {
  return (
    <Autocomplete<string, false, true, false>
      size="small"
      options={options}
      value={value}
      onChange={(_, next) => onChange(next)}
      disableClearable
      autoHighlight
      sx={{ minWidth: { xs: "100%", sm: minWidth }, width: { xs: "100%", sm: "auto" } }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
