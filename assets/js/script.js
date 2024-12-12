// Global variables
let currentUser = null;
let transactions = [];
let isOnline = navigator.onLine;
let pendingTransactions = [];

// Initialize the application
function initializeApp() {
    handleOnlineStatus();
    const savedTransactions = localStorage.getItem('pendingTransactions');
    if (savedTransactions) {
        try {
            pendingTransactions = JSON.parse(savedTransactions);
        } catch (error) {
            console.error('Error loading pending transactions:', error);
            localStorage.removeItem('pendingTransactions');
        }
    }
}

// Event Listeners
function setupEventListeners() {
    // Close modal when clicking the X
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('receiptModal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target == document.getElementById('receiptModal')) {
            document.getElementById('receiptModal').style.display = 'none';
        }
    });
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation active state
    document.querySelectorAll('#navigation a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`#navigation a[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

// Vehicle Type Functions
function updateSubTypes() {
    const vehicleType = document.getElementById('vehicleType').value;
    const subTypeSelect = document.getElementById('vehicleSubType');
    subTypeSelect.innerHTML = '<option value="">Select Size/Model</option>';
    
    if (vehicleType && vehicleTypes[vehicleType]) {
        vehicleTypes[vehicleType].forEach(subType => {
            const option = document.createElement('option');
            option.value = JSON.stringify(subType);
            option.textContent = `${subType.model} - Rp ${subType.price.toLocaleString()}`;
            subTypeSelect.appendChild(option);
        });
    }
}

// Transaction Functions
async function processTransaction(transactionData) {
    if (!transactionData) return;

    const transaction = {
        id: Date.now(),
        ...transactionData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        cashier: currentUser?.uid,
        status: 'pending'
    };

    try {
        if (isOnline) {
            await saveTransactionToFirestore(transaction);
        } else {
            savePendingTransaction(transaction);
        }
        
        updateUI(transaction);
        showReceipt(transaction);
        showToast('Transaksi berhasil', 'success');
    } catch (error) {
        handleError(error);
    }
}

async function saveTransactionToFirestore(transaction) {
    try {
        await db.collection('transactions').add(transaction);
        console.log('Transaction saved to Firestore:', transaction.id);
    } catch (error) {
        throw new Error('Failed to save transaction: ' + error.message);
    }
}

function savePendingTransaction(transaction) {
    pendingTransactions.push(transaction);
    localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
    console.log('Transaction saved locally:', transaction.id);
}

async function syncPendingTransactions() {
    if (!pendingTransactions.length) return;

    const batch = db.batch();
    
    try {
        pendingTransactions.forEach(transaction => {
            const ref = db.collection('transactions').doc();
            batch.set(ref, transaction);
        });

        await batch.commit();
        pendingTransactions = [];
        localStorage.removeItem('pendingTransactions');
        showToast('Transaksi tersinkronisasi', 'success');
    } catch (error) {
        handleError(error);
    }
}

// Fungsi untuk reset form transaksi
function resetTransactionForm() {
    document.getElementById('vehicleType').value = '';
    document.getElementById('vehicleSubType').value = '';
    document.getElementById('vehicleDisplay').innerHTML = '';
    document.getElementById('errorMessage').style.display = 'none';
}

// Fungsi untuk update laporan
function updateReports() {
    updateDailyReport();
    updateWeeklyReport();
    updateMonthlyReport();
}

// Fungsi untuk update laporan harian
function updateDailyReport() {
    const today = new Date().toDateString();
    const dailyTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === today
    );
    
    const dailyTotal = dailyTransactions.reduce((sum, t) => sum + t.price, 0);
    document.getElementById('dailyTotal').textContent = `Rp ${dailyTotal.toLocaleString()}`;
    
    displayTransactions('dailyTransactions', dailyTransactions);
}

