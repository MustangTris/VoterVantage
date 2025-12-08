# VoterVantage Platform

**Informed and Free, Together We Shape Democracy.**

VoterVantage is a non-profit initiative dedicated to bringing unprecedented transparency to local political campaign finance in Southern California. By analyzing and digitizing **Form 460 filings**, we empower voters to "Follow the Money" in their city politics, revealing exactly who is funding whom.

## 📖 About the Project

Local elections often lack the scrutiny of national ones, yet they have a direct impact on daily life. VoterVantage bridges this gap by providing a centralized, searchable database of campaign finance disclosures.

Our mission is to:
- **Democratize Data:** Make complex financial filings accessible and easy to understand for the average voter.
- **Reveal Influence:** Highlight the difference between local resident funding and outside corporate interests.
- **Empower Communities:** Provide the tools necessary for citizens to make informed decisions at the ballot box.

## 🌟 Key Features

### For Voters & Researchers
- **Interactive SoCal Map**: Explore transparency data availability across Southern California cities.
- **Searchable Database**: meaningful search for Politicians, Lobbying Groups, and City profiles.
- **Visual Trends**:
  - **Contribution Breakdowns**: See the split between individual, corporate, and PAC donations.
  - **Geographic Analysis**: Identify "Local vs. Outside" funding sources.
  - **Trend Lines**: Track fundraising velocity over time.
- **Deep-Dive Profiles**: Comprehensive dashboards for every candidate and committee.

### For Volunteers
- **Rapid Digitization Portal**: specialized tools for volunteers to upload, parse, and verify Form 460 filings (Excel & PDF).
- **Data Management**: Robust CMS for managing detailed profiles of cities and politicians.

## 🚀 Tech Stack

Built with modern web technologies for performance and scale:

- **Framework**: Next.js 16 (React 19, App Router)
- **Styling**: Tailwind CSS v4, Framer Motion (Animations), Shadcn UI
- **Database**: PostgreSQL (Supabase), managed via `pg` and NextAuth adapters
- **Authentication**: NextAuth.js (v5 Beta)
- **Visualization**: Recharts (Data Charts), React Leaflet (Maps)
- **Payment Processing**: Stripe
- **Utilities**: `lucide-react` (Icons), `clsx`, `tailwind-merge`

## 🛠️ Getting Started

To run the project locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/MustangTris/VoterVantage.git
   cd VoterVantage
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file based on `.env.example` with your database and API credentials.

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

- `src/app`: Application routes, pages, and layouts.
- `src/components`: Reusable UI components (Charts, Maps, Modals).
- `src/lib`: Utilities, database clients, and helper functions.
- `schema.sql`: Database schema definition for PostgreSQL.
- `legacy/`: Archive of original Python data extraction scripts.

## 🤝 Contributing

This project is powered by volunteers who believe in the power of open data.
Visit the `/dashboard` page to learn how you can contribute data or join our engineering team.

---
*VoterVantage is a non-profit organization.*
