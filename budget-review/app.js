const STORAGE_KEY = "mk-budget-review-v1";
const LOCAL_DATA_API = "/api/budget-data";
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const categoryDueKpis = [
  { category: "Business Credit Card", selector: "#businessCreditCardDue" },
  { category: "Personal Credit Card", selector: "#personalCreditCardDue" },
  { category: "Personal Loan", selector: "#personalLoanDue" },
  { category: "Tax", selector: "#taxDue" },
  { category: "Business loan", selector: "#businessLoanDue" },
];

const categories = [
  "Business Credit Card",
  "Business loan",
  "Entertainment",
  "Misc. Credit",
  "Personal Credit Card",
  "Personal Loan",
  "Rent",
  "Tax",
  "Utilities",
];

const seedAccounts = [
  account("Utilities", "Blaze", "", 74),
  account("Utilities", "Eversource", "", 112),
  account("Utilities", "Xfinity", "", 111),
  account("Entertainment", "DirecTV", "", 125),
  account("Rent", "Rent", "", 1130),
  account("Personal Credit Card", "Credit One", "1151", 30),
  account("Personal Credit Card", "Credit One", "9308", 64),
  account("Personal Credit Card", "Credit One", "8788", 64),
  account("Personal Credit Card", "First Savings Credit Card", "", 91),
  account("Misc. Credit", "Affirm", "", 38),
  account("Personal Credit Card", "Aspire", "", 64.02),
  account("Personal Credit Card", "Avant", "", 0),
  account("Personal Loan", "Best Egg - Loan", "", 503.57),
  account("Personal Loan", "Best Egg", "", 87.81),
  account("Tax", "IRS", "", 401),
  account("Personal Credit Card", "AMEX", "", 138),
  account("Personal Loan", "Figure", "", 361.82),
  account("Personal Credit Card", "Gap", "", 35),
];

const reviewColumns = [
  { key: "active", label: "Active", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "name", label: "Account", sortable: true },
  { key: "open", label: "Open", sortable: false },
  { key: "balance", label: "Balance", sortable: true },
  { key: "creditLimit", label: "Credit Limit", sortable: true },
  { key: "interestRate", label: "APR %", sortable: true },
  { key: "estimatedMonthlyInterest", label: "Monthly Interest", sortable: true },
  { key: "currentDue", label: "Current Due", sortable: true },
  { key: "amountUpdatedDate", label: "Amount Updated", sortable: true },
  { key: "paymentDueDate", label: "Payment Due", sortable: true },
  { key: "plannedPayment", label: "Paid", sortable: true },
  { key: "paid", label: "Paid?", sortable: true },
  { key: "paymentDate", label: "Payment Date", sortable: true },
  { key: "notes", label: "Notes", sortable: true },
];

