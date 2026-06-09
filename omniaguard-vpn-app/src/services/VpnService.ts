import { NativeEventEmitter, NativeModules, Platform, EmitterSubscription } from 'react-native';

export type VpnStatus = 'connected' | 'connecting' | 'disconnected' | 'disconnecting';

interface Server {
  name: string;
  flag: string;
  ping: number;
  host?: string;
  publicKey?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// WireGuard server config — replace with your actual server details
// Get these from your DigitalOcean WireGuard setup (see vpn-server-setup.html)
// ──────────────────────────────────────────────────────────────────────────
const SERVER_CONFIGS: Record<string, { host: string; publicKey: string; endpoint: string }> = {
  'Canada — Toronto': {
    host: 'YOUR_TORONTO_SERVER_IP',       // e.g., 142.93.128.x
    publicKey: 'YOUR_SERVER_PUBLIC_KEY',  // WireGuard public key
    endpoint: 'YOUR_TORONTO_SERVER_IP:51820',
  },
  'United States — NYC': {
    host: 'YOUR_NYC_SERVER_IP',
    publicKey: 'YOUR_NYC_PUBLIC_KEY',
    endpoint: 'YOUR_NYC_SERVER_IP:51820',
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Native module bridge
// iOS: uses NetworkExtension (NEVPNManager / NETunnelProviderManager)
// Android: uses VpnService + WireGuard-Android
//
// Native module must expose:
//   connect(config: WireGuardConfig) => Promise<void>
//   disconnect() => Promise<void>
//   getStatus() => Promise<VpnStatus>
//   addListener(event: string, callback: Function)
// ──────────────────────────────────────────────────────────────────────────
const { OmniaGuardVpn } = NativeModules;
const vpnEvents = OmniaGuardVpn ? new NativeEventEmitter(OmniaGuardVpn) : null;

export const VpnService = {
  async connect(server: Server): Promise<void> {
    const cfg = SERVER_CONFIGS[server.name];
    if (!cfg) throw new Error(`No config for server: ${server.name}`);

    const wireGuardConfig = {
      // These values come from your WireGuard server setup
      // The client private key is generated per-device during registration
      privateKey: await getOrCreateClientPrivateKey(),
      publicKey: cfg.publicKey,
      endpoint: cfg.endpoint,
      allowedIPs: '0.0.0.0/0, ::/0', // all traffic through VPN
      dns: '1.1.1.1, 1.0.0.1',       // Cloudflare DNS
      mtu: 1420,
    };

    if (OmniaGuardVpn) {
      await OmniaGuardVpn.connect(wireGuardConfig);
    } else {
      // Dev mode simulation — remove in production
      console.log('[VpnService] Native module not available — simulation mode');
      simulateConnect();
    }
  },

  async disconnect(): Promise<void> {
    if (OmniaGuardVpn) {
      await OmniaGuardVpn.disconnect();
    } else {
      simulateDisconnect();
    }
  },

  async getStatus(): Promise<VpnStatus> {
    if (OmniaGuardVpn) {
      return OmniaGuardVpn.getStatus();
    }
    return simulatedStatus;
  },

  onStatusChange(callback: (status: VpnStatus) => void): EmitterSubscription | { remove: () => void } {
    if (vpnEvents) {
      return vpnEvents.addListener('vpnStatusChange', (e: { status: VpnStatus }) => callback(e.status));
    }
    // Dev mode: return fake subscription
    return { remove: () => {} };
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Dev mode simulation (remove when native modules are linked)
// ──────────────────────────────────────────────────────────────────────────
let simulatedStatus: VpnStatus = 'disconnected';

function simulateConnect() {
  simulatedStatus = 'connecting';
  setTimeout(() => { simulatedStatus = 'connected'; }, 1500);
}

function simulateDisconnect() {
  simulatedStatus = 'disconnecting';
  setTimeout(() => { simulatedStatus = 'disconnected'; }, 800);
}

async function getOrCreateClientPrivateKey(): Promise<string> {
  // In production: generate WireGuard keypair on device, store in Keychain (iOS) / Keystore (Android)
  // Return base64-encoded private key
  return 'PLACEHOLDER_CLIENT_PRIVATE_KEY';
}

// ──────────────────────────────────────────────────────────────────────────
// iOS native module stub (ios/OmniaGuardVpn/OmniaGuardVpnModule.swift)
// See omniaguard-vpn-app/ios/ for the Swift NetworkExtension implementation
// ──────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────
// Android native module stub (android/.../OmniaGuardVpnModule.kt)
// See omniaguard-vpn-app/android/ for the Kotlin VpnService implementation
// ──────────────────────────────────────────────────────────────────────────
