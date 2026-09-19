import { Typography } from "@mui/material";
import { formatAmount } from "../format";
import { convertToBaseCurrency } from "../utils/convertSalary";

type SalaryAmountDisplayProps = {
  amount: string;
  currency: string;
  baseCurrency: string;
  rates: Record<string, string> | null;
  variant: "base" | "approx";
  align?: "left" | "right";
};

export function SalaryAmountDisplay({
  amount,
  currency,
  baseCurrency,
  rates,
  variant,
  align = "right",
}: SalaryAmountDisplayProps) {
  const converted =
    rates && baseCurrency
      ? convertToBaseCurrency(amount, currency, baseCurrency, rates)
      : null;
  const nativeMatchesReporting = currency === baseCurrency;

  if (variant === "base") {
    return (
      <Typography
        component="div"
        sx={{ textAlign: align, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
      >
        {formatAmount(amount, currency)}
        <Typography component="span" color="text.secondary" sx={{ fontSize: "0.75rem", ml: 0.75 }}>
          {currency}
        </Typography>
      </Typography>
    );
  }

  if (nativeMatchesReporting) {
    return (
      <Typography component="div" color="text.secondary" sx={{ textAlign: align }}>
        —
      </Typography>
    );
  }

  if (!converted) {
    return (
      <Typography component="div" color="text.secondary" sx={{ textAlign: align }}>
        —
      </Typography>
    );
  }

  return (
    <Typography
      component="div"
      sx={{ textAlign: align, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "text.secondary" }}
    >
      {formatAmount(converted, baseCurrency)}
    </Typography>
  );
}