const defaultColumnOrder = reviewColumns.map((column) => column.key);
const cashFlowColumns = [
  { key: "type", label: "Type", sortable: true, className: "type-column" },
  { key: "category", label: "Category", sortable: true, className: "category-column" },
  { key: "name", label: "Account Name", sortable: true, className: "name-column" },
  { key: "website", label: "Website", sortable: false },
  { key: "totalOwed", label: "Total Owed", sortable: true },
  { key: "principalDue", label: "Principal Due", sortable: true },
  { key: "frequency", label: "Frequency", sortable: true },
  { key: "paymentAmount", label: "Payment / Income Amount", sortable: true },
  { key: "paymentsThisMonth", label: "Payments / Deposits This Month", sortable: true, className: "count-column" },
  { key: "totalDue", label: "Due / Expected This Month", sortable: true },
  { key: "totalPaid", label: "Paid / Received This Month", sortable: true },
  { key: "paymentsRemaining", label: "Payments Remaining", sortable: true, className: "remaining-column" },
  { key: "interestRate", label: "APR %", sortable: true, className: "apr-column" },
  { key: "monthlyInterest", label: "Monthly Interest", sortable: true },
  { key: "startDate", label: "Start Date", sortable: true },
  { key: "endDate", label: "End Date", sortable: true },
  { key: "lastPaymentDate", label: "Last Payment Date", sortable: true },
  { key: "notes", label: "Notes", sortable: true, className: "notes-column" },
  { key: "creditLimit", label: "Credit Limit", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];
const defaultCashFlowColumnOrder = cashFlowColumns.map((column) => column.key);
const cashFlowNumericFields = new Set(["totalOwed", "principalDue", "creditLimit", "paymentAmount", "paymentsThisMonth", "totalDue", "totalPaid", "paymentsRemaining", "interestRate"]);
const cashFlowCategories = [
  "Business Credit Card",
  "Business loan",
  "Cash Advance Loan",
  "Customer Fees",
  "Entertainment",
  "Loan",
  "Misc. Credit",
  "Personal Credit Card",
  "Personal Loan",
  "Rent",
  "Software Subscription",
  "Tax",
  "Technology Consulting Expense",
  "Utilities",
  "ZOHO Subscription",
];
const cashFlowTypes = ["Expense", "Income"];
const cashFlowFrequencies = ["Monthly", "Weekly", "One Time"];

const seedCashFlowItems = [
  cashFlowItem("Expense", "Technology Consulting Expense", "Technology consulting expense"),
  cashFlowItem("Expense", "ZOHO Subscription", "ZOHO Subscription"),
  cashFlowItem("Expense", "Software Subscription", "Software Subscription"),
  cashFlowItem("Expense", "Loan", "Business loan"),
  cashFlowItem("Expense", "Cash Advance Loan", "Cash advance loan"),
  cashFlowItem("Income", "Customer Fees", "Customer fee"),
];

const state = loadState();
let localDataFileReady = false;
let localDataFileSaveTimer = 0;

const els = {
  pageTitle: document.querySelector("#pageTitle"),
  navTabs: document.querySelectorAll(".nav-tab"),
  reviewMonth: document.querySelector("#reviewMonth"),
  searchInput: document.querySelector("#searchInput"),
  saveDataBtn: document.querySelector("#saveDataBtn"),
  categoryFilter: document.querySelector("#categoryFilter"),
  addAccountBtn: document.querySelector("#addAccountBtn"),
  newMonthBtn: document.querySelector("#newMonthBtn"),
  saveSnapshotBtn: document.querySelector("#saveSnapshotBtn"),
  printFinancialReviewBtn: document.querySelector("#printFinancialReviewBtn"),
  exportFinancialReviewBtn: document.querySelector("#exportFinancialReviewBtn"),
  exportJsonBtn: document.querySelector("#exportJsonBtn"),
  importJsonInput: document.querySelector("#importJsonInput"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
  reviewHead: document.querySelector("#reviewHead"),
  reviewRows: document.querySelector("#reviewRows"),
  cashFlowHead: document.querySelector("#cashFlowHead"),
  nextCashFlowMonthBtn: document.querySelector("#nextCashFlowMonthBtn"),
  addCashFlowItemBtn: document.querySelector("#addCashFlowItemBtn"),
  cashFlowRows: document.querySelector("#cashFlowRows"),
  cashFlowProfitMetric: document.querySelector("#cashFlowProfitMetric"),
  cashFlowProfit: document.querySelector("#cashFlowProfit"),
  cashFlowAccountKpi: document.querySelector("#cashFlowAccountKpi"),
  cashFlowTechExpense: document.querySelector("#cashFlowTechExpense"),
  cashFlowMonthlyLoan: document.querySelector("#cashFlowMonthlyLoan"),
  cashFlowBusinessCreditCard: document.querySelector("#cashFlowBusinessCreditCard"),
  cashFlowSoftware: document.querySelector("#cashFlowSoftware"),
  cashFlowIncomeReceived: document.querySelector("#cashFlowIncomeReceived"),
  cashFlowBusinessPaid: document.querySelector("#cashFlowBusinessPaid"),
  cashFlowIncomeStillDue: document.querySelector("#cashFlowIncomeStillDue"),
  cashFlowMonthlyInterest: document.querySelector("#cashFlowMonthlyInterest"),
  cashFlowAvailableCreditLimit: document.querySelector("#cashFlowAvailableCreditLimit"),
  cashFlowRemainingLoanBalance: document.querySelector("#cashFlowRemainingLoanBalance"),
  cashFlowAverageApr: document.querySelector("#cashFlowAverageApr"),
  cashFlowCashNeeds: document.querySelector("#cashFlowCashNeeds"),
  cashFlowGrossProfitMetric: document.querySelector("#cashFlowGrossProfitMetric"),
  cashFlowGrossProfit: document.querySelector("#cashFlowGrossProfit"),
  cashFlowAccountForm: document.querySelector("#cashFlowAccountForm"),
  cashFlowFormTitle: document.querySelector("#cashFlowFormTitle"),
  resetCashFlowFormBtn: document.querySelector("#resetCashFlowFormBtn"),
  deleteCashFlowAccountBtn: document.querySelector("#deleteCashFlowAccountBtn"),
  cashFlowAccountCards: document.querySelector("#cashFlowAccountCards"),
  cashFlowAccountCount: document.querySelector("#cashFlowAccountCount"),
  accountCards: document.querySelector("#accountCards"),
  notActiveRows: document.querySelector("#notActiveRows"),
  notActiveCount: document.querySelector("#notActiveCount"),
  historyList: document.querySelector("#historyList"),
  calendarList: document.querySelector("#calendarList"),
  accountCount: document.querySelector("#accountCount"),
  form: document.querySelector("#accountForm"),
  formTitle: document.querySelector("#formTitle"),
  resetFormBtn: document.querySelector("#resetFormBtn"),
  deleteAccountBtn: document.querySelector("#deleteAccountBtn"),
  monthDateRange: document.querySelector("#monthDateRange"),
  monthlyDueLabel: document.querySelector("#monthlyDueLabel"),
  totalCurrentDue: document.querySelector("#totalCurrentDue"),
  totalPlanned: document.querySelector("#totalPlanned"),
  totalRemaining: document.querySelector("#totalRemaining"),
  totalBalance: document.querySelector("#totalBalance"),
  availableCreditLimit: document.querySelector("#availableCreditLimit"),
  totalMonthlyInterest: document.querySelector("#totalMonthlyInterest"),
  averageApr: document.querySelector("#averageApr"),
  monthlyAccountCount: document.querySelector("#monthlyAccountCount"),
  categoryDueKpis: categoryDueKpis.map((item) => ({
    ...item,
    element: document.querySelector(item.selector),
  })),
  toast: document.querySelector("#toast"),
};

const formFields = {
  id: document.querySelector("#editingId"),
  active: document.querySelector("#accountActive"),
  category: document.querySelector("#accountCategory"),
  name: document.querySelector("#accountName"),
  hint: document.querySelector("#accountHint"),
  url: document.querySelector("#accountUrl"),
  username: document.querySelector("#accountUsername"),
  vault: document.querySelector("#accountVault"),
  balance: document.querySelector("#accountBalance"),
  creditLimit: document.querySelector("#accountCreditLimit"),
  interestRate: document.querySelector("#accountInterestRate"),
  currentDue: document.querySelector("#accountCurrentDue"),
  amountUpdatedDate: document.querySelector("#accountAmountUpdated"),
  paymentDueDate: document.querySelector("#accountPaymentDue"),
  plannedPayment: document.querySelector("#accountPlanned"),
  paid: document.querySelector("#accountPaid"),
  paymentDate: document.querySelector("#accountPaymentDate"),
  notes: document.querySelector("#accountNotes"),
};

const cashFlowFormFields = {
  id: document.querySelector("#editingCashFlowId"),
  type: document.querySelector("#cashFlowType"),
  category: document.querySelector("#cashFlowCategory"),
  name: document.querySelector("#cashFlowName"),
  url: document.querySelector("#cashFlowUrl"),
  username: document.querySelector("#cashFlowUsername"),
  vault: document.querySelector("#cashFlowVault"),
  contactName: document.querySelector("#cashFlowContactName"),
  contactEmail: document.querySelector("#cashFlowContactEmail"),
  contactPhone: document.querySelector("#cashFlowContactPhone"),
  totalOwed: document.querySelector("#cashFlowTotalOwed"),
  principalDue: document.querySelector("#cashFlowPrincipalDue"),
  creditLimit: document.querySelector("#cashFlowCreditLimit"),
  frequency: document.querySelector("#cashFlowFrequency"),
  paymentAmount: document.querySelector("#cashFlowPaymentAmount"),
  paymentsThisMonth: document.querySelector("#cashFlowPaymentsThisMonth"),
  totalDue: document.querySelector("#cashFlowTotalDue"),
  totalPaid: document.querySelector("#cashFlowTotalPaid"),
  paymentsRemaining: document.querySelector("#cashFlowPaymentsRemaining"),
  interestRate: document.querySelector("#cashFlowInterestRate"),
  startDate: document.querySelector("#cashFlowStartDate"),
  endDate: document.querySelector("#cashFlowEndDate"),
  lastPaymentDate: document.querySelector("#cashFlowLastPaymentDate"),
  notes: document.querySelector("#cashFlowNotes"),
};

function account(category, name, hint, amount) {
  return {
    id: crypto.randomUUID(),
    active: true,
    category,
    name,
    hint,
    url: "",
    username: "",
    vault: "",
    balance: "",
    creditLimit: "",
    interestRate: "",
    latestMonthlyAmount: amount,
    currentDue: amount,
    amountUpdatedDate: "",
    paymentDueDate: "",
    plannedPayment: amount,
    paid: false,
    paymentDate: "",
    notes: "",
  };
}

function cashFlowItem(type, category, name) {
  return {
    id: crypto.randomUUID(),
    type,
    category,
    name,
    totalOwed: "",
    principalDue: "",
    creditLimit: "",
    frequency: category === "Customer Fees" || category === "Cash Advance Loan" ? "Weekly" : "Monthly",
    paymentAmount: "",
    paymentsThisMonth: "",
    totalDue: "",
    totalPaid: "",
    paymentsRemaining: "",
    interestRate: "",
    url: "",
    username: "",
    vault: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    startDate: "",
    endDate: "",
    lastPaymentDate: "",
    notes: "",
  };
}

function loadState() {
  const fallback = {
    reviewMonth: new Date().toISOString().slice(0, 7),
    accounts: seedAccounts,
    history: [],
    reviewColumnOrder: defaultColumnOrder,
    reviewSort: { key: "", direction: "asc" },
    cashFlowItems: seedCashFlowItems,
    cashFlowColumnOrder: defaultCashFlowColumnOrder,
    cashFlowSort: { key: "", direction: "asc" },
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return normalizeStateData({ ...fallback, ...parsed });
  } catch {
    return fallback;
  }
}

function saveState(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueLocalDataFileSave();
  if (message) showToast(message);
}

function normalizeStateData(data) {
  return {
    reviewMonth: data.reviewMonth || CURRENT_MONTH,
    accounts: Array.isArray(data.accounts) ? data.accounts : seedAccounts,
    history: Array.isArray(data.history) ? data.history : [],
    reviewColumnOrder: normalizeColumnOrder(data.reviewColumnOrder),
    reviewSort: normalizeReviewSort(data.reviewSort),
    cashFlowItems: normalizeCashFlowItems(data.cashFlowItems),
    cashFlowColumnOrder: normalizeCashFlowColumnOrder(data.cashFlowColumnOrder),
    cashFlowSort: normalizeCashFlowSort(data.cashFlowSort),
  };
}

function applyStateData(data) {
  Object.assign(state, normalizeStateData(data));
}

function canUseLocalDataFile() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

async function loadLocalDataFile() {
  if (!canUseLocalDataFile()) return false;
  try {
    const response = await fetch(LOCAL_DATA_API, { cache: "no-store" });
    if (response.status === 404) return false;
    if (!response.ok) throw new Error(`Local data load failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.accounts)) return false;
    applyStateData(data);
    if (!initialHashMonth) state.reviewMonth = CURRENT_MONTH;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
    fillForm();
    showToast("Loaded local data file.");
    return true;
  } catch (error) {
    console.warn(error);
    showToast("Local data file was not available; browser backup is being used.");
    return false;
  }
}

async function saveLocalDataFile() {
  if (!localDataFileReady || !canUseLocalDataFile()) return false;
  try {
    const response = await fetch(LOCAL_DATA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!response.ok) throw new Error(`Local data save failed: ${response.status}`);
    return true;
  } catch (error) {
    console.warn(error);
    showToast("Could not save local data file.");
    return false;
  }
}

function queueLocalDataFileSave() {
  if (!localDataFileReady || !canUseLocalDataFile()) return;
  window.clearTimeout(localDataFileSaveTimer);
  localDataFileSaveTimer = window.setTimeout(saveLocalDataFile, 350);
}

async function startLocalDataFileSync() {
  const loaded = await loadLocalDataFile();
  localDataFileReady = true;
  saveLocalDataFile();
}

async function saveBudgetDataNow() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.clearTimeout(localDataFileSaveTimer);
  const savedFile = await saveLocalDataFile();
  showToast(savedFile || !canUseLocalDataFile() ? "Budget Review and Cash Flow saved." : "Saved in browser. Local data file was not available.");
}

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function activeAccounts() {
  return state.accounts.filter((item) => item.active);
}

function notActiveAccounts() {
  return state.accounts.filter((item) => !item.active);
}

function filteredAccounts() {
  const query = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  return state.accounts.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const haystack = `${item.name} ${item.category} ${item.hint} ${item.notes}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function filteredReviewAccounts() {
  const accounts = filteredAccounts().filter((item) => item.active);
  const sort = state.reviewSort;
  if (!sort?.key) return accounts;
  const direction = sort.direction === "desc" ? -1 : 1;
  accounts.sort((a, b) => compareSortValue(a, b, sort.key) * direction);
  return accounts;
}

function sortedCashFlowItems() {
  const items = state.cashFlowItems.slice();
  const sort = state.cashFlowSort;
  if (!sort?.key) return items;
  const direction = sort.direction === "desc" ? -1 : 1;
  items.sort((a, b) => compareCashFlowSortValue(a, b, sort.key) * direction);
  return items;
}

function compareSortValue(a, b, key) {
  const numericFields = new Set(["balance", "creditLimit", "interestRate", "estimatedMonthlyInterest", "currentDue", "plannedPayment"]);
  const booleanFields = new Set(["active", "paid"]);
  if (key === "estimatedMonthlyInterest") return estimatedMonthlyInterest(a) - estimatedMonthlyInterest(b);
  if (numericFields.has(key)) return numberValue(a[key]) - numberValue(b[key]);
  if (booleanFields.has(key)) return Number(a[key]) - Number(b[key]);
  return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, { numeric: true, sensitivity: "base" });
}

function compareCashFlowSortValue(a, b, key) {
  const numericFields = new Set([
    "totalOwed",
    "principalDue",
    "creditLimit",
    "paymentAmount",
    "paymentsThisMonth",
    "totalDue",
    "totalPaid",
    "paymentsRemaining",
    "interestRate",
    "monthlyInterest",
  ]);
  if (key === "totalDue") return cashFlowDue(a) - cashFlowDue(b);
  if (key === "totalPaid") return cashFlowPaid(a) - cashFlowPaid(b);
  if (key === "paymentsRemaining") return numberValue(cashFlowPaymentsRemaining(a)) - numberValue(cashFlowPaymentsRemaining(b));
  if (key === "monthlyInterest") return cashFlowMonthlyInterest(a) - cashFlowMonthlyInterest(b);
  if (numericFields.has(key)) return numberValue(a[key]) - numberValue(b[key]);
  return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, { numeric: true, sensitivity: "base" });
}

function normalizeColumnOrder(order) {
  const known = new Set(defaultColumnOrder);
  const safe = Array.isArray(order) ? order.filter((key) => known.has(key)) : [];
  return [...safe, ...defaultColumnOrder.filter((key) => !safe.includes(key))];
}

function normalizeReviewSort(sort) {
  const known = new Set(defaultColumnOrder);
  if (!sort || !known.has(sort.key)) return { key: "", direction: "asc" };
  return { key: sort.key, direction: sort.direction === "desc" ? "desc" : "asc" };
}

function normalizeCashFlowColumnOrder(order) {
  const known = new Set(defaultCashFlowColumnOrder);
  const safe = Array.isArray(order) ? order.filter((key) => known.has(key)) : [];
  if (safe.includes("name") && !safe.includes("website")) {
    safe.splice(safe.indexOf("name") + 1, 0, "website");
  }
  if (!safe.includes("creditLimit") && safe.includes("actions")) {
    safe.splice(safe.indexOf("actions"), 0, "creditLimit");
  }
  return [...safe, ...defaultCashFlowColumnOrder.filter((key) => !safe.includes(key))];
}

function normalizeCashFlowSort(sort) {
  const known = new Set(defaultCashFlowColumnOrder);
  if (!sort || !known.has(sort.key)) return { key: "", direction: "asc" };
  return { key: sort.key, direction: sort.direction === "desc" ? "desc" : "asc" };
}

function normalizeCashFlowItems(items) {
  const source = Array.isArray(items) && items.length ? items : seedCashFlowItems;
  return source.map((item) => ({
    id: item.id || crypto.randomUUID(),
    type: cashFlowTypes.includes(item.type) ? item.type : (item.category === "Customer Fees" ? "Income" : "Expense"),
    category: cashFlowCategories.includes(item.category) ? item.category : cashFlowCategories[0],
    name: item.name || "",
    totalOwed: item.totalOwed ?? "",
    principalDue: item.principalDue ?? "",
    creditLimit: item.creditLimit ?? "",
    frequency: cashFlowFrequencies.includes(item.frequency) ? item.frequency : "Monthly",
    paymentAmount: item.paymentAmount ?? "",
    paymentsThisMonth: item.paymentsThisMonth ?? "",
    totalDue: item.totalDue ?? "",
    totalPaid: item.totalPaid ?? "",
    paymentsRemaining: item.paymentsRemaining ?? "",
    interestRate: item.interestRate ?? "",
    url: item.url || "",
    username: item.username || "",
    vault: item.vault || "",
    contactName: item.contactName || "",
    contactEmail: item.contactEmail || "",
    contactPhone: item.contactPhone || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    lastPaymentDate: item.lastPaymentDate || "",
    notes: item.notes || "",
    monthlyReviewData: item.monthlyReviewData || null,
  }));
}

function renderCategoryOptions() {
  els.categoryFilter.innerHTML = ["All", ...categories].map((name) => `<option>${escapeHtml(name)}</option>`).join("");
  formFields.category.innerHTML = categories.map((name) => `<option>${escapeHtml(name)}</option>`).join("");
  cashFlowFormFields.type.innerHTML = cashFlowTypes.map((name) => `<option>${escapeHtml(name)}</option>`).join("");
  cashFlowFormFields.category.innerHTML = cashFlowCategories.map((name) => `<option>${escapeHtml(name)}</option>`).join("");
  cashFlowFormFields.frequency.innerHTML = cashFlowFrequencies.map((name) => `<option>${escapeHtml(name)}</option>`).join("");
}

function renderTotals() {
  const accounts = activeAccounts();
  const totalCurrentDue = sumCurrentDue(accounts);
  const totalPaid = sumTotalPaid(accounts);
  const totalRemaining = totalCurrentDue - totalPaid;
  const totalBalance = accounts.reduce((sum, item) => sum + numberValue(item.balance), 0);
  const totalMonthlyInterest = accounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0);
  els.monthlyDueLabel.textContent = "Total Personal Expense";
  els.monthDateRange.textContent = monthDateRangeLabel(state.reviewMonth);
  els.monthlyAccountCount.textContent = accounts.length;
  els.totalCurrentDue.textContent = money(totalCurrentDue);
  els.totalPlanned.textContent = money(totalPaid);
  els.totalRemaining.textContent = money(totalRemaining);
  els.totalBalance.textContent = money(totalBalance);
  els.availableCreditLimit.textContent = money(availablePersonalCreditLimit(accounts));
  els.totalMonthlyInterest.textContent = money(totalMonthlyInterest);
  els.averageApr.textContent = formatPercent(weightedAverageApr(accounts));
  els.categoryDueKpis.forEach(({ category, element }) => {
    const categoryAccounts = accounts.filter((item) => item.category === category);
    if (element) element.textContent = money(sumCurrentDue(categoryAccounts));
  });
}

function renderReview() {
  const columns = state.reviewColumnOrder
    .map((key) => reviewColumns.find((column) => column.key === key))
    .filter(Boolean);
  els.reviewHead.innerHTML = columns.map((column) => {
    const sorted = state.reviewSort.key === column.key;
    const sortLabel = sorted ? (state.reviewSort.direction === "desc" ? " down" : " up") : "";
    return `<th draggable="true" data-column="${column.key}" class="${sorted ? "sorted" : ""}" title="Drag to reorder. Click to sort.">
      <button class="column-sort" type="button" data-column="${column.key}" ${column.sortable ? "" : "disabled"}>${escapeHtml(column.label)}${sortLabel}</button>
    </th>`;
  }).join("");

  const rows = filteredReviewAccounts().map((item) => {
    return `
      <tr data-id="${item.id}">
        ${columns.map((column) => renderReviewCell(item, column.key)).join("")}
      </tr>
    `;
  }).join("");
  els.reviewRows.innerHTML = rows || `<tr><td colspan="${columns.length}" class="muted">No accounts match the current filters.</td></tr>`;
}

function renderReviewCell(item, key) {
  const openUrl = normalizeUrl(item.url);
  const cells = {
    active: `<td><select data-field="active"><option value="true"${item.active ? " selected" : ""}>Yes</option><option value="false"${!item.active ? " selected" : ""}>No</option></select></td>`,
    category: `<td><select data-field="category">${categories.map((name) => `<option${name === item.category ? " selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></td>`,
    name: `<td><div class="readonly-cell">${escapeHtml(item.name)}</div></td>`,
    open: `<td>${openUrl
      ? `<a class="open-link" href="${escapeAttr(openUrl)}" target="_blank" rel="noopener">Open</a>`
      : `<button class="link-button" type="button" data-add-url="${item.id}">Add URL</button>`}</td>`,
    balance: `<td class="money readonly-cell">${item.balance === "" ? "" : money(item.balance)}</td>`,
    creditLimit: `<td class="money readonly-cell">${item.creditLimit === "" || item.creditLimit === undefined ? "" : money(item.creditLimit)}</td>`,
    interestRate: `<td class="money readonly-cell">${formatPercent(item.interestRate)}</td>`,
    estimatedMonthlyInterest: `<td class="money readonly-cell">${estimatedMonthlyInterest(item) ? money(estimatedMonthlyInterest(item)) : ""}</td>`,
    currentDue: `<td><div class="money-input"><span>$</span><input data-field="currentDue" type="number" step="0.01" min="0" value="${escapeAttr(item.currentDue)}"></div></td>`,
    amountUpdatedDate: `<td><input data-field="amountUpdatedDate" type="date" value="${escapeAttr(item.amountUpdatedDate)}"></td>`,
    paymentDueDate: `<td><input class="${isPastDue(item) ? "past-due" : ""}" data-field="paymentDueDate" type="date" value="${escapeAttr(item.paymentDueDate)}"></td>`,
    plannedPayment: `<td><div class="money-input"><span>$</span><input data-field="plannedPayment" type="number" step="0.01" min="0" value="${escapeAttr(item.plannedPayment)}"></div></td>`,
    paid: `<td><select data-field="paid"><option value="false"${!item.paid ? " selected" : ""}>No</option><option value="true"${item.paid ? " selected" : ""}>Yes</option></select></td>`,
    paymentDate: `<td><input data-field="paymentDate" type="date" value="${escapeAttr(item.paymentDate)}"></td>`,
    notes: `<td><textarea data-field="notes" rows="1">${escapeHtml(item.notes)}</textarea></td>`,
  };
  return cells[key] || "<td></td>";
}

function renderAccountCards() {
  els.accountCount.textContent = `${state.accounts.length} accounts`;
  els.accountCards.innerHTML = filteredAccounts().sort(compareAccountName).map((item) => `
    <article class="account-card">
      <header>
        <div>
          <h4>${escapeHtml(item.name)}</h4>
          <div class="muted">Last updated ${escapeHtml(formatShortDate(item.amountUpdatedDate) || "not set")}</div>
          <div class="muted">${escapeHtml(item.hint || "No account hint")}</div>
        </div>
        <span class="tag${item.active ? "" : " empty"}">${item.active ? escapeHtml(item.category) : "Not Active"}</span>
      </header>
      <div class="muted">Current due ${money(item.currentDue)} · Balance ${money(item.balance)} · Credit limit ${item.creditLimit === "" || item.creditLimit === undefined ? "not set" : money(item.creditLimit)} · Monthly interest ${money(estimatedMonthlyInterest(item))}</div>
      <div class="row-actions">
        <button type="button" data-edit="${item.id}">Edit</button>
        ${normalizeUrl(item.url) ? `<a class="open-link" href="${escapeAttr(normalizeUrl(item.url))}" target="_blank" rel="noopener">Open website</a>` : `<span class="muted">No URL saved</span>`}
        <label class="move-control">Move
          <select data-move-account="${item.id}">
            <option value="">Monthly Review</option>
            <option value="cashFlow">Budget Cash Flow</option>
          </select>
        </label>
      </div>
    </article>
  `).join("");
}

function renderCashFlowAccountCards() {
  els.cashFlowAccountCount.textContent = `${state.cashFlowItems.length} accounts`;
  els.cashFlowAccountCards.innerHTML = state.cashFlowItems
    .slice()
    .sort(compareAccountName)
    .map((item) => {
      const openUrl = normalizeUrl(item.url);
      return `
        <article class="account-card">
          <header>
            <div>
              <h4>${escapeHtml(item.name || "Unnamed cash flow account")}</h4>
              <div class="muted">${escapeHtml(item.category)} · ${escapeHtml(item.type)}</div>
              <div class="muted">Due this month ${money(cashFlowDue(item))} · Paid ${money(cashFlowPaid(item))}</div>
            </div>
            <span class="tag${item.type === "Income" ? "" : " empty"}">${escapeHtml(item.type)}</span>
          </header>
          <div class="muted">APR ${escapeHtml(formatPercent(item.interestRate) || "not set")} · Contact ${escapeHtml(item.contactName || "not set")} · Payments remaining ${escapeHtml(cashFlowPaymentsRemaining(item) || "not set")}</div>
          <div class="row-actions">
            <button type="button" data-edit-cash-flow-account="${item.id}">Edit details</button>
            ${openUrl ? `<a class="open-link" href="${escapeAttr(openUrl)}" target="_blank" rel="noopener">Open website</a>` : `<span class="muted">No URL saved</span>`}
            <label class="move-control">Move
              <select data-move-cash-flow-account="${item.id}">
                <option value="">Budget Cash Flow</option>
                <option value="review">Monthly Review</option>
              </select>
            </label>
          </div>
        </article>
      `;
    }).join("");
}

function renderNotActiveAccounts() {
  const accounts = filteredAccounts().filter((item) => !item.active);
  els.notActiveCount.textContent = `${accounts.length} accounts`;
  els.notActiveRows.innerHTML = accounts.map((item) => {
    const openUrl = normalizeUrl(item.url);
    return `
      <tr data-id="${item.id}">
        <td><strong>${escapeHtml(item.name)}</strong><div class="muted">${escapeHtml(item.hint || "")}</div></td>
        <td>${escapeHtml(item.category)}</td>
        <td>${openUrl ? `<a class="open-link" href="${escapeAttr(openUrl)}" target="_blank" rel="noopener">Open</a>` : `<span class="muted">No URL</span>`}</td>
        <td class="money">${item.balance === "" ? "" : money(item.balance)}</td>
        <td class="money">${item.creditLimit === "" || item.creditLimit === undefined ? "" : money(item.creditLimit)}</td>
        <td>${formatPercent(item.interestRate)}</td>
        <td class="money">${item.currentDue === "" ? "" : money(item.currentDue)}</td>
        <td>${escapeHtml(item.amountUpdatedDate || "")}</td>
        <td class="${isPastDue(item) ? "past-due" : ""}">${escapeHtml(item.paymentDueDate || "")}</td>
        <td class="money">${item.plannedPayment === "" ? "" : money(item.plannedPayment)}</td>
        <td>${item.paid ? "Yes" : "No"}</td>
        <td>${escapeHtml(item.paymentDate || "")}</td>
        <td>${escapeHtml(item.username || item.vault || "")}</td>
        <td>${escapeHtml(item.notes || "")}</td>
        <td>
          <div class="row-actions compact-actions">
            <button type="button" data-edit-inactive="${item.id}">Edit</button>
            <button type="button" data-reactivate="${item.id}">Make Active</button>
          </div>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="15" class="muted">No inactive accounts match the current filters.</td></tr>`;
}

function renderCashFlow() {
  renderCashFlowKpis();

  const columns = state.cashFlowColumnOrder
    .map((key) => cashFlowColumns.find((column) => column.key === key))
    .filter(Boolean);
  els.cashFlowHead.innerHTML = columns.map((column) => {
    const sorted = state.cashFlowSort.key === column.key;
    const sortLabel = sorted ? (state.cashFlowSort.direction === "desc" ? " down" : " up") : "";
    return `<th draggable="true" data-cash-flow-column="${column.key}" class="${[sorted ? "sorted" : "", column.className || ""].filter(Boolean).join(" ")}" title="Drag to reorder. Click to sort.">
      <button class="column-sort" type="button" data-cash-flow-column="${column.key}" ${column.sortable ? "" : "disabled"}>${escapeHtml(column.label)}${sortLabel}</button>
    </th>`;
  }).join("");

  const rows = sortedCashFlowItems().map((item) => renderCashFlowRow(item, columns)).join("");
  els.cashFlowRows.innerHTML = rows;
}

function renderCashFlowKpis() {
  const totals = cashFlowTotals();
  els.cashFlowProfit.textContent = money(totals.profit);
  els.cashFlowProfitMetric.classList.toggle("metric-paid", totals.profit >= 0);
  els.cashFlowProfitMetric.classList.toggle("metric-unpaid", totals.profit < 0);
  els.cashFlowAccountKpi.textContent = state.cashFlowItems.length;
  els.cashFlowTechExpense.textContent = money(totals.techExpense);
  els.cashFlowMonthlyLoan.textContent = money(totals.monthlyLoanPayment);
  els.cashFlowBusinessCreditCard.textContent = money(totals.businessCreditCard);
  els.cashFlowSoftware.textContent = money(totals.softwareExpense);
  els.cashFlowIncomeReceived.textContent = money(totals.incomeReceived);
  els.cashFlowBusinessPaid.textContent = money(totals.businessPaid);
  els.cashFlowIncomeStillDue.textContent = money(totals.incomeMonthly);
  els.cashFlowMonthlyInterest.textContent = money(totals.monthlyInterest);
  els.cashFlowAvailableCreditLimit.textContent = money(totals.availableCreditLimit);
  els.cashFlowRemainingLoanBalance.textContent = money(totals.remainingLoanBalance);
  els.cashFlowAverageApr.textContent = formatPercent(totals.averageApr);
  els.cashFlowCashNeeds.textContent = money(totals.totalExpenses);
  els.cashFlowGrossProfit.textContent = money(totals.grossProfit);
  els.cashFlowGrossProfitMetric.classList.toggle("metric-paid", totals.grossProfit >= 0);
  els.cashFlowGrossProfitMetric.classList.toggle("metric-unpaid", totals.grossProfit < 0);
}

function renderCashFlowRow(item, columns) {
  return `
    <tr data-cash-flow-id="${item.id}" class="${item.type === "Income" ? "cash-flow-income-row" : "cash-flow-expense-row"}">
      ${columns.map((column) => renderCashFlowCell(item, column.key)).join("")}
    </tr>
  `;
}

function renderCashFlowCell(item, key) {
  const terms = cashFlowRowTerms(item);
  const openUrl = normalizeUrl(item.url);
  const showFinancingFields = isFinancingCashFlowItem(item);
  const showInterestFields = isInterestCashFlowItem(item);
  const cells = {
    type: `<td class="type-column"><select data-cash-flow-field="type">${cashFlowTypes.map((name) => `<option${name === item.type ? " selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></td>`,
    category: `<td class="category-column"><select data-cash-flow-field="category">${cashFlowCategories.map((name) => `<option${name === item.category ? " selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></td>`,
    name: `<td class="name-column"><input data-cash-flow-field="name" value="${escapeAttr(item.name)}"></td>`,
    website: `<td>${openUrl
      ? `<a class="open-link" href="${escapeAttr(openUrl)}" target="_blank" rel="noopener">Open</a>`
      : `<button class="link-button" type="button" data-add-cash-flow-url="${item.id}">Add URL</button>`}</td>`,
    totalOwed: `<td><div class="money-input"><span>$</span><input data-cash-flow-field="totalOwed" type="number" step="0.01" min="0" value="${escapeAttr(item.totalOwed)}"></div></td>`,
    principalDue: `<td><div class="money-input"><span>$</span><input data-cash-flow-field="principalDue" type="number" step="0.01" min="0" value="${escapeAttr(item.principalDue)}"></div></td>`,
    creditLimit: `<td><div class="money-input"><span>$</span><input data-cash-flow-field="creditLimit" type="number" step="0.01" min="0" value="${escapeAttr(item.creditLimit ?? "")}"></div></td>`,
    frequency: `<td><select data-cash-flow-field="frequency">${cashFlowFrequencies.map((name) => `<option${name === item.frequency ? " selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></td>`,
    paymentAmount: `<td><div class="money-input"><span>$</span><input data-cash-flow-field="paymentAmount" type="number" step="0.01" min="0" value="${escapeAttr(item.paymentAmount)}" placeholder="${escapeAttr(terms.amount)}"></div></td>`,
    paymentsThisMonth: `<td class="count-column"><input data-cash-flow-field="paymentsThisMonth" type="text" inputmode="decimal" value="${escapeAttr(item.paymentsThisMonth)}"></td>`,
    totalDue: `<td><div class="money-input"><span>$</span><input data-cash-flow-field="totalDue" type="number" step="0.01" min="0" value="${escapeAttr(item.totalDue)}" placeholder="${escapeAttr(cashFlowDue(item) || terms.due)}"></div></td>`,
    totalPaid: `<td><div class="money-input"><span>$</span><input data-cash-flow-field="totalPaid" type="number" step="0.01" min="0" value="${escapeAttr(item.totalPaid)}" placeholder="${escapeAttr(terms.paid)}"></div></td>`,
    paymentsRemaining: showFinancingFields ? `<td class="readonly-cell remaining-column" data-cash-flow-derived="paymentsRemaining">${cashFlowPaymentsRemaining(item)}</td>` : `<td class="readonly-cell remaining-column muted" data-cash-flow-derived="paymentsRemaining"></td>`,
    interestRate: showFinancingFields ? `<td class="apr-cell"><input data-cash-flow-field="interestRate" type="number" step="0.01" min="0" value="${escapeAttr(aprInputValue(item.interestRate))}"></td>` : `<td class="apr-cell"><div class="readonly-cell"></div></td>`,
    monthlyInterest: showInterestFields ? `<td class="money readonly-cell" data-cash-flow-derived="monthlyInterest">${money(cashFlowMonthlyInterest(item))}</td>` : `<td class="money readonly-cell" data-cash-flow-derived="monthlyInterest"></td>`,
    startDate: `<td><input data-cash-flow-field="startDate" type="date" value="${escapeAttr(item.startDate)}"></td>`,
    endDate: `<td><input data-cash-flow-field="endDate" type="date" value="${escapeAttr(item.endDate)}"></td>`,
    lastPaymentDate: `<td><input data-cash-flow-field="lastPaymentDate" type="date" value="${escapeAttr(item.lastPaymentDate)}"></td>`,
    notes: `<td class="notes-column"><textarea data-cash-flow-field="notes" rows="1">${escapeHtml(item.notes)}</textarea></td>`,
    actions: `<td>
      <div class="row-actions compact-actions">
        <button type="button" data-edit-cash-flow="${item.id}">Details</button>
        <button class="danger" type="button" data-delete-cash-flow="${item.id}">Delete</button>
      </div>
    </td>`,
  };
  return cells[key] || "<td></td>";
}

function cashFlowRowTerms(item) {
  if (item.type === "Income") {
    return { amount: "income amount", due: "expected", paid: "received" };
  }
  return { amount: "payment amount", due: "due", paid: "paid" };
}

function renderHistory() {
  const snapshotsByMonth = latestSnapshotsByMonth();
  els.historyList.innerHTML = monthRange("2024-01", latestHistoryMonth()).map((month) => {
    const snapshot = snapshotsByMonth.get(month);
    return snapshot ? `
    <article class="history-item">
      <header>
        <div>
          <h4><a class="month-link" href="#month=${escapeAttr(snapshot.reviewMonth)}" data-month="${escapeAttr(snapshot.reviewMonth)}">${escapeHtml(formatMonthLabel(snapshot.reviewMonth))}</a></h4>
          <div class="muted">Saved ${escapeHtml(snapshot.savedAt)}</div>
        </div>
        <span class="tag">${snapshot.accounts.length} accounts</span>
      </header>
      <div class="row-actions">
        <span>Total due ${money(snapshot.totalCurrentDue)}</span>
        <span>Total paid ${money(snapshot.totalPlanned)}</span>
        <span>Balance ${money(snapshot.totalBalance)}</span>
        <span>Interest ${money(snapshot.totalMonthlyInterest)}</span>
      </div>
    </article>
  ` : `
    <article class="history-item">
      <header>
        <div>
          <h4><a class="month-link" href="#month=${escapeAttr(month)}" data-month="${escapeAttr(month)}">${escapeHtml(formatMonthLabel(month))}</a></h4>
          <div class="muted">No saved snapshot yet</div>
        </div>
        <span class="tag empty">Open month</span>
      </header>
    </article>
  `;
  }).join("");
}

function renderCalendar() {
  const months = monthRange("2024-01", "2027-12").reverse();
  els.calendarList.innerHTML = months.map((month) => {
    const [year, monthIndex] = month.split("-").map(Number);
    const firstDay = new Date(year, monthIndex - 1, 1);
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    const leadingDays = firstDay.getDay();
    const blanks = Array.from({ length: leadingDays }, () => `<span class="calendar-day calendar-empty"></span>`).join("");
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateValue = `${month}-${String(day).padStart(2, "0")}`;
      const isToday = dateValue === new Date().toISOString().slice(0, 10);
      return `<span class="calendar-day${isToday ? " today" : ""}">${day}</span>`;
    }).join("");
    return `
      <article class="calendar-card">
        <div class="calendar-card-head">
          <div>
            <h4><a class="month-link" href="#month=${escapeAttr(month)}" data-month="${escapeAttr(month)}">${escapeHtml(formatMonthLabel(month))}</a></h4>
            <p>${escapeHtml(monthDateRangeLabel(month))}</p>
          </div>
        </div>
        <div class="calendar-weekdays" aria-hidden="true">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div class="calendar-days">${blanks}${days}</div>
      </article>
    `;
  }).join("");
}

function renderAll() {
  els.reviewMonth.value = state.reviewMonth;
  renderTotals();
  renderReview();
  renderCashFlow();
  renderAccountCards();
  renderCashFlowAccountCards();
  renderNotActiveAccounts();
  renderHistory();
  renderCalendar();
}

function setView(name) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active-view"));
  document.querySelector(`#${name}View`).classList.add("active-view");
  els.navTabs.forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  els.pageTitle.textContent = {
    review: "Monthly Review",
    cashFlow: "Budget Cash Flow",
    accounts: "Accounts",
    notActive: "Not Active",
    history: "History",
    calendar: "Calendar",
  }[name] || "Monthly Review";
}

function goToReviewMonth(month) {
  if (!isMonthValue(month)) return;
  state.reviewMonth = month;
  saveState("Review month updated.");
  renderAll();
  setView("review");
}

function latestSnapshotsByMonth() {
  const snapshots = new Map();
  for (const snapshot of state.history) {
    if (!isMonthValue(snapshot.reviewMonth) || snapshots.has(snapshot.reviewMonth)) continue;
    snapshots.set(snapshot.reviewMonth, snapshot);
  }
  return snapshots;
}

function latestHistoryMonth() {
  const months = [
    new Date().toISOString().slice(0, 7),
    isMonthValue(state.reviewMonth) ? state.reviewMonth : "",
    ...state.history.map((snapshot) => snapshot.reviewMonth).filter(isMonthValue),
  ];
  return months.sort().at(-1) || "2024-01";
}

function monthRange(startMonth, endMonth) {
  const months = [];
  const [startYear, startIndex] = startMonth.split("-").map(Number);
  const [endYear, endIndex] = endMonth.split("-").map(Number);
  const cursor = new Date(startYear, startIndex - 1, 1);
  const end = new Date(endYear, endIndex - 1, 1);
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months.reverse();
}

function formatMonthLabel(month) {
  if (!isMonthValue(month)) return month;
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function isMonthValue(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));
}

function addMonths(month, count) {
  if (!isMonthValue(month)) return CURRENT_MONTH;
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + count, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addDays(value, count) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  date.setDate(date.getDate() + count);
  return date.toISOString().slice(0, 10);
}

function monthDateRangeLabel(month) {
  if (!isMonthValue(month)) return "";
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 0);
  const startLabel = start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `${startLabel} - ${endLabel}`;
}

function compareAccountName(a, b) {
  return String(a.name || "").localeCompare(String(b.name || ""), undefined, { numeric: true, sensitivity: "base" });
}

function paidAmount(item) {
  return item.paid ? numberValue(item.plannedPayment) : 0;
}

function sumCurrentDue(accounts) {
  return accounts.reduce((sum, item) => sum + numberValue(item.currentDue), 0);
}

function sumTotalPaid(accounts) {
  return accounts.reduce((sum, item) => sum + paidAmount(item), 0);
}

function monthlyReviewRemainingUnpaid() {
  const accounts = activeAccounts();
  return sumCurrentDue(accounts) - sumTotalPaid(accounts);
}

function cashFlowPeriodsThisMonth(item) {
  if (numberValue(item.paymentsThisMonth)) return numberValue(item.paymentsThisMonth);
  if (item.frequency === "Weekly") return weeksInMonth(state.reviewMonth);
  return 1;
}

function cashFlowDue(item) {
  if (item.totalDue !== "" && item.totalDue !== undefined) return numberValue(item.totalDue);
  return multiplyCurrency(item.paymentAmount, cashFlowPeriodsThisMonth(item));
}

function cashFlowPaid(item) {
  if (item.totalPaid !== "" && item.totalPaid !== undefined) return numberValue(item.totalPaid);
  return 0;
}

function cashFlowCalculatedPaid(item) {
  return multiplyCurrency(item.paymentAmount, item.paymentsThisMonth);
}

function roundCurrency(value) {
  return currencyCents(value) / 100;
}

function currencyCents(value) {
  return Math.round(numberValue(value) * 100);
}

function multiplyCurrency(amount, multiplier) {
  return Math.round(currencyCents(amount) * numberValue(multiplier)) / 100;
}

function cashFlowPaymentsRemaining(item) {
  if (item.paymentsRemaining !== "" && item.paymentsRemaining !== undefined) return numberValue(item.paymentsRemaining);
  const amortizedPayments = estimateCashFlowPaymentsRemaining(item);
  if (amortizedPayments !== "") return amortizedPayments;
  const paymentAmount = numberValue(item.paymentAmount);
  if (!paymentAmount || !numberValue(item.totalOwed)) return "";
  return Math.max(0, Math.ceil(numberValue(item.totalOwed) / paymentAmount) - numberValue(item.paymentsThisMonth));
}

function estimateCashFlowPaymentsRemaining(item) {
  const principal = numberValue(item.principalDue) || numberValue(item.totalOwed);
  const paymentAmount = numberValue(item.paymentAmount);
  if (!principal || !paymentAmount) return "";

  const annualRate = numberValue(item.interestRate) / 100;
  const periodsPerYear = cashFlowPaymentPeriodsPerYear(item);
  const periodRate = annualRate && periodsPerYear ? annualRate / periodsPerYear : 0;

  if (!periodRate) return Math.ceil(principal / paymentAmount);
  const firstPeriodInterest = principal * periodRate;
  if (paymentAmount <= firstPeriodInterest) return "Payment too low";

  const payments = -Math.log(1 - (periodRate * principal) / paymentAmount) / Math.log(1 + periodRate);
  if (!Number.isFinite(payments)) return "";
  return Math.ceil(payments);
}

function cashFlowPaymentPeriodsPerYear(item) {
  if (item.frequency === "Weekly") return 52;
  if (item.frequency === "One Time") return 1;
  return 12;
}

function cashFlowMonthlyInterest(item) {
  const principal = cashFlowInterestBalance(item);
  const annualRate = numberValue(item.interestRate);
  if (!principal || !annualRate) return 0;
  return principal * (annualRate / 100) / 12;
}

function cashFlowInterestBalance(item) {
  return numberValue(item.totalOwed) || numberValue(item.principalDue);
}

function isLoanCashFlowItem(item) {
  return item.type === "Expense" && ["Loan", "Cash Advance Loan"].includes(item.category);
}

function isFinancingCashFlowItem(item) {
  return item.type === "Expense" && ["Business Credit Card", "Business loan", "Cash Advance Loan", "Loan", "Personal Credit Card", "Personal Loan"].includes(item.category);
}

function isInterestCashFlowItem(item) {
  return item.type === "Expense" && ["Business Credit Card", "Cash Advance Loan", "Loan"].includes(item.category);
}

function remainingLoanBalanceAfterThisMonth(item) {
  const principal = numberValue(item.principalDue) || numberValue(item.totalOwed);
  if (!principal) return 0;
  const principalAfterPayment = Math.max(0, principal - cashFlowDue(item));
  const monthlyRate = numberValue(item.interestRate) / 100 / 12;
  return principalAfterPayment + (principalAfterPayment * monthlyRate);
}

function weeksInMonth(month) {
  if (!isMonthValue(month)) return 4;
  const [year, monthIndex] = month.split("-").map(Number);
  const days = new Date(year, monthIndex, 0).getDate();
  return Math.ceil(days / 7);
}

function cashFlowTotals() {
  const monthlyReviewCurrentDue = sumCurrentDue(activeAccounts());
  const monthlyReviewPaid = sumTotalPaid(activeAccounts());
  const monthlyReviewDue = monthlyReviewRemainingUnpaid();
  const expenseItems = state.cashFlowItems.filter((item) => item.type === "Expense");
  const incomeItems = state.cashFlowItems.filter((item) => item.type === "Income");
  const businessExpenseDue = expenseItems.reduce((sum, item) => sum + cashFlowDue(item), 0);
  const businessPaid = expenseItems.reduce((sum, item) => sum + cashFlowPaid(item), 0);
  const incomeMonthly = incomeItems.reduce((sum, item) => sum + cashFlowDue(item), 0);
  const incomeReceived = incomeItems.reduce((sum, item) => sum + cashFlowPaid(item), 0);
  const loanItems = expenseItems.filter(isLoanCashFlowItem);
  const businessCreditCardItems = expenseItems.filter((item) => item.category === "Business Credit Card");
  const interestItems = expenseItems.filter(isInterestCashFlowItem);
  const loanDue = loanItems.reduce((sum, item) => sum + cashFlowDue(item), 0);
  const loanTotalOwed = loanItems.reduce((sum, item) => sum + numberValue(item.totalOwed), 0);
  const businessCreditCardTotalOwed = businessCreditCardItems.reduce((sum, item) => sum + numberValue(item.totalOwed), 0);
  return {
    monthlyReviewDue,
    monthlyReviewCurrentDue,
    monthlyReviewPaid,
    monthlyReviewRemainingUnpaid: monthlyReviewDue,
    techExpense: expenseItems.filter((item) => item.category === "Technology Consulting Expense").reduce((sum, item) => sum + cashFlowDue(item), 0),
    loans: loanTotalOwed - loanDue,
    monthlyLoanPayment: expenseItems.filter((item) => item.category === "Loan").reduce((sum, item) => sum + cashFlowDue(item), 0),
    businessCreditCard: businessCreditCardItems.reduce((sum, item) => sum + cashFlowDue(item), 0),
    softwareExpense: expenseItems.filter((item) => ["Software Subscription", "ZOHO Subscription"].includes(item.category)).reduce((sum, item) => sum + cashFlowDue(item), 0),
    incomeMonthly,
    incomeReceived,
    businessPaid,
    incomeStillDue: Math.max(0, incomeMonthly - incomeReceived),
    monthlyInterest: interestItems.reduce((sum, item) => sum + cashFlowMonthlyInterest(item), 0),
    remainingLoanBalance: businessCreditCardTotalOwed + loanTotalOwed,
    availableCreditLimit: availableCashFlowCreditLimit(state.cashFlowItems),
    averageApr: weightedAverageCashFlowApr(state.cashFlowItems),
    totalExpenses: businessExpenseDue,
    cashNeeds: businessExpenseDue,
    grossProfit: incomeMonthly - businessExpenseDue,
    profit: (incomeMonthly - businessExpenseDue) - monthlyReviewCurrentDue,
  };
}

function cashFlowPrincipalBalance(item) {
  return numberValue(item.principalDue) || numberValue(item.totalOwed);
}

function availableCashFlowCreditLimit(items) {
  const businessCreditCards = items.filter((item) => item.type === "Expense" && item.category === "Business Credit Card");
  const creditLimit = businessCreditCards.reduce((sum, item) => sum + numberValue(item.creditLimit), 0);
  const balance = businessCreditCards.reduce((sum, item) => sum + numberValue(item.totalOwed), 0);
  return creditLimit - balance;
}

function weightedAverageCashFlowApr(items) {
  const eligible = items.filter((item) => cashFlowPrincipalBalance(item) > 0 && numberValue(item.interestRate) > 0);
  const totalBalance = eligible.reduce((sum, item) => sum + cashFlowPrincipalBalance(item), 0);
  if (!totalBalance) return "";
  const weightedApr = eligible.reduce((sum, item) => sum + cashFlowPrincipalBalance(item) * numberValue(item.interestRate), 0);
  return weightedApr / totalBalance;
}

function availablePersonalCreditLimit(accounts) {
  const personalCreditCards = accounts.filter((item) => item.category === "Personal Credit Card");
  const creditLimit = personalCreditCards.reduce((sum, item) => sum + numberValue(item.creditLimit), 0);
  const balance = personalCreditCards.reduce((sum, item) => sum + numberValue(item.balance), 0);
  return creditLimit - balance;
}

function weightedAverageApr(accounts) {
  const withAprAndBalance = accounts.filter((item) => numberValue(item.balance) > 0 && numberValue(item.interestRate) > 0);
  const totalBalance = withAprAndBalance.reduce((sum, item) => sum + numberValue(item.balance), 0);
  if (!totalBalance) return "";
  const weightedApr = withAprAndBalance.reduce((sum, item) => sum + numberValue(item.balance) * numberValue(item.interestRate), 0);
  return weightedApr / totalBalance;
}

function isPastDue(item) {
  if (!item.paymentDueDate || item.paid) return false;
  const today = new Date().toISOString().slice(0, 10);
  return item.paymentDueDate < today;
}

function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fillForm(item) {
  formFields.id.value = item?.id || "";
  formFields.active.value = item?.active === false ? "false" : "true";
  formFields.category.value = item?.category || categories[0];
  formFields.name.value = item?.name || "";
  formFields.hint.value = item?.hint || "";
  formFields.url.value = item?.url || "";
  formFields.username.value = item?.username || "";
  formFields.vault.value = item?.vault || "";
  formFields.balance.value = item?.balance || "";
  formFields.creditLimit.value = item?.creditLimit ?? "";
  formFields.interestRate.value = item?.interestRate ?? "";
  formFields.currentDue.value = item?.currentDue ?? "";
  formFields.amountUpdatedDate.value = item?.amountUpdatedDate || "";
  formFields.paymentDueDate.value = item?.paymentDueDate || "";
  formFields.plannedPayment.value = item?.plannedPayment ?? "";
  formFields.paid.value = item?.paid ? "true" : "false";
  formFields.paymentDate.value = item?.paymentDate || "";
  formFields.notes.value = item?.notes || "";
  els.formTitle.textContent = item ? "Edit Account" : "New Account";
  els.deleteAccountBtn.disabled = !item;
}

function formToAccount(existing) {
  const currentDue = formFields.currentDue.value === "" ? "" : numberValue(formFields.currentDue.value);
  return {
    ...(existing || { id: crypto.randomUUID(), latestMonthlyAmount: currentDue }),
    active: formFields.active.value === "true",
    category: formFields.category.value,
    name: formFields.name.value.trim(),
    hint: formFields.hint.value.trim(),
    url: normalizeUrl(formFields.url.value),
    username: formFields.username.value.trim(),
    vault: formFields.vault.value.trim(),
    balance: formFields.balance.value === "" ? "" : numberValue(formFields.balance.value),
    creditLimit: formFields.creditLimit.value === "" ? "" : numberValue(formFields.creditLimit.value),
    interestRate: formFields.interestRate.value === "" ? "" : numberValue(formFields.interestRate.value),
    currentDue,
    amountUpdatedDate: formFields.amountUpdatedDate.value,
    paymentDueDate: formFields.paymentDueDate.value,
    plannedPayment: formFields.plannedPayment.value === "" ? "" : numberValue(formFields.plannedPayment.value),
    paid: formFields.paid.value === "true",
    paymentDate: formFields.paymentDate.value,
    notes: formFields.notes.value.trim(),
  };
}

function fillCashFlowForm(item) {
  cashFlowFormFields.id.value = item?.id || "";
  cashFlowFormFields.type.value = item?.type || "Expense";
  cashFlowFormFields.category.value = item?.category || cashFlowCategories[0];
  cashFlowFormFields.name.value = item?.name || "";
  cashFlowFormFields.url.value = item?.url || "";
  cashFlowFormFields.username.value = item?.username || "";
  cashFlowFormFields.vault.value = item?.vault || "";
  cashFlowFormFields.contactName.value = item?.contactName || "";
  cashFlowFormFields.contactEmail.value = item?.contactEmail || "";
  cashFlowFormFields.contactPhone.value = item?.contactPhone || "";
  cashFlowFormFields.totalOwed.value = item?.totalOwed ?? "";
  cashFlowFormFields.principalDue.value = item?.principalDue ?? "";
  cashFlowFormFields.creditLimit.value = item?.creditLimit ?? "";
  cashFlowFormFields.frequency.value = item?.frequency || "Monthly";
  cashFlowFormFields.paymentAmount.value = item?.paymentAmount ?? "";
  cashFlowFormFields.paymentsThisMonth.value = item?.paymentsThisMonth ?? "";
  cashFlowFormFields.totalDue.value = item?.totalDue ?? "";
  cashFlowFormFields.totalPaid.value = item?.totalPaid ?? "";
  cashFlowFormFields.paymentsRemaining.value = item?.paymentsRemaining ?? "";
  cashFlowFormFields.interestRate.value = aprInputValue(item?.interestRate);
  cashFlowFormFields.startDate.value = item?.startDate || "";
  cashFlowFormFields.endDate.value = item?.endDate || "";
  cashFlowFormFields.lastPaymentDate.value = item?.lastPaymentDate || "";
  cashFlowFormFields.notes.value = item?.notes || "";
  els.cashFlowFormTitle.textContent = item ? "Edit Budget Cash Flow Account" : "Budget Cash Flow Account Details";
  els.deleteCashFlowAccountBtn.disabled = !item;
}

function cashFlowFormToItem(existing) {
  return {
    ...(existing || { id: crypto.randomUUID() }),
    type: cashFlowFormFields.type.value,
    category: cashFlowFormFields.category.value,
    name: cashFlowFormFields.name.value.trim(),
    url: normalizeUrl(cashFlowFormFields.url.value),
    username: cashFlowFormFields.username.value.trim(),
    vault: cashFlowFormFields.vault.value.trim(),
    contactName: cashFlowFormFields.contactName.value.trim(),
    contactEmail: cashFlowFormFields.contactEmail.value.trim(),
    contactPhone: cashFlowFormFields.contactPhone.value.trim(),
    totalOwed: cashFlowFormFields.totalOwed.value === "" ? "" : numberValue(cashFlowFormFields.totalOwed.value),
    principalDue: cashFlowFormFields.principalDue.value === "" ? "" : numberValue(cashFlowFormFields.principalDue.value),
    creditLimit: cashFlowFormFields.creditLimit.value === "" ? "" : numberValue(cashFlowFormFields.creditLimit.value),
    frequency: cashFlowFormFields.frequency.value,
    paymentAmount: cashFlowFormFields.paymentAmount.value === "" ? "" : numberValue(cashFlowFormFields.paymentAmount.value),
    paymentsThisMonth: cashFlowFormFields.paymentsThisMonth.value === "" ? "" : numberValue(cashFlowFormFields.paymentsThisMonth.value),
    totalDue: cashFlowFormFields.totalDue.value === "" ? "" : numberValue(cashFlowFormFields.totalDue.value),
    totalPaid: cashFlowFormFields.totalPaid.value === "" ? "" : numberValue(cashFlowFormFields.totalPaid.value),
    paymentsRemaining: cashFlowFormFields.paymentsRemaining.value === "" ? "" : numberValue(cashFlowFormFields.paymentsRemaining.value),
    interestRate: cashFlowFormFields.interestRate.value === "" ? "" : numberValue(cashFlowFormFields.interestRate.value),
    startDate: cashFlowFormFields.startDate.value,
    endDate: cashFlowFormFields.endDate.value,
    lastPaymentDate: cashFlowFormFields.lastPaymentDate.value,
    notes: cashFlowFormFields.notes.value.trim(),
  };
}

function updateInline(row, event) {
  const id = row.dataset.id;
  const item = state.accounts.find((accountItem) => accountItem.id === id);
  if (!item) return;
  const field = event.target.dataset.field;
  if (["name", "balance", "creditLimit"].includes(field)) return;
  let value = event.target.value;
  if (["active", "paid"].includes(field)) value = value === "true";
  if (["currentDue", "plannedPayment"].includes(field)) value = value === "" ? "" : numberValue(value);
  item[field] = value;
  if (field === "currentDue" && !item.amountUpdatedDate) {
    item.amountUpdatedDate = new Date().toISOString().slice(0, 10);
  }
  saveState(field === "active" && value === false ? "Account moved to Not Active." : "");
  renderAll();
}

function setReviewSort(key) {
  const column = reviewColumns.find((item) => item.key === key);
  if (!column?.sortable) return;
  const current = state.reviewSort;
  state.reviewSort = {
    key,
    direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
  };
  saveState();
  renderReview();
}

function moveReviewColumn(fromKey, toKey) {
  if (!fromKey || !toKey || fromKey === toKey) return;
  const order = normalizeColumnOrder(state.reviewColumnOrder);
  const fromIndex = order.indexOf(fromKey);
  const toIndex = order.indexOf(toKey);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);
  state.reviewColumnOrder = order;
  saveState("Column moved.");
  renderReview();
}

function setCashFlowSort(key) {
  const column = cashFlowColumns.find((item) => item.key === key);
  if (!column?.sortable) return;
  const current = state.cashFlowSort;
  state.cashFlowSort = {
    key,
    direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
  };
  saveState();
  renderCashFlow();
}

function moveCashFlowColumn(fromKey, toKey) {
  if (!fromKey || !toKey || fromKey === toKey) return;
  const order = normalizeCashFlowColumnOrder(state.cashFlowColumnOrder);
  const fromIndex = order.indexOf(fromKey);
  const toIndex = order.indexOf(toKey);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);
  state.cashFlowColumnOrder = order;
  saveState("Cash flow column moved.");
  renderCashFlow();
}

function editAccountUrl(id) {
  const item = state.accounts.find((accountItem) => accountItem.id === id);
  if (!item) return;
  fillForm(item);
  setView("accounts");
  formFields.url.focus();
}

function updateCashFlowItem(row, event, options = {}) {
  const item = state.cashFlowItems.find((cashFlowItem) => cashFlowItem.id === row.dataset.cashFlowId);
  if (!item) return;
  const field = event.target.dataset.cashFlowField;
  if (!field) return;
  let value = event.target.value;
  if (cashFlowNumericFields.has(field)) {
    value = value === "" ? "" : numberValue(value);
  }
  item[field] = value;
  if (field === "category" && value === "Customer Fees") item.type = "Income";
  if (field === "category" && value !== "Customer Fees") item.type = "Expense";
  saveState();
  if (options.render === false) {
    updateCashFlowDerivedCells(row, item);
    renderCashFlowKpis();
  } else {
    renderCashFlow();
  }
  renderCashFlowAccountCards();
}

function updateCashFlowDerivedCells(row, item) {
  const paymentsRemainingCell = row.querySelector('[data-cash-flow-derived="paymentsRemaining"]');
  if (paymentsRemainingCell) {
    paymentsRemainingCell.textContent = isFinancingCashFlowItem(item) ? cashFlowPaymentsRemaining(item) : "";
  }
  const monthlyInterestCell = row.querySelector('[data-cash-flow-derived="monthlyInterest"]');
  if (monthlyInterestCell) {
    monthlyInterestCell.textContent = isInterestCashFlowItem(item) ? money(cashFlowMonthlyInterest(item)) : "";
  }
  const totalDueInput = row.querySelector('[data-cash-flow-field="totalDue"]');
  if (totalDueInput && totalDueInput.value === "") {
    const terms = cashFlowRowTerms(item);
    totalDueInput.placeholder = cashFlowDue(item) || terms.due;
  }
}

function updateCashFlowTextField(row, event) {
  const item = state.cashFlowItems.find((cashFlowItem) => cashFlowItem.id === row.dataset.cashFlowId);
  const field = event.target.dataset.cashFlowField;
  if (!item || !field) return;
  item[field] = event.target.value;
  saveState();
  renderCashFlowAccountCards();
}

function addCashFlowItem() {
  const item = cashFlowItem("Expense", "Technology Consulting Expense", "New cash flow row");
  state.cashFlowItems.push(item);
  saveState("Cash flow row added.");
  renderAll();
  editCashFlowAccount(item.id);
}

function deleteCashFlowItem(id) {
  state.cashFlowItems = state.cashFlowItems.filter((item) => item.id !== id);
  saveState("Cash flow row deleted.");
  fillCashFlowForm();
  renderAll();
}

function editCashFlowAccount(id) {
  const item = state.cashFlowItems.find((cashFlowItem) => cashFlowItem.id === id);
  if (!item) return;
  fillCashFlowForm(item);
  setView("cashFlow");
  cashFlowFormFields.name.focus();
}

function moveAccountToCashFlow(id) {
  const index = state.accounts.findIndex((item) => item.id === id);
  if (index < 0) return;
  const accountItem = state.accounts[index];
  const cashFlowRecord = cashFlowItemFromAccount(accountItem);
  state.accounts.splice(index, 1);
  state.cashFlowItems.push(cashFlowRecord);
  saveState("Account moved to Budget Cash Flow.");
  fillForm();
  fillCashFlowForm(cashFlowRecord);
  renderAll();
  setView("cashFlow");
}

function moveCashFlowToAccount(id) {
  const index = state.cashFlowItems.findIndex((item) => item.id === id);
  if (index < 0) return;
  const cashFlowItemRecord = state.cashFlowItems[index];
  const accountRecord = accountFromCashFlowItem(cashFlowItemRecord);
  state.cashFlowItems.splice(index, 1);
  state.accounts.push(accountRecord);
  saveState("Account moved to Monthly Review.");
  fillCashFlowForm();
  fillForm(accountRecord);
  renderAll();
  setView("accounts");
}

function cashFlowItemFromAccount(accountItem) {
  const savedCashFlow = accountItem.movedCashFlowData || {};
  const currentDue = accountItem.currentDue === "" || accountItem.currentDue === undefined ? "" : numberValue(accountItem.currentDue);
  const balance = accountItem.balance === "" || accountItem.balance === undefined ? "" : numberValue(accountItem.balance);
  return {
    ...savedCashFlow,
    id: crypto.randomUUID(),
    type: savedCashFlow.type || "Expense",
    category: cashFlowCategoryFromAccount(accountItem.category, savedCashFlow.category),
    name: accountItem.name || savedCashFlow.name || "",
    totalOwed: balance !== "" ? balance : (savedCashFlow.totalOwed ?? ""),
    principalDue: balance !== "" ? balance : (savedCashFlow.principalDue ?? ""),
    creditLimit: accountItem.creditLimit === "" || accountItem.creditLimit === undefined ? (savedCashFlow.creditLimit ?? "") : numberValue(accountItem.creditLimit),
    frequency: savedCashFlow.frequency || "Monthly",
    paymentAmount: currentDue !== "" ? currentDue : (savedCashFlow.paymentAmount ?? ""),
    paymentsThisMonth: savedCashFlow.paymentsThisMonth ?? "",
    totalDue: currentDue !== "" ? currentDue : (savedCashFlow.totalDue ?? ""),
    totalPaid: accountItem.paid ? numberValue(accountItem.plannedPayment) : (savedCashFlow.totalPaid ?? ""),
    paymentsRemaining: savedCashFlow.paymentsRemaining ?? "",
    interestRate: accountItem.interestRate === "" || accountItem.interestRate === undefined ? (savedCashFlow.interestRate ?? "") : numberValue(accountItem.interestRate),
    url: normalizeUrl(accountItem.url || savedCashFlow.url || ""),
    username: accountItem.username || savedCashFlow.username || "",
    vault: accountItem.vault || savedCashFlow.vault || "",
    contactName: savedCashFlow.contactName || "",
    contactEmail: savedCashFlow.contactEmail || "",
    contactPhone: savedCashFlow.contactPhone || "",
    startDate: savedCashFlow.startDate || accountItem.amountUpdatedDate || "",
    endDate: savedCashFlow.endDate || "",
    lastPaymentDate: savedCashFlow.lastPaymentDate || accountItem.paymentDate || "",
    notes: accountItem.notes || savedCashFlow.notes || "",
    monthlyReviewData: withoutMovePayload(accountItem),
  };
}

function accountFromCashFlowItem(item) {
  const savedAccount = item.monthlyReviewData || {};
  const principal = cashFlowPrincipalBalance(item);
  const paid = cashFlowPaid(item);
  return {
    ...savedAccount,
    id: crypto.randomUUID(),
    active: true,
    category: accountCategoryFromCashFlow(item.category, savedAccount.category),
    name: item.name || savedAccount.name || "",
    hint: savedAccount.hint || "",
    url: normalizeUrl(item.url || savedAccount.url || ""),
    username: item.username || savedAccount.username || "",
    vault: item.vault || savedAccount.vault || "",
    balance: principal || savedAccount.balance || "",
    creditLimit: item.creditLimit === "" || item.creditLimit === undefined ? (savedAccount.creditLimit ?? "") : numberValue(item.creditLimit),
    interestRate: item.interestRate === "" || item.interestRate === undefined ? (savedAccount.interestRate ?? "") : numberValue(item.interestRate),
    latestMonthlyAmount: cashFlowDue(item) || savedAccount.latestMonthlyAmount || "",
    currentDue: cashFlowDue(item) || savedAccount.currentDue || "",
    amountUpdatedDate: savedAccount.amountUpdatedDate || item.startDate || "",
    paymentDueDate: savedAccount.paymentDueDate || item.endDate || "",
    plannedPayment: paid || "",
    paid: paid > 0,
    paymentDate: item.lastPaymentDate || savedAccount.paymentDate || "",
    notes: item.notes || savedAccount.notes || "",
    movedCashFlowData: withoutMovePayload(item),
  };
}

function cashFlowCategoryFromAccount(category, fallback) {
  if (cashFlowCategories.includes(category)) return category;
  if (fallback && cashFlowCategories.includes(fallback)) return fallback;
  if (category === "Business loan" || category === "Personal Loan") return "Loan";
  return "Technology Consulting Expense";
}

function accountCategoryFromCashFlow(category, fallback) {
  if (categories.includes(category)) return category;
  if (fallback && categories.includes(fallback)) return fallback;
  if (category === "Loan" || category === "Cash Advance Loan") return "Business loan";
  if (category === "Business Credit Card") return "Business Credit Card";
  return "Misc. Credit";
}

function withoutMovePayload(item) {
  const copy = structuredClone(item);
  delete copy.monthlyReviewData;
  delete copy.movedCashFlowData;
  return copy;
}

function buildSnapshot(month = state.reviewMonth) {
  const accounts = activeAccounts();
  const totalMonthlyInterest = accounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0);
  const totalPaid = sumTotalPaid(accounts);
  return {
    id: crypto.randomUUID(),
    reviewMonth: month,
    savedAt: new Date().toLocaleString("en-US"),
    totalCurrentDue: sumCurrentDue(accounts),
    totalPlanned: totalPaid,
    totalBalance: accounts.reduce((sum, item) => sum + numberValue(item.balance), 0),
    totalMonthlyInterest,
    accounts: structuredClone(accounts),
  };
}

