const STORAGE_KEY = "mk-budget-review-v1";

const categories = [
  "Business loan",
  "Utilities",
  "Rent",
  "Personal Credit Card",
  "Business Credit Card",
  "Personal Loan",
  "Misc. Credit",
  "Entertainment",
  "Tax",
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
  { key: "interestRate", label: "APR %", sortable: true },
  { key: "estimatedMonthlyInterest", label: "Est. Monthly Interest", sortable: true },
  { key: "currentDue", label: "Current Due", sortable: true },
  { key: "amountUpdatedDate", label: "Amount Updated", sortable: true },
  { key: "paymentDueDate", label: "Payment Due", sortable: true },
  { key: "plannedPayment", label: "Planned Payment", sortable: true },
  { key: "paid", label: "Paid", sortable: true },
  { key: "paymentDate", label: "Payment Date", sortable: true },
  { key: "notes", label: "Notes", sortable: true },
];

const defaultColumnOrder = reviewColumns.map((column) => column.key);

const state = loadState();

const els = {
  pageTitle: document.querySelector("#pageTitle"),
  navTabs: document.querySelectorAll(".nav-tab"),
  reviewMonth: document.querySelector("#reviewMonth"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  addAccountBtn: document.querySelector("#addAccountBtn"),
  saveSnapshotBtn: document.querySelector("#saveSnapshotBtn"),
  printFinancialReviewBtn: document.querySelector("#printFinancialReviewBtn"),
  exportFinancialReviewBtn: document.querySelector("#exportFinancialReviewBtn"),
  exportJsonBtn: document.querySelector("#exportJsonBtn"),
  importJsonInput: document.querySelector("#importJsonInput"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
  reviewHead: document.querySelector("#reviewHead"),
  reviewRows: document.querySelector("#reviewRows"),
  accountCards: document.querySelector("#accountCards"),
  historyList: document.querySelector("#historyList"),
  accountCount: document.querySelector("#accountCount"),
  form: document.querySelector("#accountForm"),
  formTitle: document.querySelector("#formTitle"),
  resetFormBtn: document.querySelector("#resetFormBtn"),
  deleteAccountBtn: document.querySelector("#deleteAccountBtn"),
  totalCurrentDue: document.querySelector("#totalCurrentDue"),
  totalPlanned: document.querySelector("#totalPlanned"),
  totalRemaining: document.querySelector("#totalRemaining"),
  totalBalance: document.querySelector("#totalBalance"),
  totalMonthlyInterest: document.querySelector("#totalMonthlyInterest"),
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
  interestRate: document.querySelector("#accountInterestRate"),
  currentDue: document.querySelector("#accountCurrentDue"),
  amountUpdatedDate: document.querySelector("#accountAmountUpdated"),
  paymentDueDate: document.querySelector("#accountPaymentDue"),
  plannedPayment: document.querySelector("#accountPlanned"),
  paid: document.querySelector("#accountPaid"),
  paymentDate: document.querySelector("#accountPaymentDate"),
  notes: document.querySelector("#accountNotes"),
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

function loadState() {
  const fallback = {
    reviewMonth: new Date().toISOString().slice(0, 7),
    accounts: seedAccounts,
    history: [],
    reviewColumnOrder: defaultColumnOrder,
    reviewSort: { key: "", direction: "asc" },
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      reviewMonth: parsed.reviewMonth || fallback.reviewMonth,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : fallback.accounts,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      reviewColumnOrder: normalizeColumnOrder(parsed.reviewColumnOrder),
      reviewSort: normalizeReviewSort(parsed.reviewSort),
    };
  } catch {
    return fallback;
  }
}

function saveState(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) showToast(message);
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
  const accounts = [...filteredAccounts()];
  const sort = state.reviewSort;
  if (!sort?.key) return accounts;
  const direction = sort.direction === "desc" ? -1 : 1;
  accounts.sort((a, b) => compareSortValue(a, b, sort.key) * direction);
  return accounts;
}

function compareSortValue(a, b, key) {
  const numericFields = new Set(["balance", "interestRate", "estimatedMonthlyInterest", "currentDue", "plannedPayment"]);
  const booleanFields = new Set(["active", "paid"]);
  if (key === "estimatedMonthlyInterest") return estimatedMonthlyInterest(a) - estimatedMonthlyInterest(b);
  if (numericFields.has(key)) return numberValue(a[key]) - numberValue(b[key]);
  if (booleanFields.has(key)) return Number(a[key]) - Number(b[key]);
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

function renderCategoryOptions() {
  els.categoryFilter.innerHTML = ["All", ...categories].map((name) => `<option>${escapeHtml(name)}</option>`).join("");
  formFields.category.innerHTML = categories.map((name) => `<option>${escapeHtml(name)}</option>`).join("");
}

function renderTotals() {
  const accounts = activeAccounts();
  const totalCurrentDue = accounts.reduce((sum, item) => sum + numberValue(item.currentDue), 0);
  const totalPlanned = accounts.reduce((sum, item) => sum + numberValue(item.plannedPayment), 0);
  const totalRemaining = accounts.reduce((sum, item) => sum + (item.paid ? 0 : numberValue(item.plannedPayment)), 0);
  const totalBalance = accounts.reduce((sum, item) => sum + numberValue(item.balance), 0);
  const totalMonthlyInterest = accounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0);
  els.totalCurrentDue.textContent = money(totalCurrentDue);
  els.totalPlanned.textContent = money(totalPlanned);
  els.totalRemaining.textContent = money(totalRemaining);
  els.totalBalance.textContent = money(totalBalance);
  els.totalMonthlyInterest.textContent = money(totalMonthlyInterest);
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
    interestRate: `<td class="money readonly-cell">${formatPercent(item.interestRate)}</td>`,
    estimatedMonthlyInterest: `<td class="money readonly-cell">${estimatedMonthlyInterest(item) ? money(estimatedMonthlyInterest(item)) : ""}</td>`,
    currentDue: `<td><input data-field="currentDue" type="number" step="0.01" min="0" value="${escapeAttr(item.currentDue)}"></td>`,
    amountUpdatedDate: `<td><input data-field="amountUpdatedDate" type="date" value="${escapeAttr(item.amountUpdatedDate)}"></td>`,
    paymentDueDate: `<td><input data-field="paymentDueDate" type="date" value="${escapeAttr(item.paymentDueDate)}"></td>`,
    plannedPayment: `<td><input data-field="plannedPayment" type="number" step="0.01" min="0" value="${escapeAttr(item.plannedPayment)}"></td>`,
    paid: `<td><select data-field="paid"><option value="false"${!item.paid ? " selected" : ""}>No</option><option value="true"${item.paid ? " selected" : ""}>Yes</option></select></td>`,
    paymentDate: `<td><input data-field="paymentDate" type="date" value="${escapeAttr(item.paymentDate)}"></td>`,
    notes: `<td><textarea data-field="notes" rows="1">${escapeHtml(item.notes)}</textarea></td>`,
  };
  return cells[key] || "<td></td>";
}

