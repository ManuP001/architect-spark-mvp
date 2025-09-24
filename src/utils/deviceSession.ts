// Device-based session management for no-auth rider tracking
// This provides basic session persistence without requiring OTP or email auth

export class DeviceSession {
  private static readonly DEVICE_ID_KEY = 'rider_device_id';
  private static readonly SESSION_KEY = 'rider_session';
  
  static generateDeviceId(): string {
    // Generate a unique device ID using browser fingerprinting
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const userAgent = navigator.userAgent.slice(-20);
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    
    return btoa(`${timestamp}_${random}_${userAgent}_${screenSize}`)
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }
  
  static getDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  }
  
  static setSession(data: any): void {
    const sessionData = {
      ...data,
      deviceId: this.getDeviceId(),
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }
  
  static getSession(): any | null {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    
    if (!sessionData) return null;
    
    try {
      const parsed = JSON.parse(sessionData);
      
      // Check if session is older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (parsed.timestamp < thirtyDaysAgo) {
        this.clearSession();
        return null;
      }
      
      return parsed;
    } catch {
      return null;
    }
  }
  
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }
  
  static isValidMobile(mobile: string): boolean {
    // Validate 10-digit mobile number (excluding +91)
    return /^\d{10}$/.test(mobile);
  }
}