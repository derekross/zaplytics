# ⚡ Zaplytics

> **Analytics dashboard for Nostr content creators to track zap earnings, top content, and supporter insights.**

Zaplytics is a comprehensive analytics platform built specifically for the Nostr ecosystem, helping content creators track and analyze their Lightning Network zap earnings with detailed insights and beautiful visualizations.

## 🌟 Features

### 📊 **Earnings Analytics**
- **Real-time tracking** of zap receipts across multiple time ranges (24h, 7d, 30d, 90d, custom)
- **Interactive charts** showing earnings trends over time
- **Detailed breakdowns** by content type, time periods, and performance metrics

### 📝 **Content Performance**
- **Top-performing content** analysis with earning and engagement metrics
- **Content type distribution** showing which types of posts earn the most
- **Hashtag analytics** to identify high-performing tags and topics
- **Virality scoring** and time-to-first-zap insights

### 👥 **Supporter Insights** 
- **Zapper loyalty analysis** categorizing supporters as whales, regulars, occasional, or one-time
- **Top supporters** with detailed contribution breakdowns  
- **Community growth** tracking new vs returning zappers
- **Supporter profiles** with names, verification status, and avatar integration

### 🕒 **Temporal Analysis**
- **Hourly activity patterns** to optimize posting times
- **Day-of-week analysis** showing peak engagement periods
- **Content longevity** tracking how long posts continue earning
- **Peak earnings windows** analysis

### 📈 **Advanced Metrics**
- **Average zap amounts** and distribution analysis
- **Success rates** by hashtags and content types  
- **Lifetime value** calculations for supporters
- **Growth trends** and performance indicators