function renderAccountCards() {
  els.accountCount.textContent = `${state.accounts.length} accounts`;
  els.accountCards.innerHTML = filteredAccounts().map((item) => `
    <article class="account-card">
      <header>
        <div>
          <h4>${escapeHtml(item.name)}</h4>
          <div class="muted">${escapeHtml(item.hint || "No account hint")}</div>
        </div>
        <span class="tag">${escapeHtml(item.category)}</span>
      </header>
      <div class="muted">Current due ${money(item.currentDue)} · Balance ${money(item.balance)} · Est. monthly interest ${money(estimatedMonthlyInterest(item))}</div>
      <div class="row-actions">
        <button type="button" data-edit="${item.id}">Edit</button>
        ${normalizeUrl(item.url) ? `<a class="open-link" href="${escapeAttr(normalizeUrl(item.url))}" target="_blank" rel="noopener">Open website</a>` : `<span class="muted">No URL saved</span>`}
      </div>
    </article>
  `).join("");
}

function renderHistory() {
  if (!state.history.length) {
    els.historyList.innerHTML = `<div class="history-item"><p class="muted">No saved month snapshots yet.</p></div>`;
    return;
  }
  els.historyList.innerHTML = state.history.map((snapshot) => `
    <article class="history-item">
      <header>
        <div>
          <h4>${escapeHtml(snapshot.reviewMonth)}</h4>
          <div class="muted">Saved ${escapeHtml(snapshot.savedAt)}</div>
        </div>
        <span class="tag">${snapshot.accounts.length} accounts</span>
      </header>
      <div class="row-actions">
        <span>Total due ${money(snapshot.totalCurrentDue)}</span>
        <span>Planned ${money(snapshot.totalPlanned)}</span>
        <span>Balance ${money(snapshot.totalBalance)}</span>
        <span>Interest ${money(snapshot.totalMonthlyInterest)}</span>
      </div>
    </article>
  `).join("");
}