function saveSnapshot() {
  const snapshot = buildSnapshot();
  state.history.unshift(snapshot);
  saveState("Month snapshot saved.");
  renderHistory();
}

function upsertMonthSnapshot(month) {
  state.history = state.history.filter((snapshot) => snapshot.reviewMonth !== month);
  state.history.unshift(buildSnapshot(month));
}

function createNewMonth() {
  const previousMonth = state.reviewMonth;
  const nextMonth = addMonths(previousMonth, 1);
  upsertMonthSnapshot(previousMonth);
  state.reviewMonth = nextMonth;
  state.accounts = state.accounts.map((item) => {
    if (!item.active) return item;
    return {
      ...item,
      paymentDueDate: addDays(item.paymentDueDate, 30),
      plannedPayment: "",
      paid: false,
      paymentDate: "",
      amountUpdatedDate: "",
    };
  });
  state.cashFlowItems = state.cashFlowItems.map((item) => ({
    ...item,
    principalDue: isLoanCashFlowItem(item) ? remainingLoanBalanceAfterThisMonth(item) : item.principalDue,
    paymentsThisMonth: "",
    totalPaid: "",
    lastPaymentDate: "",
  }));
  saveState(`${formatMonthLabel(nextMonth)} created.`);
  renderAll();
}

function createNextCashFlowMonth() {
  const nextMonth = addMonths(state.reviewMonth, 1);
  state.reviewMonth = nextMonth;
  state.cashFlowItems = state.cashFlowItems.map((item) => ({
    ...item,
    principalDue: isLoanCashFlowItem(item) ? remainingLoanBalanceAfterThisMonth(item) : item.principalDue,
    paymentsThisMonth: "",
    totalPaid: "",
    lastPaymentDate: "",
  }));
  saveState(`${formatMonthLabel(nextMonth)} cash flow created.`);
  renderAll();
  setView("cashFlow");
}

