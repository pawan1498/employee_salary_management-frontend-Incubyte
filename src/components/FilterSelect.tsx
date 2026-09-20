import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

type FilterSelectProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  minWidth?: number;
};

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  minWidth = 200,
}: FilterSelectProps) {
  return (
    <FormControl
      size="small"
      sx={{
        minWidth: { xs: "100%", sm: minWidth },
        width: { xs: "100%", sm: "auto" },
      }}
    >
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        <MenuItem value="">All</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
