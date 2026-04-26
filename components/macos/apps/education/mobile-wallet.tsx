"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ExternalLink,
  Smartphone,
  Link2,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Globe,
  QrCode,
} from "lucide-react"

const mobilePackages = [
  {
    name: "@solana-mobile/mobile-wallet-adapter-protocol",
    description: "Core MWA protocol for Android/iOS",
    type: "Core",
  },
  {
    name: "@solana-mobile/mobile-wallet-adapter-protocol-web3js",
    description: "Web3.js integration for MWA",
    type: "Integration",
  },
  {
    name: "@solana-mobile/wallet-adapter-mobile",
    description: "Mobile wallet adapter for React",
    type: "React",
  },
  {
    name: "@solana/wallet-standard-wallet-adapter-react",
    description: "Wallet standard React adapter",
    type: "Standard",
  },
]

export function MobileWalletSection() {
  const mwaSetupCode = `// Mobile Wallet Adapter Setup for React Native / Expo
// npm install @solana-mobile/mobile-wallet-adapter-protocol
// npm install @solana-mobile/mobile-wallet-adapter-protocol-web3js

import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

// Authorize with mobile wallet
async function connectMobileWallet() {
  const authResult = await transact(async (wallet: Web3MobileWallet) => {
    // Request authorization from the wallet
    const authorizationResult = await wallet.authorize({
      cluster: 'devnet',
      identity: {
        name: 'My dApp',
        uri: 'https://mydapp.com',
        icon: 'favicon.ico', // Relative path to icon
      },
    });
    
    return authorizationResult;
  });

  console.log('Connected wallet:', authResult.accounts[0].address);
  console.log('Auth token:', authResult.auth_token);
  
  return authResult;
}

// Reauthorize with stored auth token
async function reauthorizeWallet(authToken: string) {
  return await transact(async (wallet: Web3MobileWallet) => {
    const reauthorizationResult = await wallet.reauthorize({
      auth_token: authToken,
    });
    return reauthorizationResult;
  });
}

// Sign and send transaction
async function signAndSendTransaction(
  transaction: Transaction,
  connection: Connection
) {
  const signature = await transact(async (wallet: Web3MobileWallet) => {
    // Reauthorize first
    await wallet.reauthorize({ auth_token: storedAuthToken });

    // Sign and send
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTx = await wallet.signAndSendTransactions({
      transactions: [transaction],
    });

    return signedTx[0];
  });

  return signature;
}`

  const phantomDeeplinkCode = `// Phantom Wallet Deeplink Integration
// Docs: https://docs.phantom.app/developer-powertools/deeplinks

// Base URLs
const PHANTOM_DEEPLINK = 'https://phantom.app/ul/v1';
const PHANTOM_BROWSE = 'https://phantom.app/ul/browse';

// Build connect deeplink
function buildConnectDeeplink(params: {
  appUrl: string;
  redirectLink: string;
  cluster?: 'mainnet-beta' | 'devnet' | 'testnet';
}) {
  const url = new URL(\`\${PHANTOM_DEEPLINK}/connect\`);
  url.searchParams.set('app_url', params.appUrl);
  url.searchParams.set('redirect_link', params.redirectLink);
  if (params.cluster) {
    url.searchParams.set('cluster', params.cluster);
  }
  // dapp_encryption_public_key for encrypted payloads
  return url.toString();
}

// Build sign transaction deeplink
function buildSignTransactionDeeplink(params: {
  transaction: string; // Base58 encoded serialized transaction
  redirectLink: string;
  session: string; // Session token from connect
}) {
  const url = new URL(\`\${PHANTOM_DEEPLINK}/signTransaction\`);
  url.searchParams.set('transaction', params.transaction);
  url.searchParams.set('redirect_link', params.redirectLink);
  url.searchParams.set('session', params.session);
  return url.toString();
}

// Build sign message deeplink
function buildSignMessageDeeplink(params: {
  message: string; // Base58 encoded message
  redirectLink: string;
  session: string;
  display?: 'utf8' | 'hex'; // How to display in wallet
}) {
  const url = new URL(\`\${PHANTOM_DEEPLINK}/signMessage\`);
  url.searchParams.set('message', params.message);
  url.searchParams.set('redirect_link', params.redirectLink);
  url.searchParams.set('session', params.session);
  if (params.display) {
    url.searchParams.set('display', params.display);
  }
  return url.toString();
}

// Build sign and send transaction deeplink
function buildSignAndSendDeeplink(params: {
  transaction: string;
  redirectLink: string;
  session: string;
  sendOptions?: {
    skipPreflight?: boolean;
    preflightCommitment?: string;
  };
}) {
  const url = new URL(\`\${PHANTOM_DEEPLINK}/signAndSendTransaction\`);
  url.searchParams.set('transaction', params.transaction);
  url.searchParams.set('redirect_link', params.redirectLink);
  url.searchParams.set('session', params.session);
  return url.toString();
}

// Open Phantom browser with dApp
function openInPhantomBrowser(dappUrl: string, ref?: string) {
  const url = new URL(PHANTOM_BROWSE);
  url.searchParams.set('url', encodeURIComponent(dappUrl));
  if (ref) url.searchParams.set('ref', ref);
  return url.toString();
}`

  const universalLinksCode = `// Universal Links / App Links Implementation
// For iOS (Universal Links) and Android (App Links)

// 1. Configure apple-app-site-association (iOS)
// Host at: https://yourdomain.com/.well-known/apple-app-site-association
const appleAppSiteAssociation = {
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourapp.bundle",
        "paths": ["/callback/*", "/wallet/*"]
      }
    ]
  }
};

// 2. Configure assetlinks.json (Android)
// Host at: https://yourdomain.com/.well-known/assetlinks.json
const androidAssetLinks = [
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourapp.android",
      "sha256_cert_fingerprints": ["SHA256_FINGERPRINT"]
    }
  }
];

// 3. React Native handling
import { Linking } from 'react-native';

// Handle incoming deeplinks
function setupDeeplinkHandler() {
  // Handle app opened from deeplink
  Linking.getInitialURL().then((url) => {
    if (url) handleDeeplink(url);
  });

  // Handle deeplink while app is open
  Linking.addEventListener('url', ({ url }) => {
    handleDeeplink(url);
  });
}

function handleDeeplink(url: string) {
  const parsed = new URL(url);
  const params = Object.fromEntries(parsed.searchParams);

  switch (parsed.pathname) {
    case '/callback/connect':
      handleConnectCallback(params);
      break;
    case '/callback/signTransaction':
      handleSignTransactionCallback(params);
      break;
    case '/callback/signAndSend':
      handleSignAndSendCallback(params);
      break;
  }
}

// 4. Encryption for secure communication
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Generate encryption keypair for secure communication
function generateDappKeypair() {
  const keypair = nacl.box.keyPair();
  return {
    publicKey: bs58.encode(keypair.publicKey),
    secretKey: keypair.secretKey,
  };
}

// Decrypt response from wallet
function decryptPayload(
  data: string,
  nonce: string,
  sharedSecretDapp: Uint8Array
) {
  const decryptedData = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecretDapp
  );
  
  if (!decryptedData) {
    throw new Error('Unable to decrypt data');
  }
  
  return JSON.parse(Buffer.from(decryptedData).toString('utf8'));
}`

  const qrCodeConnectionCode = `// QR Code Connection for Desktop-to-Mobile
// Used when dApp runs on desktop, wallet is on mobile

import QRCode from 'qrcode';
import { Connection, Transaction } from '@solana/web3.js';

// Generate connection QR code
async function generateConnectionQR(params: {
  appUrl: string;
  sessionId: string;
  cluster: string;
}) {
  // Build the connect URL with session for callback
  const connectUrl = buildConnectDeeplink({
    appUrl: params.appUrl,
    redirectLink: \`\${params.appUrl}/mobile-callback?session=\${params.sessionId}\`,
    cluster: params.cluster as 'devnet',
  });

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(connectUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#14F195',
      light: '#0F0F14',
    },
  });

  return qrDataUrl;
}

// WebSocket for real-time communication with mobile
class MobileWalletBridge {
  private ws: WebSocket;
  private sessionId: string;
  private onConnect: (publicKey: string) => void;
  private onSignature: (signature: string) => void;

  constructor(serverUrl: string, sessionId: string) {
    this.sessionId = sessionId;
    this.ws = new WebSocket(\`\${serverUrl}/ws?session=\${sessionId}\`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'connected':
          this.onConnect?.(data.publicKey);
          break;
        case 'signed':
          this.onSignature?.(data.signature);
          break;
      }
    };
  }

  // Request transaction signing
  requestSign(transaction: Transaction) {
    this.ws.send(JSON.stringify({
      type: 'sign_request',
      transaction: transaction.serialize().toString('base64'),
    }));
  }

  setOnConnect(callback: (publicKey: string) => void) {
    this.onConnect = callback;
  }

  setOnSignature(callback: (signature: string) => void) {
    this.onSignature = callback;
  }
}

// Server-side callback handler (Next.js API route example)
// pages/api/mobile-callback.ts
export default function handler(req, res) {
  const { session, phantom_encryption_public_key, data, nonce } = req.query;
  
  // Decrypt and store the connection result
  // Notify the desktop client via WebSocket
  
  res.redirect('/wallet-connected');
}`

  const solflareDeeplinkCode = `// Solflare Wallet Deeplink Integration
// Docs: https://docs.solflare.com/solflare/technical/deeplinks

const SOLFLARE_DEEPLINK = 'https://solflare.com/ul/v1';

// Connect to Solflare
function buildSolflareConnect(params: {
  appUrl: string;
  redirectUrl: string;
  cluster?: string;
}) {
  const url = new URL(\`\${SOLFLARE_DEEPLINK}/connect\`);
  url.searchParams.set('app_url', params.appUrl);
  url.searchParams.set('redirect_url', params.redirectUrl);
  if (params.cluster) {
    url.searchParams.set('cluster', params.cluster);
  }
  return url.toString();
}

// Sign transaction with Solflare
function buildSolflareSignTransaction(params: {
  transaction: string; // Base64 encoded
  redirectUrl: string;
  session: string;
}) {
  const url = new URL(\`\${SOLFLARE_DEEPLINK}/signTransaction\`);
  url.searchParams.set('transaction', params.transaction);
  url.searchParams.set('redirect_url', params.redirectUrl);
  url.searchParams.set('session', params.session);
  return url.toString();
}

// Backpack Wallet Deeplinks (similar pattern)
const BACKPACK_DEEPLINK = 'https://backpack.app/ul/v1';

function buildBackpackConnect(params: {
  appUrl: string;
  redirectUrl: string;
}) {
  const url = new URL(\`\${BACKPACK_DEEPLINK}/connect\`);
  url.searchParams.set('app_url', params.appUrl);
  url.searchParams.set('redirect_url', params.redirectUrl);
  return url.toString();
}

// Multi-wallet deeplink handling
function openWalletDeeplink(
  wallet: 'phantom' | 'solflare' | 'backpack',
  action: 'connect' | 'sign',
  params: Record<string, string>
) {
  const baseUrls = {
    phantom: 'https://phantom.app/ul/v1',
    solflare: 'https://solflare.com/ul/v1',
    backpack: 'https://backpack.app/ul/v1',
  };

  const url = new URL(\`\${baseUrls[wallet]}/\${action}\`);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // On mobile, this will open the wallet app
  // On desktop, this will open in browser (may prompt to install)
  window.location.href = url.toString();
}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Mobile Wallet Integration</h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Mobile Wallet Adapter, deeplinks, and universal links for Phantom, Solflare, and more
        </p>
      </div>

      {/* Alert for MWA */}
      <Alert className="border-primary/30 bg-primary/5">
        <Smartphone className="h-4 w-4 text-primary" />
        <AlertTitle>Mobile Wallet Adapter (MWA)</AlertTitle>
        <AlertDescription className="text-sm">
          MWA is the standard protocol for Solana mobile dApps. It provides secure communication
          between your app and mobile wallets without leaving your application.
        </AlertDescription>
      </Alert>

      {/* Packages Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Mobile Wallet Packages</CardTitle>
          <CardDescription className="text-sm">Required packages for mobile wallet integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Package</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mobilePackages.map((pkg) => (
                  <TableRow key={pkg.name}>
                    <TableCell className="font-mono text-xs sm:text-sm text-primary break-all">
                      {pkg.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {pkg.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{pkg.type}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples Tabs */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">Integration Methods</CardTitle>
              <CardDescription className="text-sm">
                Choose the right approach for your mobile integration
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://docs.phantom.app/developer-powertools/deeplinks" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Phantom Docs</span>
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/solana-mobile/mobile-wallet-adapter" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">MWA GitHub</span>
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mwa" className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="mwa" className="text-xs sm:text-sm flex-1 min-w-[80px]">
                <Smartphone className="h-3.5 w-3.5 mr-1 sm:mr-1.5 hidden sm:inline" />
                MWA
              </TabsTrigger>
              <TabsTrigger value="phantom" className="text-xs sm:text-sm flex-1 min-w-[80px]">
                <Link2 className="h-3.5 w-3.5 mr-1 sm:mr-1.5 hidden sm:inline" />
                Phantom
              </TabsTrigger>
              <TabsTrigger value="universal" className="text-xs sm:text-sm flex-1 min-w-[80px]">
                <Globe className="h-3.5 w-3.5 mr-1 sm:mr-1.5 hidden sm:inline" />
                Universal
              </TabsTrigger>
              <TabsTrigger value="qr" className="text-xs sm:text-sm flex-1 min-w-[80px]">
                <QrCode className="h-3.5 w-3.5 mr-1 sm:mr-1.5 hidden sm:inline" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="other" className="text-xs sm:text-sm flex-1 min-w-[80px]">
                Other
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mwa" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Mobile Wallet Adapter (MWA)</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Native protocol for React Native and Expo apps. Provides seamless in-app wallet interactions.
                    </p>
                  </div>
                </div> 
              </div>
            </TabsContent>

            <TabsContent value="phantom" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
                  <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Phantom Deeplinks</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Direct deeplink integration for Phantom wallet. Works on both iOS and Android.
                    </p>
                  </div>
                </div>
                <Alert className="border-warning/30 bg-warning/5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-xs sm:text-sm">
                    Deeplinks require the user to have Phantom installed. Always provide fallback options.
                  </AlertDescription>
                </Alert> 
              </div>
            </TabsContent>

            <TabsContent value="universal" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Universal Links / App Links</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Configure your domain to handle wallet callbacks securely on iOS and Android.
                    </p>
                  </div>
                </div> 
              </div>
            </TabsContent>

            <TabsContent value="qr" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">QR Code Connection</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Bridge desktop dApps with mobile wallets using QR codes and WebSocket communication.
                    </p>
                  </div>
                </div> 
              </div>
            </TabsContent>

            <TabsContent value="other" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Multi-Wallet Support</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Support Solflare, Backpack, and other wallets with similar deeplink patterns.
                    </p>
                  </div>
                </div> 
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                icon: Shield,
                title: "Always Encrypt",
                description: "Use encryption for deeplink payloads to prevent MITM attacks",
              },
              {
                icon: Zap,
                title: "Handle Timeouts",
                description: "Implement timeouts for wallet responses (30-60 seconds recommended)",
              },
              {
                icon: CheckCircle2,
                title: "Verify Signatures",
                description: "Always verify returned signatures before proceeding",
              },
              {
                icon: AlertTriangle,
                title: "Error Handling",
                description: "Handle wallet rejection, timeout, and network errors gracefully",
              },
            ].map((practice, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border"
              >
                <practice.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{practice.title}</p>
                  <p className="text-xs text-muted-foreground">{practice.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
