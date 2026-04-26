# Solana Wallet Integration Guide

Complete documentation of QOS's Solana blockchain integration and wallet connectivity.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Supported Wallets](#supported-wallets)
4. [Usage](#usage)
5. [Building Blockchain Features](#building-blockchain-features)
6. [RPC Endpoints](#rpc-endpoints)
7. [Transactions](#transactions)
8. [Token Programs](#token-programs)
9. [Error Handling](#error-handling)

## Overview

QOS integrates Solana's Wallet Adapter ecosystem to enable:
- **Wallet Connection**: Connect via Phantom, Solflare, and other adapters
- **Message Signing**: Sign arbitrary messages for authentication
- **Transaction Sending**: Send SOL and SPL tokens
- **Account Queries**: Check balances, nfts, token accounts
- **Network Selection**: Switch between networks (Mainnet, Devnet, Testnet)

### Key Benefits

- Zero wallet code needed in app development
- Multi-wallet support out of the box
- Automatic mobile/extension wallet detection
- Secure - keys never exposed to browser
- User-controlled - user approves every transaction

## Architecture

### Provider Stack

```
┌──────────────────────────────────┐
│  app/layout.tsx                  │
│  Wraps entire app with providers │
└─────────────────┬────────────────┘
                  │
┌─────────────────▼────────────────┐
│  WalletProvider                  │
│  (@solana/wallet-adapter-react)  │
│  Manages wallet state & adapters │
└─────────────────┬────────────────┘
                  │
┌─────────────────▼────────────────┐
│  ConnectionProvider              │
│  (@solana/wallet-adapter-react)  │
│  Manages RPC connection          │
└─────────────────┬────────────────┘
                  │
┌─────────────────▼────────────────┐
│  Application                     │
│  Can use useWallet() hook        │
└──────────────────────────────────┘
```

### Configuration: `wallet-provider.tsx`

```typescript
import { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Network selection
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Available wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

## Supported Wallets

### Phantom Wallet

- **Download**: [phantom.app](https://phantom.app)
- **Support**: Extension + Mobile
- **Network**: Solana + Ethereum
- **Best For**: Most users

```typescript
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const adapter = new PhantomWalletAdapter();
```

### Solflare Wallet

- **Download**: [solflare.com](https://solflare.com)
- **Support**: Extension + Mobile
- **Network**: Solana + Ethereum
- **Best For**: Power users

```typescript
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const adapter = new SolflareWalletAdapter({ network });
```

### Adding More Wallets

```typescript
import {
  BackpackWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new BackpackWalletAdapter(),
  new CoinbaseWalletAdapter(),
  new TrustWalletAdapter(),
  new LedgerWalletAdapter(),
];
```

## Usage

### Basic Hook Usage

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

export function MyComponent() {
  const {
    // Connection state
    connected,
    connecting,
    disconnecting,
    
    // Public key & adapter
    publicKey,
    wallet,
    
    // Methods
    connect,
    disconnect,
    select,
    
    // Message signing
    signMessage,
    
    // Transaction sending
    sendTransaction,
  } = useWallet();

  if (connecting) return <div>Connecting...</div>;
  if (!connected) {
    return (
      <button onClick={() => connect()}>
        Connect Wallet
      </button>
    );
  }

  return (
    <div>
      <p>Connected: {publicKey?.toBase58()}</p>
      <p>Wallet: {wallet?.adapter.name}</p>
      <button onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
```

### Using Connection Provider

```typescript
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function BalanceChecker() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) return;

    connection
      .getBalance(publicKey)
      .then(lamports => {
        setBalance(lamports / LAMPORTS_PER_SOL);
      })
      .catch(err => console.error('Failed to fetch balance:', err));
  }, [publicKey, connection]);

  return <div>Balance: {balance.toFixed(2)} SOL</div>;
}
```

## Building Blockchain Features

### 1. Check SOL Balance

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function SolBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) return;

    const getBalance = async () => {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    };

    getBalance();
  }, [publicKey, connection]);

  return <div>SOL Balance: {balance.toFixed(4)} SOL</div>;
}
```

### 2. Sign a Message

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

export function MessageSigner() {
  const { publicKey, signMessage } = useWallet();
  const [signature, setSignature] = useState('');

  const handleSign = async () => {
    if (!publicKey || !signMessage) return;

    const message = new TextEncoder().encode(
      'Sign this message to verify ownership'
    );

    try {
      const sig = await signMessage(message);
      setSignature(Buffer.from(sig).toString('hex'));
    } catch (err) {
      console.error('Sign failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleSign}>Sign Message</button>
      {signature && <div>Signature: {signature}</div>}
    </div>
  );
}
```

### 3. Send a Transaction

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

export function SendSol() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = async () => {
    if (!publicKey || !sendTransaction) return;

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Transaction sent:', signature);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      <input
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        placeholder="Recipient address"
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount (SOL)"
        className="w-full px-3 py-2 border rounded"
      />
      <button
        onClick={handleSend}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>
    </div>
  );
}
```

### 4. Check SPL Token Balance

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getMint,
} from '@solana/spl-token';

export function TokenBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) return;

    const getTokenBalance = async () => {
      // USDC on Mainnet
      const USDC_MINT = new PublicKey(
        'EPjFWaLb3odcccccccccccccccccccccccccccccccccc'
      );

      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);

      try {
        const accountInfo = await connection.getParsedAccountInfo(ata);
        const amount = (accountInfo.value?.data as any)?.parsed?.info?.tokenAmount?.uiAmount || 0;
        setBalance(amount);
      } catch (err) {
        console.log('No token account found');
        setBalance(0);
      }
    };

    getTokenBalance();
  }, [publicKey, connection]);

  return <div>USDC Balance: {balance.toFixed(2)} USDC</div>;
}
```

### 5. Send SPL Token

```typescript
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from '@solana/spl-token';
import { Transaction } from '@solana/web3.js';

export function SendToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSendToken = async () => {
    if (!publicKey || !sendTransaction) return;

    const USDC_MINT = new PublicKey(
      'EPjFWaLb3odcccccccccccccccccccccccccccccccccc'
    );
    const recipient = new PublicKey('RECIPIENT_ADDRESS');
    const amount = 10 * 1e6; // 10 USDC (6 decimals)

    const fromATA = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    const toATA = await getAssociatedTokenAddress(USDC_MINT, recipient);

    const transaction = new Transaction().add(
      createTransferInstruction(fromATA, toATA, publicKey, amount)
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('Token sent:', signature);
  };

  return (
    <button onClick={handleSendToken}>
      Send 10 USDC
    </button>
  );
}
```

## RPC Endpoints

### Public Endpoints

```typescript
import { clusterApiUrl } from '@solana/web3.js';

// Built-in public endpoints
const mainnetEndpoint = clusterApiUrl('mainnet-beta');
const devnetEndpoint = clusterApiUrl('devnet');
const testnetEndpoint = clusterApiUrl('testnet');
```

### Custom RPC Providers

```typescript
// Helius (recommended)
const endpoint = 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY';

// QuickNode
const endpoint = 'https://your-endpoint.solana-mainnet.quiknode.pro/';

// Alchemy
const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY';

// MagicEden
const endpoint = 'https://api.mainnet-beta.solana.com';
```

### Switching Networks

```typescript
export function NetworkSelector() {
  const [network, setNetwork] = useState(WalletAdapterNetwork.Mainnet);
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <div className="space-y-2">
      <button onClick={() => setNetwork(WalletAdapterNetwork.Mainnet)}>
        Mainnet
      </button>
      <button onClick={() => setNetwork(WalletAdapterNetwork.Devnet)}>
        Devnet
      </button>
      <p>Endpoint: {endpoint}</p>
    </div>
  );
}
```

## Transactions

### Basic Transaction Structure

```typescript
import {
  Transaction,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';

const transaction = new Transaction()
  .add(
    // Instruction 1
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient,
      lamports: 1000000,
    })
  )
  .add(
    // Instruction 2: Create account (if needed)
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: newAccount.publicKey,
      lamports: rentExemptBalance,
      space: accountSize,
      programId: programId,
    })
  );

// Sign and send
const signature = await sendTransaction(transaction, connection);
```

### Transaction with Multiple Signers

```typescript
// For instructions that require multiple signatures
// This is for server-side, not supported directly in wallet adapter

// Instead, user can:
// 1. Sign message to verify they own account
// 2. Send token to multi-sig account (if set up)
// 3. Use Multisig program like Squads
```

### Advanced: Compiled Transaction

```typescript
const recentBlockhash = (
  await connection.getLatestBlockhash()
).blockhash;

const transaction = new Transaction({
  recentBlockhash,
  feePayer: publicKey,
}).add(
  // Instructions
);

// Wallet signs
const signature = await sendTransaction(transaction, connection);

// Wait for confirmation
const confirmation = await connection.confirmTransaction({
  signature,
  blockhash: recentBlockhash,
  lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
});
```

## Token Programs

### SPL Token Instructions

```typescript
import {
  createInitializeMintInstruction,
  createMintToInstruction,
  createBurnInstruction,
  createApproveInstruction,
  createRevokeInstruction,
} from '@solana/spl-token';

// Note: Most of these require PDA signing, not user wallet
// Use them on backend with proper authorization
```

### Metaplex NFT Operations

```typescript
import {
  findMetadataPda,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

const umi = createUmi('https://api.mainnet-beta.solana.com');

// Query NFT metadata
const nftMint = new PublicKey('NFT_MINT_ADDRESS');
const metadata = await findMetadataPda(umi, { mint: nftMint });
```

## Error Handling

### Common Errors

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

export function ErrorHandlingExample() {
  const { connect, disconnect, publicKey } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('not found')) {
          console.error('Wallet extension not installed');
        } else if (err.message.includes('user rejected')) {
          console.error('User rejected connection');
        } else {
          console.error('Connection error:', err.message);
        }
      }
    }
  };

  return (
    <button onClick={handleConnect}>
      {publicKey ? 'Disconnect' : 'Connect'}
    </button>
  );
}
```

### Transaction Error Handling

```typescript
const handleTransaction = async () => {
  try {
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(
      signature,
      'confirmed'
    );

    if (confirmation.value.err) {
      console.error('Transaction failed on-chain');
      return;
    }

    console.log('Transaction successful:', signature);
  } catch (err: any) {
    if (err.code === 'WALLET_TRANSACTION_FAILED') {
      console.error('Wallet refused to sign');
    } else if (err.code === -32000) {
      console.error('Insufficient funds for transaction');
    } else if (err.message.includes('blockhash not found')) {
      console.error('Block hash expired - retry');
    } else {
      console.error('Unknown error:', err);
    }
  }
};
```

### Timeout Handling

```typescript
const sendTransactionWithTimeout = async (
  transaction: Transaction,
  timeout = 30000
) => {
  const promise = sendTransaction(transaction, connection);

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error('Transaction timeout')),
      timeout
    );
  });

  return Promise.race([promise, timeoutPromise]);
};
```

## Best Practices

1. **Always check `connected` before accessing `publicKey`**
   ```typescript
   if (!connected || !publicKey) return <div>Not connected</div>;
   ```

2. **Show loading states during connection**
   ```typescript
   {connecting && <div>Connecting...</div>}
   ```

3. **Catch wallet-specific errors**
   ```typescript
   try {
     await sendTransaction(...);
   } catch (err) {
     // Handle user rejection, missing funds, etc
   }
   ```

4. **Use recent blockhash for transactions**
   ```typescript
   const { blockhash } = await connection.getLatestBlockhash();
   const tx = new Transaction({ recentBlockhash: blockhash });
   ```

5. **Confirm transactions properly**
   ```typescript
   await connection.confirmTransaction(signature, 'confirmed');
   ```

6. **Never expose private keys or seed phrases**
   - Only wallet extensions handle private keys
   - Use message signing for authentication

7. **Test on Devnet first**
   ```typescript
   const network = WalletAdapterNetwork.Devnet;
   ```

8. **Use environment variables for RPCs**
   ```typescript
   const endpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT!;
   ```

## Resources

- [Solana Web3.js Docs](https://docs.solana.com/developers/clients/javascript)
- [Wallet Adapter GitHub](https://github.com/solana-labs/wallet-adapter)
- [SPL Token Program](https://github.com/solana-labs/solana-program-library)
- [Metaplex Docs](https://docs.metaplex.com)
- [Phantom Wallet Docs](https://docs.phantom.app)
- [Solflare Docs](https://docs.solflare.com)

## Support

For wallet integration questions:
1. Check official documentation links above
2. Review QOS example apps in `components/macos/apps/`
3. Search GitHub issues for similar problems
4. Join Solana Discord for community help
