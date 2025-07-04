# FILWPAgent: Fair AI Training Economy for WordPress & Forums

## Problem
WordPress powers approximately 43–44% of all websites worldwide as of mid-2025,in the CMS market, WordPress holds a dominant 61–63% share. AI companies are scraping content from WordPress for free. At the same time, AI systems cannot prove they are using content legally or compensating creators.

## Idea
FILWPAgent is a plugin/service that transforms your WordPress site or forum into an AI-accessible API with automatic compensation and immutable audit records using filecoin network storage. This enables a fair, transparent, and decentralized content economy for the AI era.

## How It Works
1. **WordPress Plugin for Creators:**
   - Site owners install our plugin and set their wallet address and desired payment amount(*USDFC stablecoin*) for each blog post and click on monitize Button in dashboard.
   - The plugin submits blog metadata (title, summary, tags, wallet, amount, etc.) to our FILWPAgent

2. **Decentralized Content Registry:**
   - FILWPAgent inserts the content metadata into a Tableland decentralized database (onchain SQLite table) and deploy smart Contract
   - This creates an immutable, auditable record of all content available for AI access.

3. **User Platform & Payment:**
   - Users visit our platform and search for topics.
   - If relevant content is found in Tableland Database via sql query operations without using centralized database, users can pay the creator's specified amount (in USDFC) for purchasing Content
    Filecoin network stablecoin) calls to smart contract on filecoin Network to access the full content and happily receive content.
   - Payment and access are handled onchain, ensuring transparency and fair compensation.

## Future Plans
- Our WordPress plugin is currently in the approval queue (position #422) on the official WordPress plugin directory.
- We plan to launch on Filecoin mainnet soon, bringing decentralized, fair content monetization to a global audience.

---

**FILWPAgent: Empowering creators, enabling fair AI, and building the future of the web content economy.**

---

## Gallery

### Agent SQL Query Example
![Agent SQL Query Example](./gallery/agentSQL.png)

### Tableland SQLite Dashboard
![Tableland SQLite Dashboard](./gallery/sqlLitedashboard.png)

### FILWPAgent Tableland Integration
![FILWPAgent Tableland Integration](./gallery/filtableland.png)

###PLUGIN REVIEW UNDER WORDPRESS 
![WORDPRESS PLUGIN REVIEW](./gallery/image.png)
