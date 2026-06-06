# Home Shopping Feature — Guide & Test Plan

This document walks through each new component of the Home Shopping Sales & Returns feature and provides a step-by-step test for each.

---

## 1. What's in this release

| Area | What it does |
|---|---|
| **Corporations** | Every TV station (affiliate) can be linked to one or more "corporations" — a Broadcast Group, MSO, or Network. 

-


| **Insertion Order** | When creating an IO, you can pick a corporation and either apply it to all of that corporation's stations or pick specific ones. 

client reply: when the user selects one or more TV station linked to a corporation can you put the corporation name next to the TV station (or MSO/network) name?  Right now the drop down is working great but having the corporation name would help. 


| **Affiliate Report** | New "Corporations (links)" column shows which corps each station belongs to. 

Done 


| **Corporation reports** | Broadcast Group / MSO / Network pages now have an "Affiliates" count column and an expandable row showing the linked stations. 

client reply: How come when I view Bridge News in https://app.consumerexp.com/broadcast-group-names-report – it says zero (“0” affiliates count?



| **Sales & Returns import** | The existing sales import now also handles returns (negative amounts), rejects orphan returns missing identifying info, and supports four fee modes (payout-per-order, cash-buy, fixed %, and tiered). 

client reply: Next week I will create a test file for sales and returns so we can test these new functions. Just as long as you know how to delete the test file. 


| **Home Shopping report** | New page `/reports/home-shopping` with three tabs: Detail (14 canonical columns), Household Summary, and Vendor / Station / Market. Includes Excel export, drag-drop columns on Detail, date-range presets, saved reports, and weekly/monthly auto-emails. 

client reply: Excellent job. 


| **Customer list** | New Affiliates and Campaigns columns on `/customer-list-all-types` linked to filtered views of the related pages. 

client reply: Excellent job 










## 2. Feature-by-feature test guide

### 2.1 Corporation entity (foundation)

**What:** Broadcast Group / MSO / Network are now treated as "corporations" of three types, sharing a single pivot table that links them to affiliates.

**Test:**

1. Go to `/broadcast-group-names-form` → add "Nexstar" (or any name).
2. Go to `/mso-names-form` → add "Comcast".
3. Go to `/network-names-form` → add "CBS".
4. Open `/add-affiliate` → scroll to the **Corporations (multi-link)** picker. The dropdown should list all three corporations grouped by type.

---

### 2.2 Affiliate ↔ Corporation multi-link

**What:** A station can belong to multiple corporations (e.g. a Sinclair station that also carries CBS programming).

**Test:**

1. `/add-affiliate` → fill in basics → in the Corporations picker pick **Nexstar** + **CBS** → Submit.
2. `/affiliate-report` → find the new row → click the edit (pencil) icon → modal opens → the same two corps are preselected.
3. In the modal, remove CBS and add Comcast → Save.
4. Re-open edit → confirm Nexstar + Comcast preselected.

---

### 2.3 Affiliate Report "Corporations (links)" column

**What:** Visible column on the Affiliate Report showing the comma-separated corps each station is linked to.

**Test:**

1. `/affiliate-report` → confirm the new column appears.
2. If you don't see it, click the eye icon (column settings) → toggle "Corporations (links)" on.
3. Edit a station, change its corp links, save → table refreshes with the new value.

---

### 2.4 Broadcast Group / MSO / Network drilldown

**What:** Each corporation report shows how many stations are linked to it, with an expandable row to view the list.

**Test:**

1. `/broadcast-group-names-report` → confirm new "Affiliates" count column.
2. Click the arrow on the left of any row → an inner table opens listing affiliate name + market.
3. Same on `/mso-names-report` and `/network-names-report`.

---

### 2.5 Insertion Order — Corporation picker + Apply-to-all

**What:** When creating an IO, picking a corporation lets you target either all of its affiliates with one checkbox or a specific subset.

**Test:**

