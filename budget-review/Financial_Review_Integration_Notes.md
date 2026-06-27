# Budget Review Integration Notes

The Budget Review web app now supports the weekly Personal and Business Financial Review workflow in two ways:

1. `Print Financial Review PDF`
   - Opens a print-ready Budget Financial Review page.
   - Use the browser print dialog to save it as a PDF or include it with the weekly PDF package.

2. `Export Financial Review Data`
   - Downloads a structured JSON file named `budget-financial-review-YYYY-MM.json`.
   - This file contains review totals, category summaries, account balances, APR percentages, estimated monthly interest, due dates, planned payments, and notes.

Interest estimate:

`Estimated Monthly Interest = Balance x APR / 12`

This is an estimate for review and planning. Actual interest may differ based on lender rules, daily balance methods, grace periods, fees, promotional APRs, and payment timing.