function buildFinancialReviewData() {
  const accounts = dedupeFinancialStatementAccounts(activeAccounts());
  const byCategory = categories.map((category) => {
    const categoryAccounts = accounts.filter((item) => item.category === category);
    return {
      category,
      accountCount: categoryAccounts.length,
      totalBalance: categoryAccounts.reduce((sum, item) => sum + numberValue(item.balance), 0),
      totalCreditLimit: categoryAccounts.reduce((sum, item) => sum + numberValue(item.creditLimit), 0),
      totalCurrentDue: sumCurrentDue(categoryAccounts),
      totalPaid: sumTotalPaid(categoryAccounts),
      totalMonthlyDue: sumCurrentDue(categoryAccounts),
      monthlyInterest: categoryAccounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0),
    };
  }).filter((item) => item.accountCount > 0);

  const totalCurrentDue = sumCurrentDue(accounts);
  const totalPaid = sumTotalPaid(accounts);
  return {
    reportType: "Budget Review Integration",
    reviewMonth: state.reviewMonth,
    generatedAt: new Date().toISOString(),
    totals: {
      totalCurrentDue,
      totalPaid,
      totalMonthlyDue: totalCurrentDue,
      remainingUnpaid: totalCurrentDue - totalPaid,
      totalBalance: accounts.reduce((sum, item) => sum + numberValue(item.balance), 0),
      totalCreditLimit: accounts.reduce((sum, item) => sum + numberValue(item.creditLimit), 0),
      availableCreditLimit: availablePersonalCreditLimit(accounts),
      monthlyInterest: accounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0),
      averageApr: weightedAverageApr(accounts),
    },
    categories: byCategory,
    budgetCashFlow: buildCashFlowReviewData(),
    accounts: accounts.map((item) => ({
      category: item.category,
      accountName: item.name,
      accountHint: item.hint,
      balance: numberValue(item.balance),
      creditLimit: item.creditLimit === "" || item.creditLimit === undefined ? "" : numberValue(item.creditLimit),
      interestRateApr: item.interestRate === "" ? "" : numberValue(item.interestRate),
      monthlyInterest: estimatedMonthlyInterest(item),
      currentDue: numberValue(item.currentDue),
      plannedPayment: numberValue(item.plannedPayment),
      paidAmount: paidAmount(item),
      paid: Boolean(item.paid),
      amountUpdatedDate: item.amountUpdatedDate,
      paymentDueDate: item.paymentDueDate,
      paymentDate: item.paymentDate,
      notes: item.notes,
    })),
    sourceApplication: "Budget Review",
    sourceApplicationPath: "outputs/budget-web-app/index.html",
    deduplicationRules: [
      "IRS tax accounts are deduplicated before financial statement totals are generated.",
      "Mass Tax revenue accounts are deduplicated before financial statement totals are generated.",
      "Affirm accounts are deduplicated before financial statement totals are generated.",
      "Credit statement duplicates are deduplicated by category, account name, and account hint.",
      "When duplicates exist, the retained row favors the record with the largest balance/current due/paid amount and the most recent updated date.",
    ],
  };
}