1. `/insertion-order/create` → pick a Campaign + Customer.
2. Below those, the **Corporation** dropdown appears. Pick "Nexstar" (or any seeded corp).
3. The Affiliates list refreshes to show only stations linked to that corporation.
4. Check the **Apply to all affiliates of this corporation** box → the multi-select disables and auto-selects every station in the list.
5. Uncheck → pick a subset manually.
6. Submit → IO created.

> **Note:** When a corporation is picked, the Codes/Phones list falls back to the campaign + customer pair (instead of being filtered by individual affiliate). This is intentional — corp-only affiliates may not have their own codes/phones rows yet.

---

### 2.6 Insertion Order list — Attached Affiliates column

**What:** The IO list now shows every affiliate attached to each IO, including IOs created in customer mode (which previously stored only a customer reference).

**Test:**

1. After creating the IO in 2.5, go to `/insertion-order`.
2. Confirm the new **Attached Affiliates** column shows the comma-separated station list.
3. If hidden by column settings, toggle it on via the eye icon.

---

### 2.7 Home Shopping report — filters, tabs, columns

#### Tabs

| Tab | What you see |
|---|---|
| **Detail** | One row per sale/return. 14-column canonical layout. Returns flagged red. Drag-drop columns to reorder (saved per user). |
| **Household Summary** | Rows grouped by household (ANI + ship zip + ship city + ship state + channel). One row per household with gross/returns/net. |
| **Vendor / Station / Market** | Rows grouped by market + station. Shows net sales, fees, sale/return counts. |

All three tabs show **Create Date** as the leftmost column (upload date).

#### Buttons

* **Generate Report** — runs the query and fills the table.
* **Export to Excel** — downloads `home_shopping_<Tab>_<timestamp>.xlsx` containing the current rows + a Summary block.
* **Save Report** — opens the save modal (see 2.9).

#### Drag-drop column reorder (Detail tab only)

1. On Detail tab, click and drag any column header to a new position → order updates.
2. Refresh the page → order persists for your user.
3. Log in as a different user → original default order (per-user saved).

---

### 2.8 Saved Reports + auto-email recurrence

**What:** Save filter combinations by name; optionally schedule a weekly or monthly auto-email to a list of recipients.

#### Test: save & reload
1. Set filters (e.g. Customer = Brux, Market = NYC, date = This Month).
2. Click **Save Report** → enter name "Brux NYC Weekly" → leave recurrence blank → Save.
3. Page reloads → "Saved Reports" row shows a chip with the name.
4. Change filters → click the chip → filters restore to the saved state, including which tab.


#### Test: auto-email (weekly/monthly)
1. Save a new report with Frequency = **Weekly** + Recipients = `you@example.com, other@example.com`.
2. The chip shows an envelope icon next to the name.
3. Manually run the cron command on a Monday: `php artisan reports:run-scheduled-home-shopping`.
4. Recipients receive an email titled "Home Shopping Report: <name>" with a summary block (Gross / Returns / Net / Fees / Net Revenue).
5. Re-run the same day → command is idempotent (won't double-send).
6. For monthly, same flow but it fires only on the 1st of each month.

---

### 2.9 Customer list hyperlinks

**What:** `/customer-list-all-types` now shows Affiliates count and Campaigns count for each customer, both as clickable links.

**Test:**

1. Open `/customer-list-all-types`.
2. Confirm two new columns: **Affiliates** and **Campaigns**.
3. Counts equal what you'll see after clicking:
   - Affiliate count = active affiliates linked to that customer via ecommerce_affiliates.
   - Campaign count = campaigns whose customer_id matches OR campaigns linked via ecommerce_affiliates.
4. Click "X affiliates" → navigates to `/affiliate-report?filterByCustomer=<id>`. Blue banner shows "Showing affiliates for customer: <name>" with a **Clear filter** link.
5. Click "X campaigns" → navigates to `/ecommerce-campaigns?customer=<id>` with the same banner.
6. Click **Clear filter** on either page → banner gone, full list returns.

---



