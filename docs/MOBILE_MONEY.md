# Mobile Money (Flutterwave)

This is a concise reference for mobile money payments with Flutterwave. Always verify the latest details in Flutterwave docs before going live.

## Summary

- Collect customer details (name, phone, email).
- Create a mobile money payment method (network + phone).
- Create a charge (amount, currency, unique reference).
- Customer authorizes on their phone.
- Verify the final status before fulfillment (webhook or API).

## Requirements

- Flutterwave account (sandbox or live)
- API keys from the Flutterwave dashboard
- Webhook URL configured

## Settlement schedule (reference)

| Country | Local Payments | International Payments |
| --- | --- | --- |
| Cameroon | Next business day (T+1) | 5 business days (T+5) |
| Egypt | Next business day (T+1) | 5 business days (T+5) |
| Ghana | Next business day (T+1) | 5 business days (T+5) |
| Kenya | Next business day (T+1) | 5 business days (T+5) |
| Nigeria | Next business day (T+1) | 5 business days (T+5) |
| Rwanda | Next business day (T+1) | 5 business days (T+5) |
| Senegal | Next business day (T+1) | 5 business days (T+5) |
| Tanzania | Next business day (T+1) | 5 business days (T+5) |
| Uganda | Next business day (T+1) | 5 business days (T+5) |
| Rest of Africa | Next business day (T+1) | 5 business days (T+5) |
| United Kingdom | Next business day (T+1) | 5 business days (T+5) |
| United States | Next business day (T+1) | 5 business days (T+5) |

### Timing notes

- T+1 local: funds settle on the next business day.
- T+5 international: funds settle after five business days.
- Weekends and public holidays do not count as business days.
- In rare cases, international settlement may extend to T+7.

## References

- Flutterwave mobile money support list: https://flutterwave.com/ng/support/payment-methods/pay-with-mobile-money
- Flutterwave dashboard: https://app.flutterwave.com/
