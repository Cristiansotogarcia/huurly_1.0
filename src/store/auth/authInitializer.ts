
import { createAuthStateListener } from './authStateListener';
import { setupConservativeLogout } from './conservativeLogout';
import { initializeSession } from './sessionInitializer';

export const createAuthInitializer = (set: any, get: any) => ({
  initializeAuth: async () => {
    // Initialize the session
    await initializeSession(set);

    // Set up auth state listener
    const setupStateListener = createAuthStateListener(set);
    setupStateListener();

    // Set up conservative automatic logout for browser closure only
    setupConservativeLogout(get);
  },
});