// Fungsi untuk update laporan mingguan
function updateWeeklyReport() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weeklyTransactions = transactions.filter(t => 
        new Date(t.date) >= weekStart
    );
    
    const weeklyTotal = weeklyTransactions.reduce((sum, t) => sum + t.price, 0);
    document.getElementById('weeklyTotal').textContent = `Rp ${weeklyTotal.toLocaleString()}`;
    
    displayTransactions('weeklyTransactions', weeklyTransactions);
}

// Fungsi untuk update laporan bulanan
function updateMonthlyReport() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTransactions = transactions.filter(t => 
        new Date(t.date) >= monthStart
    );
    
    const monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + t.price, 0);
    document.getElementById('monthlyTotal').textContent = `Rp ${monthlyTotal.toLocaleString()}`;
    
    displayTransactions('monthlyTransactions', monthlyTransactions);
}

// Fungsi untuk menampilkan daftar transaksi
function displayTransactions(elementId, transactionList) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    transactionList.forEach(t => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
            <span>${new Date(t.date).toLocaleString()} - ${t.vehicleType} ${t.vehicleModel}</span>
            <span>Rp ${t.price.toLocaleString()}</span>
        `;
        container.appendChild(div);
    });
}

// Fungsi untuk mencetak struk
async function printReceipt() {
    if ('bluetooth' in navigator) {
        try {
            // For Bluetooth printers
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['printing_service'] }]
            });
            // Implement printer-specific logic here
        } catch (error) {
            // Fallback to traditional printing
            const receiptWindow = window.open('', '_blank');
            receiptWindow.document.write(document.getElementById('receipt').innerHTML);
            receiptWindow.print();
        }
    } else {
        // Fallback untuk browser yang tidak mendukung Bluetooth
        const receiptWindow = window.open('', '_blank');
        receiptWindow.document.write(document.getElementById('receipt').innerHTML);
        receiptWindow.print();
    }
}

// Fungsi untuk memuat transaksi dari localStorage
function loadTransactionsFromStorage() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

// Fungsi untuk menyimpan transaksi ke localStorage
function saveTransactionsToStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Fungsi untuk menampilkan struk
function showReceipt(transaction) {
    const modal = document.getElementById('receiptModal');
    const receiptDiv = document.getElementById('receipt');
    
    const receiptContent = `
        <h3>Steam Berkah 2 Putra</h3>
        <p>Tanggal: ${new Date(transaction.date).toLocaleString()}</p>
        <p>No. Transaksi: ${transaction.id}</p>
        <p>Tipe Kendaraan: ${transaction.vehicleType === 'car' ? 'Mobil' : 'Motor'}</p>
        <p>Model: ${transaction.vehicleModel}</p>
        <p>Harga: Rp ${transaction.price.toLocaleString()}</p>
        <p>Kasir: ${transaction.cashier}</p>
    `;
    
    receiptDiv.innerHTML = receiptContent;
    modal.style.display = 'block';
}

// Panggil fungsi ini saat aplikasi dimuat
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Add global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', { msg, url, lineNo, columnNo, error });
    
    // Show user-friendly error message
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = 'Terjadi kesalahan. Silakan muat ulang halaman.';
        errorMessage.style.display = 'block';
    }
    
    return false;
};

// Add unhandled promise rejection handler
window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error message
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = 'Terjadi kesalahan. Silakan muat ulang halaman.';
        errorMessage.style.display = 'block';
    }
};

// Network status monitoring
window.addEventListener('online', handleOnlineStatus);
window.addEventListener('offline', handleOnlineStatus);

function handleOnlineStatus() {
    isOnline = navigator.onLine;
    if (isOnline) {
        showToast('Koneksi tersedia', 'success');
        syncPendingTransactions();
    } else {
        showToast('Aplikasi dalam mode offline', 'warning');
    }
}

// Error handling
function handleError(error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
}

// UI updates
function updateUI(transaction) {
    updateReports();
    resetTransactionForm();
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
} 