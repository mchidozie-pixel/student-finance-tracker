// ============ STATE & STORAGE ============
const STATE = {
    transactions: [],
    currentEditId: null,
    sortField: 'date',
    sortOrder: 'desc',
    settings: {
        baseCurrency: 'USD',
        rateEur: 1.10,
        rateGbp: 1.27,
        spendingCap: 500
    }
};

const STORAGE_KEY = 'sft_transactions';
const SETTINGS_KEY = 'sft_settings';

// ============ VALIDATORS ============
const VALIDATORS = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\s+\1\b/i
};

// ============ UTILITY FUNCTIONS ============
function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('alert');
    alertEl.textContent = message;
    alertEl.className = `alert show ${type}`;
    setTimeout(() => alertEl.classList.remove('show'), 4000);
}

function updateAriaLive(message, priority = 'polite') {
    const ariaLive = document.getElementById('aria-live');
    ariaLive.setAttribute('aria-live', priority);
    ariaLive.textContent = message;
}

function generateId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    const symbol = STATE.settings.baseCurrency === 'USD' ? '$' : 
                  STATE.settings.baseCurrency === 'EUR' ? '€' : '£';
    return symbol + parseFloat(amount).toFixed(2);
}

// ============ STORAGE FUNCTIONS ============
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.transactions));
}

function loadFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            STATE.transactions = JSON.parse(data);
            return true;
        }
    } catch (e) {
        console.error('Storage load error:', e);
        showAlert('Error loading data from storage', 'error');
    }
    return false;
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(STATE.settings));
}

function loadSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (data) {
            Object.assign(STATE.settings, JSON.parse(data));
            updateSettingsUI();
        }
    } catch (e) {
        console.error('Settings load error:', e);
    }
}

// ============ VALIDATION FUNCTIONS ============
function validateField(field, value) {
    const rules = {
        description: [
            { regex: VALIDATORS.description, message: 'Description must not have leading/trailing spaces' }
        ],
        amount: [
            { regex: /\S/, message: 'Amount is required' },
            { regex: VALIDATORS.amount, message: 'Amount must be a valid number (0-2 decimals)' }
        ],
        date: [
            { regex: /\S/, message: 'Date is required' },
            { regex: VALIDATORS.date, message: 'Date must be YYYY-MM-DD format' }
        ],
        category: [
            { regex: /\S/, message: 'Category is required' },
            { regex: VALIDATORS.category, message: 'Category contains invalid characters' }
        ]
    };

    if (!rules[field]) return null;

    for (const rule of rules[field]) {
        if (!rule.regex.test(value)) {
            return rule.message;
        }
    }
    return null;
}

function checkDuplicateWords(text) {
    return VALIDATORS.duplicateWords.test(text);
}

// ============ DASHBOARD FUNCTIONS ============
function updateDashboard() {
    const totalRecords = STATE.transactions.length;
    const totalAmount = STATE.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    document.getElementById('total-records').textContent = totalRecords;
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);

    // Top category
    const categories = {};
    STATE.transactions.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + 1;
    });
    const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('top-category').textContent = topCat ? topCat[0] : '—';

    // Cap status
    const cap = STATE.settings.spendingCap;
    const capBox = document.getElementById('cap-status');
    const capMsg = `${formatCurrency(totalAmount)} / ${formatCurrency(cap)}`;
    document.getElementById('cap-amount').textContent = capMsg;

    capBox.className = totalAmount > cap ? 'stat-box danger' : 'stat-box warning';

    const capMsg2 = totalAmount > cap 
        ? `Warning: Spending exceeds budget by ${formatCurrency(totalAmount - cap)}`
        : `On track. ${formatCurrency(cap - totalAmount)} remaining`;
    
    updateAriaLive(capMsg2, totalAmount > cap ? 'assertive' : 'polite');

    // Trend chart
    updateTrendChart();
}

function updateTrendChart() {
    const trendChart = document.getElementById('trend-chart');
    trendChart.innerHTML = '';

    const today = new Date();
    const last7Days = {};

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        last7Days[key] = 0;
    }

    STATE.transactions.forEach(t => {
        if (last7Days.hasOwnProperty(t.date)) {
            last7Days[t.date] += parseFloat(t.amount);
        }
    });

    const maxAmount = Math.max(...Object.values(last7Days), 1);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    Object.entries(last7Days).forEach(([ date, amount ]) => {
        const height = (amount / maxAmount) * 100;
        const dayDate = new Date(date + 'T00:00');
        const dayName = days[dayDate.getDay()];

        const bar = document.createElement('div');
        bar.className = 'trend-bar';
        bar.style.height = Math.max(height, 20) + 'px';
        bar.title = `${dayName}: ${formatCurrency(amount)}`;
        bar.innerHTML = `<span class="trend-label">${dayName}</span>`;
        bar.setAttribute('aria-label', `${dayName}: ${formatCurrency(amount)}`);

        trendChart.appendChild(bar);
    });
}

