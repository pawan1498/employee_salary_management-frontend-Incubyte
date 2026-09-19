import { Typography } from "@mui/material";

type NativeCurrencyNoteProps = {
  baseCurrency?: string;
  ratesAsOf?: string;
};

export function NativeCurrencyNote({ baseCurrency, ratesAsOf }: NativeCurrencyNoteProps) {
  return (
    <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mb: 3 }}>
      Each employee&apos;s <strong>base pay</strong> is the amount stored on their salary record in
      their salary currency (any Frankfurter-supported ISO code from filters).
      {baseCurrency ? (
        <>
          {" "}
          Approximate equivalents in <strong>{baseCurrency}</strong> use the exchange-rates API
          (same ECB cache as Insights)
          {ratesAsOf ? <> (rates as of {ratesAsOf})</> : null}.
        </>
      ) : (
        " Pick a reporting currency to see approximate equivalents."
      )}
    </Typography>
  );
}