function renderAll() {
  els.reviewMonth.value = state.reviewMonth;
  renderTotals();
  renderReview();
  renderAccountCards();
  renderHistory();
}

function setView(name) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active-view"));
  document.querySelector(`#${name}View`).classList.add("active-view");
  els.navTabs.forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  els.pageTitle.textContent = name === "review" ? "Monthly Review" : name === "accounts" ? "Accounts" : "History";
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

function updateInline(row, event) {
  const id = row.dataset.id;
  const item = state.accounts.find((accountItem) => accountItem.id === id);
  if (!item) return;
  const field = event.target.dataset.field;
  if (["name", "balance"].includes(field)) return;
  let value = event.target.value;
  if (["active", "paid"].includes(field)) value = value === "true";
  if (["currentDue", "plannedPayment"].includes(field)) value = value === "" ? "" : numberValue(value);
  item[field] = value;
  if (field === "currentDue" && !item.amountUpdatedDate) {
    item.amountUpdatedDate = new Date().toISOString().slice(0, 10);
  }
  saveState();
  renderTotals();
  renderAccountCards();
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

function editAccountUrl(id) {
  const item = state.accounts.find((accountItem) => accountItem.id === id);
  if (!item) return;
  fillForm(item);
  setView("accounts");
  formFields.url.focus();
}

function saveSnapshot() {
  const accounts = activeAccounts();
  const totalMonthlyInterest = accounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0);
  const snapshot = {
    id: crypto.randomUUID(),
    reviewMonth: state.reviewMonth,
    savedAt: new Date().toLocaleString("en-US"),
    totalCurrentDue: accounts.reduce((sum, item) => sum + numberValue(item.currentDue), 0),
    totalPlanned: accounts.reduce((sum, item) => sum + numberValue(item.plannedPayment), 0),
    totalBalance: accounts.reduce((sum, item) => sum + numberValue(item.balance), 0),
    totalMonthlyInterest,
    accounts: structuredClone(accounts),
  };
  state.history.unshift(snapshot);
  saveState("Month snapshot saved.");
  renderHistory();
}