// ============ RECORDS FUNCTIONS ============
function renderRecords() {
    const tbody = document.getElementById('transactions-tbody');
    const cardsView = document.getElementById('cards-view');
    tbody.innerHTML = '';
    cardsView.innerHTML = '';

    if (STATE.transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No transactions yet.</td></tr>';
        return;
    }

    STATE.transactions.forEach(txn => {
        // Table row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(txn.date)}</td>
            <td>${txn.description}</td>
            <td><span class="category">${txn.category}</span></td>
            <td>${formatCurrency(txn.amount)}</td>
            <td>
                <button class="secondary" style="padding:0.4rem 0.8rem;font-size:0.875rem;" onclick="editTransaction('${txn.id}')">Edit</button>
                <button class="danger" style="padding:0.4rem 0.8rem;font-size:0.875rem;" onclick="deleteTransaction('${txn.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);

        // Card for mobile
        const card = document.createElement('div');
        card.className = 'transaction-card';
        card.innerHTML = `
            <div>
                <strong>${txn.description}</strong><br>
                <small style="color:#6b7280;">${formatDate(txn.date)}</small>
                <div class="category">${txn.category}</div>
            </div>
            <div>
                <div class="amount">${formatCurrency(txn.amount)}</div>
                <div class="actions" style="margin:0;">
                    <button class="secondary" style="margin:0;" onclick="editTransaction('${txn.id}')">Edit</button>
                    <button class="danger" style="margin:0;" onclick="deleteTransaction('${txn.id}')">Delete</button>
                </div>
            </div>
        `;
        cardsView.appendChild(card);
    });
}

function sortTransactions(field) {
    if (STATE.sortField === field) {
        STATE.sortOrder = STATE.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        STATE.sortField = field;
        STATE.sortOrder = 'asc';
    }

    STATE.transactions.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === 'amount') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        } else if (field === 'description') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return STATE.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return STATE.sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    updateSortUI();
    renderRecords();
}

function updateSortUI() {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.field === STATE.sortField) {
            th.classList.add(`sorted-${STATE.sortOrder}`);
        }
    });
}

function addTransaction(formData) {
    const txn = {
        id: STATE.currentEditId || generateId(),
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        createdAt: STATE.currentEditId ? 
            STATE.transactions.find(t => t.id === STATE.currentEditId).createdAt : 
            new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (STATE.currentEditId) {
        const index = STATE.transactions.findIndex(t => t.id === STATE.currentEditId);
        STATE.transactions[index] = txn;
    } else {
        STATE.transactions.push(txn);
    }

    saveToStorage();
    renderRecords();
    updateDashboard();
    showAlert(STATE.currentEditId ? 'Transaction updated!' : 'Transaction added!');
}

function editTransaction(id) {
    const txn = STATE.transactions.find(t => t.id === id);
    if (!txn) return;

    STATE.currentEditId = id;
    document.getElementById('form-title').textContent = 'Edit Transaction';
    document.getElementById('description').value = txn.description;
    document.getElementById('amount').value = txn.amount;
    document.getElementById('category').value = txn.category;
    document.getElementById('date').value = txn.date;
    document.getElementById('cancel-edit').style.display = 'block';

    document.querySelector('nav button[data-section="add"]').click();
    window.scrollTo(0, 0);
}

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        STATE.transactions = STATE.transactions.filter(t => t.id !== id);
        saveToStorage();
        renderRecords();
        updateDashboard();
        showAlert('Transaction deleted.');
    }
}

