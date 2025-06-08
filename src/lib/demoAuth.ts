import { demoUsers } from '@/data/demoData';
import { User } from '@/types';
import { logger } from '@/lib/logger';

// Demo credentials for easy testing
export const DEMO_CREDENTIALS = {
  huurder: {
    email: 'emma.bakker@email.nl',
    password: 'demo123',
    user: demoUsers[0]
  },
  verhuurder: {
    email: 'bas.verhuur@email.nl',
    password: 'demo123',
    user: demoUsers[1]
  },
  beoordelaar: {
    email: 'lisa.reviewer@huurly.nl',
    password: 'demo123',
    user: demoUsers[2]
  },
  beheerder: {
    email: 'admin@huurly.nl',
    password: 'demo123',
    user: demoUsers[3]
  }
};

class DemoAuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadStoredSession();
  }

  private loadStoredSession(): void {
    try {
      const storedUser = localStorage.getItem('huurly_demo_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.notifyListeners();
      }
    } catch (error) {
       logger.error('Error loading stored demo session:', error);
      localStorage.removeItem('huurly_demo_user');
    }
  }

  private storeSession(user: User): void {
    try {
      localStorage.setItem('huurly_demo_user', JSON.stringify(user));
    } catch (error) {
       logger.error('Error storing demo session:', error);
    }
  }

  private clearStoredSession(): void {
    try {
      localStorage.removeItem('huurly_demo_user');
    } catch (error) {
       logger.error('Error clearing demo session:', error);
    }
  }

  addListener(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const credential = Object.values(DEMO_CREDENTIALS).find(
        cred => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
      );

      if (!credential) {
        return {
          success: false,
          error: 'Ongeldige inloggegevens. Gebruik een van de demo accounts.'
        };
      }

      if (!credential.user.isActive) {
        return {
          success: false,
          error: 'Account is gedeactiveerd.'
        };
      }

      this.currentUser = credential.user;
      this.storeSession(credential.user);
      this.notifyListeners();

      return {
        success: true,
        user: credential.user
      };

    } catch (error) {
      return {
        success: false,
        error: 'Er is een fout opgetreden bij het inloggen.'
      };
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.clearStoredSession();
    this.notifyListeners();
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const credential = Object.values(DEMO_CREDENTIALS).find(
      cred => cred.email.toLowerCase() === email.toLowerCase()
    );

    if (!credential) {
      return {
        success: false,
        error: 'E-mailadres niet gevonden.'
      };
    }

    return {
      success: true
    };
  }

  // Get demo credentials for display
  getDemoCredentials() {
    return Object.entries(DEMO_CREDENTIALS).map(([role, cred]) => ({
      role,
      email: cred.email,
      password: cred.password,
      name: cred.user.name
    }));
  }
}

export const demoAuthService = new DemoAuthService();