function buildFinancialReviewData() {
  const accounts = activeAccounts();
  const byCategory = categories.map((category) => {
    const categoryAccounts = accounts.filter((item) => item.category === category);
    return {
      category,
      accountCount: categoryAccounts.length,
      totalBalance: categoryAccounts.reduce((sum, item) => sum + numberValue(item.balance), 0),
      totalCurrentDue: categoryAccounts.reduce((sum, item) => sum + numberValue(item.currentDue), 0),
      totalPlannedPayment: categoryAccounts.reduce((sum, item) => sum + numberValue(item.plannedPayment), 0),
      estimatedMonthlyInterest: categoryAccounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0),
    };
  }).filter((item) => item.accountCount > 0);

  return {
    reportType: "Budget Review Integration",
    reviewMonth: state.reviewMonth,
    generatedAt: new Date().toISOString(),
    totals: {
      totalCurrentDue: accounts.reduce((sum, item) => sum + numberValue(item.currentDue), 0),
      totalPlannedPayment: accounts.reduce((sum, item) => sum + numberValue(item.plannedPayment), 0),
      remainingUnpaid: accounts.reduce((sum, item) => sum + (item.paid ? 0 : numberValue(item.plannedPayment)), 0),
      totalBalance: accounts.reduce((sum, item) => sum + numberValue(item.balance), 0),
      estimatedMonthlyInterest: accounts.reduce((sum, item) => sum + estimatedMonthlyInterest(item), 0),
    },
    categories: byCategory,
    accounts: accounts.map((item) => ({
      category: item.category,
      accountName: item.name,
      accountHint: item.hint,
      balance: numberValue(item.balance),
      interestRateApr: item.interestRate === "" ? "" : numberValue(item.interestRate),
      estimatedMonthlyInterest: estimatedMonthlyInterest(item),
      currentDue: numberValue(item.currentDue),
      plannedPayment: numberValue(item.plannedPayment),
      paid: Boolean(item.paid),
      amountUpdatedDate: item.amountUpdatedDate,
      paymentDueDate: item.paymentDueDate,
      paymentDate: item.paymentDate,
      notes: item.notes,
    })),
  };
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
      <td>${formatPercent(item.interestRateApr)}</td>
      <td>${money(item.estimatedMonthlyInterest)}</td>
      <td>${money(item.currentDue)}</td>
      <td>${money(item.plannedPayment)}</td>
      <td>${escapeHtml(item.paymentDueDate || "")}</td>
    </tr>
  `).join("");
  const categoryRows = data.categories.map((item) => `
    <tr>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.accountCount}</td>
      <td>${money(item.totalBalance)}</td>
      <td>${money(item.totalCurrentDue)}</td>
      <td>${money(item.totalPlannedPayment)}</td>
      <td>${money(item.estimatedMonthlyInterest)}</td>
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
        .muted { color: #64707d; margin-top: 6px; }
        .metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; }
        .metric { border: 1px solid #d8e0e7; padding: 10px; border-radius: 6px; }
        .metric span { display: block; font-size: 11px; color: #64707d; font-weight: 700; }
        .metric strong { display: block; margin-top: 6px; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th, td { border-bottom: 1px solid #d8e0e7; padding: 7px; text-align: left; }
        th { background: #eef5f8; }
      </style>
    </head>
    <body>
      <h1>Budget Financial Review</h1>
      <p class="muted">Michael Kokernak · ${escapeHtml(data.reviewMonth)} · Generated ${escapeHtml(new Date(data.generatedAt).toLocaleString("en-US"))}</p>
      <section class="metrics">
        <div class="metric"><span>Total Due</span><strong>${money(data.totals.totalCurrentDue)}</strong></div>
        <div class="metric"><span>Planned</span><strong>${money(data.totals.totalPlannedPayment)}</strong></div>
        <div class="metric"><span>Remaining</span><strong>${money(data.totals.remainingUnpaid)}</strong></div>
        <div class="metric"><span>Balance</span><strong>${money(data.totals.totalBalance)}</strong></div>
        <div class="metric"><span>Est. Monthly Interest</span><strong>${money(data.totals.estimatedMonthlyInterest)}</strong></div>
      </section>
      <h2>Category Summary</h2>
      <table>
        <thead><tr><th>Category</th><th>Accounts</th><th>Balance</th><th>Current Due</th><th>Planned</th><th>Est. Interest</th></tr></thead>
        <tbody>${categoryRows}</tbody>
      </table>
      <h2>Account Detail</h2>
      <table>
        <thead><tr><th>Category</th><th>Account</th><th>Balance</th><th>APR</th><th>Est. Interest</th><th>Current Due</th><th>Planned</th><th>Due Date</th></tr></thead>
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

function formatPercent(value) {
  if (value === "" || value === null || value === undefined) return "";
  const number = numberValue(value);
  return `${number.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

renderCategoryOptions();
renderAll();
fillForm();

els.navTabs.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

els.reviewMonth.addEventListener("change", () => {
  state.reviewMonth = els.reviewMonth.value;
  saveState("Review month updated.");
});

els.searchInput.addEventListener("input", () => {
  renderReview();
  renderAccountCards();
});

els.categoryFilter.addEventListener("change", () => {
  renderReview();
  renderAccountCards();
});

els.addAccountBtn.addEventListener("click", () => {
  fillForm();
  setView("accounts");
  formFields.name.focus();
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