function buildCashFlowReviewData() {
  const totals = cashFlowTotals();
  return {
    month: state.reviewMonth,
    monthDateRange: monthDateRangeLabel(state.reviewMonth),
    totals,
    rows: [
      ...state.cashFlowItems.map((item) => ({
        type: item.type,
        category: item.category,
        name: item.name,
        url: item.url,
        username: item.username,
        vault: item.vault,
        contactName: item.contactName,
        contactEmail: item.contactEmail,
        contactPhone: item.contactPhone,
        totalOwed: numberValue(item.totalOwed),
        principalDue: numberValue(item.principalDue),
        frequency: item.frequency,
        paymentAmount: numberValue(item.paymentAmount),
        paymentsThisMonth: numberValue(item.paymentsThisMonth),
        totalDue: cashFlowDue(item),
        totalPaid: cashFlowPaid(item),
        paymentsRemaining: cashFlowPaymentsRemaining(item),
        interestRate: numberValue(item.interestRate),
        monthlyInterest: cashFlowMonthlyInterest(item),
        startDate: item.startDate,
        endDate: item.endDate,
        lastPaymentDate: item.lastPaymentDate,
        notes: item.notes,
      })),
    ],
  };
}

function dedupeFinancialStatementAccounts(accounts) {
  const deduped = new Map();
  for (const item of accounts) {
    const key = financialStatementDedupeKey(item);
    const existing = deduped.get(key);
    deduped.set(key, chooseFinancialStatementRecord(existing, item));
  }
  return [...deduped.values()];
}

