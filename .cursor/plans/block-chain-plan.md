                 React App
                     │
          MetaMask / WalletConnect
                     │
        ethers.js / wagmi / viem
                     │
         RPC Provider (Alchemy)
                     │
              Smart Contracts
                     │
        ─────────────────────────
                     │
           Event Listener Service
                     │
              Kafka / RabbitMQ
                     │
        ┌────────────┴────────────┐
        │                         │
     Notification           Indexer Service
        │                         │
        └────────────┬────────────┘
                     │
             Redis + PostgreSQL
                     │
               Backend APIs
                     │
                 React UI