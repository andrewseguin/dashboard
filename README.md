This is a skeleton app that can be forked and used freely.

Getting started

1. Set up a new firebase app and provide the config details

```ts
src/app/firebase.config.ts

export const FIREBASE_CONFIG = {
  apiKey: 'your-api-key',
  authDomain: 'your-app.firebaseapp.com',
  databaseURL: 'https://your-app.firebaseio.com',
  projectId: 'your-app',
  storageBucket: 'your-app.appspot.com',
  messagingSenderId: 'your-messaging-sender-id-123'
};
```

2. Enable Google sign-in. Can use another provider, just change in login.ts

3. Turn on firestore
# skeleton-app
# dashboard