function financialStatementDedupeKey(item) {
  const name = normalizeStatementText(item.name);
  const category = normalizeStatementText(item.category);
  const hint = normalizeStatementText(item.hint);
  if (/\birs\b|internal revenue/.test(name)) return "tax:irs";
  if (/mass.*tax|massachusetts.*tax|tax.*revenue/.test(name)) return "tax:mass-tax-revenue";
  if (/\baffirm\b/.test(name)) return "credit:affirm";
  if (/credit card/.test(category) || /credit|card|visa|mastercard|amex|american express|discover/.test(name)) {
    return `credit-statement:${category}:${name}:${hint}`;
  }
  return `account:${category}:${name}:${hint}`;
}

function normalizeStatementText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function chooseFinancialStatementRecord(existing, candidate) {
  if (!existing) return candidate;
  const existingScore = financialStatementRecordScore(existing);
  const candidateScore = financialStatementRecordScore(candidate);
  return candidateScore > existingScore ? candidate : existing;
}

function financialStatementRecordScore(item) {
  return numberValue(item.balance) + numberValue(item.currentDue) + paidAmount(item) + dateScore(item.amountUpdatedDate);
}

function dateScore(value) {
  if (!value) return 0;
  const timestamp = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp / 1000000000000;
}

function exportFinancialReviewData() {
  const data = buildFinancialReviewData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `budget-financial-review-${state.reviewMonth}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function printFinancialReview() {
  const data = buildFinancialReviewData();
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Pop-up blocked. Allow pop-ups to print the financial review.");
    return;
  }
  printWindow.document.write(financialReviewHtml(data));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function financialReviewHtml(data) {
  const accountRows = data.accounts.map((item) => `
    <tr>
      <td>${escapeHtml(item.category)}</td>
      <td>${escapeHtml(item.accountName)}</td>
      <td>${money(item.balance)}</td>
      <td>${item.creditLimit === "" ? "" : money(item.creditLimit)}</td>
      <td>${formatPercent(item.interestRateApr)}</td>
      <td>${money(item.monthlyInterest)}</td>
      <td>${money(item.currentDue)}</td>
      <td>${money(item.paidAmount)}</td>
      <td>${escapeHtml(item.paymentDueDate || "")}</td>
    </tr>
  `).join("");
  const categoryRows = data.categories.map((item) => `
    <tr>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.accountCount}</td>
      <td>${money(item.totalBalance)}</td>
      <td>${money(item.totalCreditLimit)}</td>
      <td>${money(item.totalMonthlyDue)}</td>
      <td>${money(item.totalPaid)}</td>
      <td>${money(item.monthlyInterest)}</td>
    </tr>
  `).join("");
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Budget Financial Review ${escapeHtml(data.reviewMonth)}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #17202a; margin: 32px; }
        h1, h2, p { margin: 0; }
        h1 { font-size: 24px; }
        h2 { font-size: 16px; margin-top: 24px; }
        .report-header { display: flex; align-items: center; gap: 18px; }
        .report-logo { width: 220px; height: auto; object-fit: contain; }
        .muted { color: #64707d; margin-top: 6px; }
        .metrics { display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; margin: 20px 0; }
        .metric { border: 1px solid #d8e0e7; padding: 10px; border-radius: 6px; }
        .metric span { display: block; font-size: 11px; color: #64707d; font-weight: 700; }
        .metric strong { display: block; margin-top: 6px; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th, td { border-bottom: 1px solid #d8e0e7; padding: 7px; text-align: left; }
        th { background: #eef5f8; }
      </style>
    </head>
    <body>
      <header class="report-header">
        <img class="report-logo" src="assets/consumerexp-logo.jpg" alt="ConsumerEXP">
        <div>
          <h1>Budget Financial Review</h1>
          <p class="muted">Michael Kokernak · ${escapeHtml(data.reviewMonth)} · Generated ${escapeHtml(new Date(data.generatedAt).toLocaleString("en-US"))}</p>
        </div>
      </header>
      <section class="metrics">
        <div class="metric"><span>Total Balance</span><strong>${money(data.totals.totalBalance)}</strong></div>
        <div class="metric"><span>Total Personal Expense</span><strong>${money(data.totals.totalMonthlyDue)}</strong></div>
        <div class="metric"><span>Total Paid</span><strong>${money(data.totals.totalPaid)}</strong></div>
        <div class="metric"><span>Remaining</span><strong>${money(data.totals.remainingUnpaid)}</strong></div>
        <div class="metric"><span>Credit Limit</span><strong>${money(data.totals.totalCreditLimit)}</strong></div>
        <div class="metric"><span>Available Credit</span><strong>${money(data.totals.availableCreditLimit)}</strong></div>
        <div class="metric"><span>Monthly Interest</span><strong>${money(data.totals.monthlyInterest)}</strong></div>
        <div class="metric"><span>Average APR</span><strong>${formatPercent(data.totals.averageApr)}</strong></div>
      </section>
      <h2>Category Summary</h2>
      <table>
        <thead><tr><th>Category</th><th>Accounts</th><th>Balance</th><th>Credit Limit</th><th>Current Due</th><th>Total Paid</th><th>Monthly Interest</th></tr></thead>
        <tbody>${categoryRows}</tbody>
      </table>
      <h2>Account Detail</h2>
      <table>
        <thead><tr><th>Category</th><th>Account</th><th>Balance</th><th>Credit Limit</th><th>APR</th><th>Monthly Interest</th><th>Current Due</th><th>Paid</th><th>Due Date</th></tr></thead>
        <tbody>${accountRows}</tbody>
      </table>
    </body>
  </html>`;
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mk-budget-backup-${state.reviewMonth}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported.accounts)) throw new Error("Missing accounts");
      state.reviewMonth = imported.reviewMonth || state.reviewMonth;
      state.accounts = imported.accounts;
      state.history = Array.isArray(imported.history) ? imported.history : [];
      state.reviewColumnOrder = normalizeColumnOrder(imported.reviewColumnOrder);
      state.reviewSort = normalizeReviewSort(imported.reviewSort);
      state.cashFlowItems = normalizeCashFlowItems(imported.cashFlowItems);
      state.cashFlowColumnOrder = normalizeCashFlowColumnOrder(imported.cashFlowColumnOrder);
      state.cashFlowSort = normalizeCashFlowSort(imported.cashFlowSort);
      saveState("Backup imported.");
      renderAll();
    } catch {
      showToast("The selected backup could not be imported.");
    }
  };
  reader.readAsText(file);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function estimatedMonthlyInterest(item) {
  const balance = numberValue(item.balance);
  const annualRate = numberValue(item.interestRate);
  if (!balance || !annualRate) return 0;
  return balance * (annualRate / 100) / 12;
}