### 💾 **Data Management**
- **CSV export** functionality for all analytics data
- **Custom date range** selection for targeted analysis
- **Progressive loading** with auto-fetch capabilities
- **Multi-relay support** for comprehensive data collection

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- A **Nostr account** with NIP-07 compatible browser extension (like [Alby](https://getalby.com/), [nos2x](https://github.com/fiatjaf/nos2x), or [Nostore](https://apps.apple.com/app/nostore/id1666553677))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/derekross/zaplytics.git
   cd zaplytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18.x** - Modern React with concurrent features and hooks
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server

### **Styling & UI**
- **TailwindCSS 3.x** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components built on Radix UI
- **Lucide React** - Beautiful SVG icons
- **Recharts** - Composable charting library built on D3

### **Nostr Integration**
- **@nostrify/nostrify** - Core Nostr protocol implementation
- **@nostrify/react** - React hooks and components for Nostr
- **nostr-tools** - Utilities for NIP-19 identifiers and cryptography

### **Data Management**
- **TanStack Query** - Powerful data fetching and state management
- **React Hook Form** - Performant forms with easy validation
- **date-fns** - Modern JavaScript date utility library

### **Development Tools**
- **ESLint** - Code linting and formatting
- **Vitest** - Fast unit testing framework
- **Testing Library** - Simple and complete testing utilities

## 🏗️ Project Structure

```
zaplytics/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── auth/                  # Authentication components  
│   │   └── zaplytics/             # Dashboard-specific components
│   │       ├── ZaplyticsDashboard.tsx
│   │       ├── StatsCards.tsx
│   │       ├── EarningsChart.tsx
│   │       ├── TopContentTable.tsx
│   │       └── ...
│   ├── hooks/
│   │   ├── useZapAnalytics.ts     # Main analytics data hook
│   │   ├── useCurrentUser.ts      # User authentication
│   │   └── useNostr.ts            # Nostr protocol integration
│   ├── lib/
│   │   └── zaplytics/
│   │       └── utils.ts           # Analytics calculation utilities
│   ├── types/
│   │   └── zaplytics.ts           # TypeScript type definitions
│   ├── pages/
│   │   ├── Index.tsx              # Main dashboard page
│   │   └── NotFound.tsx           # 404 error page
│   └── contexts/                  # React context providers
├── public/                        # Static assets
└── ...configuration files
```

## 🔧 Configuration

### **Relay Configuration**

Zaplytics comes pre-configured with popular Nostr relays:

- **Ditto** (`wss://ditto.pub/relay`)
- **Nostr.Band** (`wss://relay.nostr.band`) - *Default*
- **Damus** (`wss://relay.damus.io`)
- **Primal** (`wss://relay.primal.net`)

Users can switch between relays in the app settings to discover content from different sources.

### **Theme System**

- **Light/Dark mode** support with automatic system detection
- **Purple accent theme** as default for a distinctive look
- **CSS custom properties** for easy theme customization

## 📊 Analytics Deep Dive

### **Zap Receipt Processing**

Zaplytics processes NIP-57 zap receipts (kind 9735) to extract:
- **Amount** in satoshis from bolt11 invoices
- **Zapper information** from kind 0 metadata  
- **Source content** from referenced events
- **Comments** from zap requests
- **Timestamps** for temporal analysis

### **Data Aggregation**

The analytics engine provides:
- **Time-based grouping** (hourly, daily, weekly, monthly)
- **Content categorization** by Nostr event kinds
- **Loyalty scoring** based on frequency and recency
- **Performance metrics** like virality and longevity

### **Progressive Loading**

- **Automatic batch fetching** of zap receipts
- **Configurable limits** to prevent overloading relays
- **Auto-loading toggle** for continuous data collection
- **Progress indicators** for user feedback

## 🤝 Contributing

We welcome contributions to Zaplytics! Here's how you can help:

### **Development Setup**

1. **Fork the repository** on GitHub
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and ensure tests pass (`npm run test`)
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### **Areas for Contribution**

- 🐛 **Bug fixes** and performance improvements
- 📊 **New analytics features** and visualizations
- 🎨 **UI/UX enhancements** and accessibility improvements
- 🔌 **Relay compatibility** and Nostr protocol updates
- 📚 **Documentation** and example content
- 🧪 **Test coverage** and automation

### **Code Style**

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed

## 🌐 Nostr Protocol Integration

### **Supported NIPs (Nostr Improvement Proposals)**

- **NIP-01** - Basic protocol flow used everywhere
- **NIP-05** - Mapping Nostr keys to DNS-based internet identifiers
- **NIP-07** - Browser extension for signing events
- **NIP-19** - bech32-encoded entities (npub, note, naddr, etc.)
- **NIP-57** - Lightning Zaps for tipping content creators

### **Lightning Integration**

- **BOLT11** invoice parsing for zap amounts
- **Lightning Address** support for zapper identification
- **NIP-57** compliant zap receipt processing

## 📱 Browser Support

Zaplytics requires a **NIP-07 compatible browser extension** for Nostr authentication:

- **Chrome/Chromium**: [Alby](https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe), [nos2x](https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp)
- **Firefox**: [Alby](https://addons.mozilla.org/en-US/firefox/addon/alby/), [nos2x](https://addons.mozilla.org/en-US/firefox/addon/nos2x/)
- **Safari**: [Nostore](https://apps.apple.com/app/nostore/id1666553677)

## 🚀 Deployment

### **Vercel (Recommended)**

```bash
npm run deploy
```

### **Manual Deployment**

```bash
npm run build
# Upload dist/ contents to your hosting provider
```

### **Environment Configuration**

No environment variables required - Zaplytics works entirely client-side with Nostr relays.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Nostr Protocol** developers for creating the decentralized social network
- **Lightning Network** contributors for enabling instant micropayments  
- **Open source community** for the amazing tools and libraries
- **Early adopters** and contributors who help improve Zaplytics

## 🔗 Links

- **Live Demo**: [zaplytics.com](https://zaplytics.com) *(if deployed)*
- **Nostr Protocol**: [nostr.com](https://nostr.com)
- **Lightning Network**: [lightning.network](https://lightning.network)
- **NIP Specifications**: [nips.nostr.com](https://nips.nostr.com)

---

**Built with ⚡ for the Nostr ecosystem**

*Track your zaps, grow your audience, and understand your impact in the decentralized web.*
