// Initialize auth state observer
let currentUser = null;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Get additional user data from Firestore
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    currentUser = {
                        uid: user.uid,
                        email: user.email,
                        ...doc.data()
                    };
                    updateUIForAuthenticatedUser();
                }
            })
            .catch(handleError);
    } else {
        currentUser = null;
        updateUIForUnauthenticatedUser();
    }
});

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';
    
    try {
        // Convert username to email if needed
        const email = username.includes('@') ? username : `${username}@steamwash.com`;
        
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // Additional login logic can go here
        console.log('Login successful:', userCredential.user.uid);
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = getErrorMessage(error);
    }
}

function logout() {
    firebase.auth().signOut()
        .then(() => {
            console.log('Logout successful');
        })
        .catch(handleError);
}

function updateUIForAuthenticatedUser() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('adminNav').style.display = 
        currentUser?.role === 'admin' ? 'block' : 'none';
}

function updateUIForUnauthenticatedUser() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function handleError(error) {
    console.error('Error:', error);
    showToast(getErrorMessage(error), 'error');
}

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

// Initialize offline data handling
function initializeOfflineData() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIForAuthenticatedUser();
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
        }
    }
}

// Save user data for offline access
function saveUserDataLocally() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeOfflineData();
}); 