function aprInputValue(value) {
  if (value === "" || value === null || value === undefined) return "00.00";
  return numberValue(value).toFixed(2);
}

function formatPercent(value) {
  if (value === "" || value === null || value === undefined) return "";
  const number = numberValue(value);
  return `${number.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

renderCategoryOptions();
const initialHashMonth = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("month");
if (initialHashMonth) {
  goToReviewMonth(initialHashMonth);
} else {
  state.reviewMonth = CURRENT_MONTH;
  saveState();
}
  renderAll();
  fillForm();
  fillCashFlowForm();
  startLocalDataFileSync();

els.navTabs.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

els.reviewMonth.addEventListener("change", () => {
  state.reviewMonth = els.reviewMonth.value;
  saveState("Review month updated.");
  renderAll();
});

els.searchInput.addEventListener("input", () => {
  renderReview();
  renderAccountCards();
  renderCashFlowAccountCards();
  renderNotActiveAccounts();
});

els.saveDataBtn.addEventListener("click", saveBudgetDataNow);

els.categoryFilter.addEventListener("change", () => {
  renderReview();
  renderAccountCards();
  renderCashFlowAccountCards();
  renderNotActiveAccounts();
});

els.addAccountBtn.addEventListener("click", () => {
  fillForm();
  setView("accounts");
  formFields.name.focus();
});

els.newMonthBtn.addEventListener("click", createNewMonth);

els.nextCashFlowMonthBtn.addEventListener("click", createNextCashFlowMonth);

els.addCashFlowItemBtn.addEventListener("click", addCashFlowItem);

els.cashFlowRows.addEventListener("change", (event) => {
  const row = event.target.closest("tr[data-cash-flow-id]");
  if (!row) return;
  const field = event.target.dataset.cashFlowField;
  updateCashFlowItem(row, event, { render: !cashFlowNumericFields.has(field) });
});

els.cashFlowRows.addEventListener("input", (event) => {
  const row = event.target.closest("tr[data-cash-flow-id]");
  if (!row) return;
  const field = event.target.dataset.cashFlowField;
  if (["name", "notes"].includes(field)) {
    updateCashFlowTextField(row, event);
    return;
  }
  if (cashFlowNumericFields.has(field)) updateCashFlowItem(row, event, { render: false });
});

els.cashFlowRows.addEventListener("click", (event) => {
  const editId = event.target.dataset.editCashFlow;
  const deleteId = event.target.dataset.deleteCashFlow;
  const addUrlId = event.target.dataset.addCashFlowUrl;
  if (addUrlId) {
    editCashFlowAccount(addUrlId);
    cashFlowFormFields.url.focus();
    return;
  }
  if (editId) {
    editCashFlowAccount(editId);
    return;
  }
  if (deleteId) deleteCashFlowItem(deleteId);
});

els.cashFlowHead.addEventListener("click", (event) => {
  const button = event.target.closest(".column-sort");
  if (button) setCashFlowSort(button.dataset.cashFlowColumn);
});

els.cashFlowHead.addEventListener("dragstart", (event) => {
  const header = event.target.closest("th[data-cash-flow-column]");
  if (!header) return;
  event.dataTransfer.setData("text/plain", header.dataset.cashFlowColumn);
  event.dataTransfer.effectAllowed = "move";
});

els.cashFlowHead.addEventListener("dragover", (event) => {
  if (event.target.closest("th[data-cash-flow-column]")) event.preventDefault();
});

els.cashFlowHead.addEventListener("drop", (event) => {
  const header = event.target.closest("th[data-cash-flow-column]");
  if (!header) return;
  event.preventDefault();
  moveCashFlowColumn(event.dataTransfer.getData("text/plain"), header.dataset.cashFlowColumn);
});

els.reviewRows.addEventListener("change", (event) => {
  const row = event.target.closest("tr[data-id]");
  if (row) updateInline(row, event);
});

els.reviewRows.addEventListener("click", (event) => {
  const addUrlId = event.target.dataset.addUrl;
  if (addUrlId) editAccountUrl(addUrlId);
});

els.reviewRows.addEventListener("input", (event) => {
  const row = event.target.closest("tr[data-id]");
  if (row && event.target.dataset.field === "notes") updateInline(row, event);
});

els.reviewHead.addEventListener("click", (event) => {
  const button = event.target.closest(".column-sort");
  if (button) setReviewSort(button.dataset.column);
});

els.reviewHead.addEventListener("dragstart", (event) => {
  const header = event.target.closest("th[data-column]");
  if (!header) return;
  event.dataTransfer.setData("text/plain", header.dataset.column);
  event.dataTransfer.effectAllowed = "move";
});

els.reviewHead.addEventListener("dragover", (event) => {
  if (event.target.closest("th[data-column]")) event.preventDefault();
});

els.reviewHead.addEventListener("drop", (event) => {
  const header = event.target.closest("th[data-column]");
  if (!header) return;
  event.preventDefault();
  moveReviewColumn(event.dataTransfer.getData("text/plain"), header.dataset.column);
});

els.accountCards.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  if (!editId) return;
  const item = state.accounts.find((accountItem) => accountItem.id === editId);
  fillForm(item);
  formFields.name.focus();
});

els.accountCards.addEventListener("change", (event) => {
  const moveId = event.target.dataset.moveAccount;
  if (!moveId || event.target.value !== "cashFlow") return;
  moveAccountToCashFlow(moveId);
});

els.cashFlowAccountCards.addEventListener("click", (event) => {
  const editId = event.target.dataset.editCashFlowAccount;
  if (!editId) return;
  editCashFlowAccount(editId);
});

els.cashFlowAccountCards.addEventListener("change", (event) => {
  const moveId = event.target.dataset.moveCashFlowAccount;
  if (!moveId || event.target.value !== "review") return;
  moveCashFlowToAccount(moveId);
});

els.notActiveRows.addEventListener("click", (event) => {
  const editId = event.target.dataset.editInactive;
  const reactivateId = event.target.dataset.reactivate;
  if (editId) {
    const item = state.accounts.find((accountItem) => accountItem.id === editId);
    fillForm(item);
    setView("accounts");
    formFields.name.focus();
    return;
  }
  if (reactivateId) {
    const item = state.accounts.find((accountItem) => accountItem.id === reactivateId);
    if (!item) return;
    item.active = true;
    saveState("Account moved back to Monthly Review.");
    renderAll();
    setView("review");
  }
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = formFields.id.value;
  const index = state.accounts.findIndex((item) => item.id === id);
  const existing = index >= 0 ? state.accounts[index] : null;
  const saved = formToAccount(existing);
  if (!saved.name) {
    showToast("Account name is required.");
    return;
  }
  if (existing) {
    state.accounts[index] = saved;
  } else {
    state.accounts.push(saved);
  }
  saveState("Account saved.");
  fillForm(saved);
  renderAll();
});

els.resetFormBtn.addEventListener("click", () => fillForm());

els.deleteAccountBtn.addEventListener("click", () => {
  const id = formFields.id.value;
  if (!id) return;
  state.accounts = state.accounts.filter((item) => item.id !== id);
  saveState("Account deleted.");
  fillForm();
  renderAll();
});

els.cashFlowAccountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = cashFlowFormFields.id.value;
  const index = state.cashFlowItems.findIndex((item) => item.id === id);
  const existing = index >= 0 ? state.cashFlowItems[index] : null;
  const saved = cashFlowFormToItem(existing);
  if (!saved.name) {
    showToast("Cash flow account name is required.");
    return;
  }
  if (saved.category === "Customer Fees") saved.type = "Income";
  if (saved.category !== "Customer Fees" && saved.type === "Income") saved.type = "Expense";
  if (existing) {
    state.cashFlowItems[index] = saved;
  } else {
    state.cashFlowItems.push(saved);
  }
  saveState("Cash flow account saved.");
  fillCashFlowForm(saved);
  renderAll();
});

els.resetCashFlowFormBtn.addEventListener("click", () => fillCashFlowForm());

els.deleteCashFlowAccountBtn.addEventListener("click", () => {
  const id = cashFlowFormFields.id.value;
  if (!id) return;
  deleteCashFlowItem(id);
});

els.saveSnapshotBtn.addEventListener("click", saveSnapshot);
els.printFinancialReviewBtn.addEventListener("click", printFinancialReview);
els.exportFinancialReviewBtn.addEventListener("click", exportFinancialReviewData);
els.exportJsonBtn.addEventListener("click", exportBackup);
els.importJsonInput.addEventListener("change", () => {
  const file = els.importJsonInput.files[0];
  if (file) importBackup(file);
  els.importJsonInput.value = "";
});

els.clearHistoryBtn.addEventListener("click", () => {
  state.history = [];
  saveState("History cleared.");
  renderHistory();
});

els.historyList.addEventListener("click", (event) => {
  const link = event.target.closest("[data-month]");
  if (!link) return;
  event.preventDefault();
  window.location.hash = `month=${link.dataset.month}`;
  goToReviewMonth(link.dataset.month);
});

els.calendarList.addEventListener("click", (event) => {
  const link = event.target.closest("[data-month]");
  if (!link) return;
  event.preventDefault();
  window.location.hash = `month=${link.dataset.month}`;
  goToReviewMonth(link.dataset.month);
});

window.addEventListener("hashchange", () => {
  const month = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("month");
  if (month && month !== state.reviewMonth) goToReviewMonth(month);
});
