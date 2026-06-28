# Budget Review Formula Reference

Last reviewed: June 28, 2026

This file records the formulas used by the Budget Review application so KPI and worksheet changes can be tested against a stable reference.

## Monthly Review

- Acct. = count of active Monthly Review accounts.
- Total Balance = sum of `Balance` for all active accounts.
- Available Credit Limit = sum of `Credit Limit` for Personal Credit Card accounts - sum of `Balance` for Personal Credit Card accounts.
- Total Personal Expense = sum of `Current Due` for all active accounts.
- Total Paid = sum of `Paid` amount only for active accounts marked `Paid? = Yes`.
- Remaining Unpaid = `Total Personal Expense - Total Paid`.
- Monthly Interest = for each active account with Balance and APR: `Balance * (APR / 100) / 12`, then sum the results.
- Average APR % = weighted APR for active accounts with both Balance and APR: `sum(Balance * APR) / sum(Balance)`.
- Category Due KPIs = sum of `Current Due` for active accounts in that category.
- Payment Due is past due when `Payment Due Date < today` and the account is not marked paid.

## Budget Cash Flow

- Periods This Month:
  - If `Payments / Deposits This Month` has a value, use that value.
  - If Frequency is Weekly and count is blank, use `ceil(days in selected review month / 7)`.
  - Otherwise use `1`.
- Due / Expected This Month:
  - If `Due / Expected This Month` is entered, use that value.
  - Otherwise use `Payment / Income Amount * Periods This Month`, calculated in cents and rounded to cents for display/totals.
  - This calculation does not modify the saved `Payment / Income Amount`.
- Paid / Received This Month:
  - Use only the manually entered `Paid / Received This Month` amount.
  - Blank means `$0.00`; it is not calculated from `Payment / Income Amount` or `Payments / Deposits This Month`.
- Monthly Income = sum of `Due / Expected This Month` for Income rows.
- Total Business Expense = sum of `Due / Expected This Month` for Expense rows.
- Total Business Paid = sum of `Paid / Received This Month` for Expense rows.
- Gross Profit = `Monthly Income - Total Business Expense`.
- Cash Flow (personal & business) = `Gross Profit - Monthly Review Total Personal Expense`.
- Tech Consulting Expense = sum of `Due / Expected This Month` for Expense rows in Technology Consulting Expense.
- Monthly Loan Payment = sum of `Due / Expected This Month` for Expense rows in Loan.
- Business Credit Card = sum of `Due / Expected This Month` for Expense rows in Business Credit Card.
- Software Expense = sum of `Due / Expected This Month` for Expense rows in Software Subscription and ZOHO Subscription.
- Monthly Interest = for Loan, Cash Advance Loan, and Business Credit Card rows: `(Total Owed or Principal Still Due) * (APR / 100) / 12`, then sum the results.
- Available Credit Limit = for Budget Cash Flow Business Credit Card rows: `sum(Credit Limit) - sum(Total Owed)`.
- Total Balance = `Business Credit Card Total Owed + Loan Total Owed`.
- Average APR % = weighted APR for Budget Cash Flow rows with both principal balance and APR: `sum((Principal Still Due or Total Owed) * APR) / sum(Principal Still Due or Total Owed)`.
- Payments Remaining estimate = amortized payment count using principal, payment amount, APR, and payment frequency. If APR is blank, use `ceil(Principal / Payment Amount)`.
- APR and Payments Remaining display on financing expense rows: Business Credit Card, Business loan, Cash Advance Loan, Loan, Personal Credit Card, and Personal Loan.
- Next Month loan carry-forward = each current month Loan or Cash Advance Loan ending balance becomes the next month `Principal Still Due`; payments/deposits, paid/received, and last payment date are cleared.

## Row Display Rules

- Expense rows use the red-tinted Type cell.
- Income rows use the green-tinted Type cell.
- Expense rows that are not financing rows hide APR % and Payments Remaining values; rows that are not Loan, Cash Advance Loan, or Business Credit Card hide Monthly Interest values.
- Income rows hide APR %, Payments Remaining, and Monthly Interest values.
- Budget Cash Flow Account Directory is separate from the Monthly Review Account Directory.
- Budget Cash Flow month label currently displays `July 1, 2026 - July 31, 2026`.
- Budget Cash Flow Account Name is the editable row/account name field.
- Budget Cash Flow Credit Limit is saved in Account Details and shown in the worksheet before Actions.

## Current Test Totals

Using the local app data available during this review:

- Monthly Review Total Personal Expense: `$2,536.64`
- Monthly Review Total Paid: `$1,195.00`
- Monthly Review Remaining Unpaid: `$1,341.64`
- Monthly Review Acct.: `19`
- Monthly Review Total Balance: `$71,298.46`
- Monthly Review Monthly Interest: `$703.75`
- Average APR: `12.4%`
- Budget Cash Flow Acct.: `18`
- Budget Cash Flow Monthly Income: `$8,575.00`
- Budget Cash Flow Total Business Expense: `$7,769.52`
- Budget Cash Flow Income Received Month to Date: `$0.00`
- Budget Cash Flow Total Business Paid: `$0.00`
- Budget Cash Flow Gross Profit: `$805.48`
- Budget Cash Flow Business Credit Card: `$294.00`
- Budget Cash Flow Cash Flow: `-$1,731.16`
- Budget Cash Flow Monthly Interest: `$474.58`
- Budget Cash Flow Available Credit Limit: `$1,283.67`
- Total Balance: `$50,264.26`
- Budget Cash Flow Average APR: `11.4%`