// ============ FORM FUNCTIONS ============
function setupFormHandlers() {
    const form = document.getElementById('transaction-form');
    const fields = ['description', 'amount', 'category', 'date'];

    fields.forEach(field => {
        const input = document.getElementById(field);
        input.addEventListener('blur', () => {
            const error = validateField(field, input.value);
            const errorEl = document.getElementById(`error-${field}`);
            if (error) {
                errorEl.textContent = error;
                errorEl.classList.add('show');
            } else {
                errorEl.classList.remove('show');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            description: document.getElementById('description').value,
            amount: document.getElementById('amount').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };

        let hasError = false;
        fields.forEach(field => {
            const error = validateField(field, formData[field]);
            const errorEl = document.getElementById(`error-${field}`);
            if (error) {
                errorEl.textContent = error;
                errorEl.classList.add('show');
                hasError = true;
            } else {
                errorEl.classList.remove('show');
            }
        });

        if (document.getElementById('duplicate-check').checked) {
            if (checkDuplicateWords(formData.description)) {
                showAlert('Description contains duplicate words (e.g., "coffee coffee")', 'warning');
                return;
            }
        }

        if (!hasError) {
            addTransaction(formData);
            form.reset();
            STATE.currentEditId = null;
            document.getElementById('form-title').textContent = 'Add New Transaction';
            document.getElementById('cancel-edit').style.display = 'none';
        }
    });

    document.getElementById('cancel-edit').addEventListener('click', () => {
        form.reset();
        STATE.currentEditId = null;
        document.getElementById('form-title').textContent = 'Add New Transaction';
        document.getElementById('cancel-edit').style.display = 'none';
    });
}

// ============ SEARCH FUNCTIONS ============
function setupSearchHandlers() {
    const searchBtn = document.getElementById('search-btn');
    const patternInput = document.getElementById('regex-pattern');

    searchBtn.addEventListener('click', performSearch);
    patternInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function performSearch() {
    const pattern = document.getElementById('regex-pattern').value;
    const caseInsensitive = document.getElementById('case-insensitive').checked;
    const errorEl = document.getElementById('search-error');
    const resultsEl = document.getElementById('search-results');

    errorEl.classList.remove('show');
    resultsEl.innerHTML = '';

    if (!pattern.trim()) {
        errorEl.textContent = 'Please enter a search pattern';
        errorEl.classList.add('show');
        return;
    }

    try {
        const flags = caseInsensitive ? 'gi' : 'g';
        const regex = new RegExp(pattern, flags);

        const results = STATE.transactions.filter(txn => {
            return regex.test(txn.description) || regex.test(txn.category);
        });

        if (results.length === 0) {
            resultsEl.innerHTML = '<p style="color:#6b7280;">No matches found.</p>';
            return;
        }

        let html = `<p><strong>${results.length} match(es) found:</strong></p>`;
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;margin-top:1rem;">';

        results.forEach(txn => {
            const highlightedDesc = txn.description.replace(
                new RegExp(`(${pattern})`, caseInsensitive ? 'gi' : 'g'),
                '<mark>$1</mark>'
            );
            const highlightedCat = txn.category.replace(
                new RegExp(`(${pattern})`, caseInsensitive ? 'gi' : 'g'),
                '<mark>$1</mark>'
            );

            html += `
                <div style="background:white;padding:1rem;border-radius:8px;border:1px solid var(--border);">
                    <strong>${highlightedDesc}</strong><br>
                    <small style="color:#6b7280;">${formatDate(txn.date)}</small><br>
                    <span class="category">${highlightedCat}</span><br>
                    <div style="margin-top:0.5rem;font-weight:700;">${formatCurrency(txn.amount)}</div>
                </div>
            `;
        });

        html += '</div>';
        resultsEl.innerHTML = html;
    } catch (e) {
        errorEl.textContent = `Invalid regex: ${e.message}`;
        errorEl.classList.add('show');
    }
}

// ============ IMPORT/EXPORT FUNCTIONS ============
function setupImportExport() {
    document.getElementById('export-btn').addEventListener('click', () => {
        const dataStr = JSON.stringify(STATE.transactions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finances.json';
        a.click();
        showAlert('Data exported successfully!');
    });

    document.getElementById('import-btn-show').addEventListener('click', () => {
        document.getElementById('import-section').style.display = 'block';
    });

    document.getElementById('import-cancel').addEventListener('click', () => {
        document.getElementById('import-section').style.display = 'none';
        document.getElementById('import-json').value = '';
    });

    document.getElementById('import-confirm').addEventListener('click', () => {
        const json = document.getElementById('import-json').value;
        try {
            const data = JSON.parse(json);
            if (!Array.isArray(data)) throw new Error('Data must be an array');
            
            // Validate structure
            data.forEach(item => {
                if (!item.id || !item.description || !item.amount || !item.category || !item.date || !item.createdAt || !item.updatedAt) {
                    throw new Error('Missing required fields in record');
                }
            });

            STATE.transactions = data;
            saveToStorage();
            renderRecords();
            updateDashboard();
            showAlert('Data imported successfully!');
            document.getElementById('import-section').style.display = 'none';
            document.getElementById('import-json').value = '';
        } catch (e) {
            showAlert(`Import error: ${e.message}`, 'error');
        }
    });
}

// ============ SETTINGS FUNCTIONS ============
function setupSettingsHandlers() {
    document.getElementById('save-settings').addEventListener('click', () => {
        STATE.settings.baseCurrency = document.getElementById('base-currency').value;
        STATE.settings.rateEur = parseFloat(document.getElementById('rate-eur').value) || 1.10;
        STATE.settings.rateGbp = parseFloat(document.getElementById('rate-gbp').value) || 1.27;
        STATE.settings.spendingCap = parseFloat(document.getElementById('spending-cap').value) || 500;

        saveSettings();
        renderRecords();
        updateDashboard();
        showAlert('Settings saved!');
    });
}

function updateSettingsUI() {
    document.getElementById('base-currency').value = STATE.settings.baseCurrency;
    document.getElementById('rate-eur').value = STATE.settings.rateEur;
    document.getElementById('rate-gbp').value = STATE.settings.rateGbp;
    document.getElementById('spending-cap').value = STATE.settings.spendingCap;
}

// ============ NAVIGATION ============
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            
            document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');

            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (sectionId === 'records') {
                document.getElementById('table-view').style.display = window.innerWidth >= 768 ? 'block' : 'none';
                document.getElementById('cards-view').style.display = window.innerWidth < 768 ? 'block' : 'none';
            }
        });
    });

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            sortTransactions(th.dataset.field);
        });
    });
}

