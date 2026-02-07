# Flutterwave Mobile Money Guide

This guide summarizes the mobile money payment flow and settlement timing for Flutterwave integrations in ShopDash. It is a reference only. Always verify details with the latest Flutterwave documentation before going live.

## Overview

Mobile money allows customers to pay using their mobile wallets without a bank account. The typical flow is:

1. Collect customer details (name, phone, email).
2. Create a mobile money payment method (network + phone).
3. Initiate a charge with amount, currency, and reference.
4. Customer authorizes the payment on their phone.
5. Confirm the final transaction status (webhook or API query) before fulfillment.

## Requirements

- Flutterwave account (sandbox or live)
- API keys from the Flutterwave dashboard
- Webhook URL configured for status updates

## Integration steps (summary)

1) **Create customer**
- Store name, email, phone (optional but recommended).

2) **Create payment method**
- `type: mobile_money`
- Include `country_code`, `network`, and `phone_number`.

3) **Create charge**
- Provide `amount`, `currency`, and a unique `reference`.

4) **Authorize payment**
- Customer receives a push notification or redirect to complete the payment.

5) **Verify payment**
- Use webhooks or API to confirm success before delivering goods.

## Testing

In Flutterwave sandbox, you can simulate payment flows using their scenario keys. For push notification tests, omit the scenario header. For redirect tests, use the scenario key provided in the Flutterwave testing docs.

## Settlement schedule (as provided by Flutterwave)

Local vs international settlement timing varies by country. The list below reflects the schedule you shared and should be treated as a reference.

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

- **T+1 local**: funds settle on the next business day.
- **T+5 international**: funds settle after five business days.
- Weekends and public holidays do not count as business days.
- In rare cases, international settlement may extend to T+7.

## References

- Flutterwave mobile money support list: https://flutterwave.com/ng/support/payment-methods/pay-with-mobile-money
- Flutterwave dashboard: https://app.flutterwave.com/
