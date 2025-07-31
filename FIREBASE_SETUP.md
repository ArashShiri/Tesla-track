# Firebase Setup Instructions

To enable authentication and multi-user support in your Tesla Supercharger Tracker, you need to set up a Firebase project.

## 🔥 Firebase Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Name your project (e.g., "Tesla Supercharger Tracker")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your project support email

### 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select a location close to your users
5. Click "Done"

### 4. Get Your Configuration

1. Go to "Project settings" (gear icon in left sidebar)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Name your app (e.g., "Tesla Tracker Web")
5. **Don't** check "Firebase Hosting" for now
6. Click "Register app"
7. Copy the `firebaseConfig` object

### 5. Update Your Code

1. Open `src/firebase-config.js`
2. Replace the placeholder `firebaseConfig` object with your real configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 6. Security Rules (Optional but Recommended)

In Firestore Database > Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to subcollections (vehicles, visits)
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 🚀 Features Enabled

With Firebase authentication, your app now supports:

### 👤 **Multi-User Authentication**
- **Google Sign-In**: One-click authentication with Google account
- **Email/Password**: Traditional signup and login
- **User Profiles**: Automatic profile creation with display names and photos

### 🚗 **Vehicle Management**
- **Multiple Vehicles**: Each user can add multiple Tesla vehicles
- **Vehicle Details**: Name, model, year, color, VIN tracking
- **Vehicle Selection**: Filter visits by specific vehicle
- **Vehicle Profiles**: Detailed vehicle information and statistics

### 🔐 **Data Security**
- **User Isolation**: Each user's data is completely separate
- **Secure Storage**: All data stored in Firebase with proper security rules
- **Real-time Sync**: Data automatically syncs across devices
- **Backup & Restore**: Export/import functionality for data portability

### 📊 **Enhanced Features**
- **Per-Vehicle Statistics**: Track charging by specific vehicle
- **Cloud Storage**: No more localStorage limitations
- **Cross-Device Access**: Access your data from any device
- **Real-time Updates**: Changes appear instantly across sessions

## 🛠️ Development vs Production

### Development (Test Mode)
- Firestore is in "test mode" - anyone can read/write for 30 days
- Perfect for testing and development
- **Remember**: Switch to production rules before going live!

### Production (Secure Mode)
- Implement the security rules above
- Users can only access their own data
- Requires authentication for all operations

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase project not found"**
   - Check your `projectId` in the config
   - Ensure the project exists in Firebase Console

2. **"API key not valid"**
   - Regenerate API key in Firebase Console
   - Update the `apiKey` in your config

3. **"Permission denied"**
   - Check Firestore security rules
   - Ensure user is authenticated before accessing data

4. **"Domain not authorized"**
   - Add your domain (localhost:5173) to authorized domains in Authentication > Settings

## 🎯 Next Steps

1. Set up your Firebase project following the steps above
2. Update the configuration in `src/firebase-config.js`
3. Test the authentication by signing up/in
4. Add your first vehicle and start tracking visits!

## 💡 Optional Enhancements

Consider adding these features later:
- **Apple Sign-In**: Additional authentication method
- **Phone Authentication**: SMS-based login
- **Anonymous Authentication**: Guest access
- **Custom Claims**: Role-based access (admin, premium users)
- **Firebase Analytics**: Track app usage and user engagement

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs) or create an issue in the repository!
