### Biometric will work on development build. Feature is implemented but hidden in expo go mode.

## Recently Completed
- [x] Fix "Token Not Found" race condition on asset detail screen
- [x] Fix Polygon chart/ticker (updated CoinGecko ID to polygon-ecosystem-token)
- [x] Add gas balance validation before PIN confirmation on send screen
- [x] Portfolio Analytics
  - Donut allocation chart (interactive, touch-selectable segments)
  - Holdings list with percentage bars
  - 24h Performance card (value change, percentage, best/worst performers)
  - Portfolio metrics (diversification score, top holding, asset count)
  - Token color system with consistent colors
  - Small holdings grouped as "Other"
- [x] DEX Swap Integration (Uniswap V3)
  - Full swap UI with token selection, amount input, slippage settings
  - Real-time quotes from Uniswap V3 QuoterV2
  - Support for all networks (Ethereum, Polygon, Arbitrum, Optimism, Base)
  - Works on both mainnet and testnet (Sepolia, etc.)
  - ERC20 token approval flow
  - Price impact warnings (yellow >1%, red >5%)
  - Swap transaction history with local storage
  - Inline error messages for no liquidity pools

## Future TODOs
- Address Book
- WalletConnect
- Price Alerts
- Custom Token Import
- NFT Support
- Advanced Gas Controls
- Transaction Filters
- Staking Integration