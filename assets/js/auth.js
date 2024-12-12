// User management
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'kasir1', password: 'kasir123', role: 'employee' }
];

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!username || !password) {
        errorDiv.textContent = 'Please enter both username and password';
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = {
            username: user.username,
            role: user.role
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        
        // Show/hide admin features
        const adminNav = document.getElementById('adminNav');
        adminNav.style.display = user.role === 'admin' ? 'block' : 'none';
        
        // Initialize the app
        initializeApp();
    } else {
        errorDiv.textContent = 'Invalid username or password';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        document.getElementById('adminNav').style.display = 
            currentUser.role === 'admin' ? 'block' : 'none';
        initializeApp();
    }
} 

// Inisialisasi data pengguna default jika belum ada
function initializeDefaultUsers() {
    const savedUsers = localStorage.getItem('users');
    if (!savedUsers) {
        const defaultUsers = [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'kasir1', password: 'kasir123', role: 'employee' }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Panggil fungsi ini saat aplikasi dimuat
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultUsers();
    checkAuth();
}); 