// ============ QUICK SEARCH ============
function setupQuickSearch() {
    document.getElementById('quick-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const tbody = document.getElementById('transactions-tbody');
        const cardsView = document.getElementById('cards-view');

        if (!query) {
            renderRecords();
            return;
        }

        tbody.innerHTML = '';
        cardsView.innerHTML = '';

        const filtered = STATE.transactions.filter(txn => 
            txn.description.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No matches found.</td></tr>';
            return;
        }

        filtered.forEach(txn => {
            const tr = document.createElement('tr');
            const desc = txn.description.replace(
                new RegExp(`(${query})`, 'gi'),
                '<mark>$1</mark>'
            );
            tr.innerHTML = `
                <td>${formatDate(txn.date)}</td>
                <td>${desc}</td>
                <td><span class="category">${txn.category}</span></td>
                <td>${formatCurrency(txn.amount)}</td>
                <td>
                    <button class="secondary" style="padding:0.4rem 0.8rem;font-size:0.875rem;" onclick="editTransaction('${txn.id}')">Edit</button>
                    <button class="danger" style="padding:0.4rem 0.8rem;font-size:0.875rem;" onclick="deleteTransaction('${txn.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);

            const card = document.createElement('div');
            card.className = 'transaction-card';
            card.innerHTML = `
                <div>
                    <strong>${desc}</strong><br>
                    <small style="color:#6b7280;">${formatDate(txn.date)}</small>
                    <div class="category">${txn.category}</div>
                </div>
                <div>
                    <div class="amount">${formatCurrency(txn.amount)}</div>
                    <div class="actions" style="margin:0;">
                        <button class="secondary" style="margin:0;" onclick="editTransaction('${txn.id}')">Edit</button>
                        <button class="danger" style="margin:0;" onclick="deleteTransaction('${txn.id}')">Delete</button>
                    </div>
                </div>
            `;
            cardsView.appendChild(card);
        });
    });
}

// ============ RESPONSIVE VIEW SWITCHING ============
function setupResponsiveView() {
    const updateView = () => {
        const isMobile = window.innerWidth < 768;
        const tableView = document.getElementById('table-view');
        const cardsView = document.getElementById('cards-view');

        if (document.getElementById('records').classList.contains('active')) {
            tableView.style.display = isMobile ? 'none' : 'block';
            cardsView.style.display = isMobile ? 'block' : 'none';
        }
    };

    window.addEventListener('resize', updateView);
    updateView();
}

// ============ INITIALIZATION ============
function initApp() {
    loadFromStorage();
    loadSettings();
    setupNavigation();
    setupFormHandlers();
    setupSearchHandlers();
    setupImportExport();
    setupSettingsHandlers();
    setupQuickSearch();
    setupResponsiveView();

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').valueAsDate = new Date(today + 'T00:00');

    renderRecords();
    updateDashboard();
    updateSettingsUI();
}

// Start the app
initApp();
