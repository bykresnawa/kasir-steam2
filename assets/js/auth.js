// User management
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'kasir1', password: 'kasir123', role: 'employee' }
];

// Update login function
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = ''; // Reset error message
    
    try {
        // Convert username to email if needed
        const email = username.includes('@') ? username : `${username}@steamwash.com`;
        
        // Attempt to sign in
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Get additional user data from Firestore
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        
        if (!userDoc.exists) {
            // Create user document if it doesn't exist
            await db.collection('users').doc(userCredential.user.uid).set({
                username: username,
                email: email,
                role: 'employee', // Default role
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        const userData = userDoc.exists ? userDoc.data() : { role: 'employee' };
        
        // Set current user
        currentUser = {
            uid: userCredential.user.uid,
            username: username,
            email: email,
            role: userData.role
        };
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        document.getElementById('adminNav').style.display = 
            userData.role === 'admin' ? 'block' : 'none';
        
        // Initialize app
        initializeApp();
        
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = getErrorMessage(error);
    }
}

// Helper function to get user-friendly error messages
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Format email tidak valid';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Username atau password salah';
        case 'auth/too-many-requests':
            return 'Terlalu banyak percobaan login. Silakan coba lagi nanti';
        default:
            return 'Terjadi kesalahan. Silakan coba lagi';
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