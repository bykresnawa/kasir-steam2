// Firebase configuration
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase services
export const db = firebase.firestore();
export const auth = firebase.auth();

// Enable offline persistence
if (typeof window !== 'undefined') {
    db.enablePersistence()
        .then(() => {
            console.log('Offline persistence enabled');
        })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.warn('The current browser does not support offline persistence');
            } else {
                console.error('Firebase persistence error:', err);
            }
        });
} 