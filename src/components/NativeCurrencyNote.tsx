import { Typography } from "@mui/material";
import { formatDate } from "../format";

type NativeCurrencyNoteProps = {
  baseCurrency?: string;
  ratesAsOf?: string;
};

export function NativeCurrencyNote({ baseCurrency, ratesAsOf }: NativeCurrencyNoteProps) {
  return (
    <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mb: 3 }}>
      Each employee&apos;s salary is stored in the currency they are paid in.
      {baseCurrency ? (
        <>
          {" "}
          Choose <strong>{baseCurrency}</strong> below to see estimated equivalents and compare pay
          across countries
          {ratesAsOf ? <> (rates updated {formatDate(ratesAsOf)})</> : null}.
        </>
      ) : (
        " Choose a currency below to compare salaries across countries."
      )}
    </Typography>
  );
}
