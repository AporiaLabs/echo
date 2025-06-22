Echo is a lightweight framework for building AI agents, made for developers who want power without the clutter. Rebuilt with today’s tools and expectations in mind.

Built for Developers Who Want
---  
- Full LLM Access: Direct control over prompts and model calls
- No Hidden Layers: Minimal abstractions, maximum transparency
- Flexible by Design: Build exactly what you envision, your way

## Quick Start

1. **Clone and Install**

   ```bash
   git clone https://github.com/AporiaLabs/Echo
   cd Echo
   pnpm install
   ```

2. **Configure Environment**

   ```bash
   cp .env.example .env
   ```

   **Required environment variables:**


   ```bash
   # Database config
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   # Make sure to change to postgres in prisma
   # For SQLite use: DATABASE_URL="file:./prisma/dev.db"
   
   # OpenAI API configuration
   OPENAI_API_KEY="your-openai-api-key"

   # OpenRouter API configuration
   OPENROUTER_API_KEY="your-openrouter-api-key"

   # Application configuration
   APP_URL="http://localhost:3000"  # Mandatory for OpenRouter 
   
   # Social Media Configuration
   DISCORD_APPLICATION_ID=
   DISCORD_API_TOKEN=
   TWITTER_USERNAME=
   TWITTER_PASSWORD=
   TWITTER_EMAIL=
   TWITTER_POST_INTERVAL_HOURS=4
   TWITTER_POLLING_INTERVAL=5 # In minutes
   TWITTER_DRY_RUN=true

   SERVER_PORT=3000
   ```

3. **Initialize Database**

   ```bash
   npm run init-db
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```
