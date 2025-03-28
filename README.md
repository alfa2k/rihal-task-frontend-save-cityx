# 2025 Frontend Rihal Codestacker Challenge

Save CityX is a responsive, Vite/React-based application for monitoring and reporting crimes in real time. The project features an interactive Mapbox map with crime markers, filtering options, and real-time statistics. The UI adapts to different screen sizes and modes (light/dark) for an optimal user experience.

[![Watch the demo video]](https://youtu.be/fV2bALVf_CA?si=mDAPrkX9E8ni7rOU)


## Features

- **Interactive Map:**  
  Displays crime markers using Mapbox GL with detailed popups.
  
- **Responsive Design:**  
  Adaptive layout for mobile, tablet, and desktop devices.
  
- **Real-Time Filters:**  
  Filter crimes by type, status, and search queries.
  
- **Dark/Light Mode:**  
  Toggle between dark and light themes.

## Demo

The live application is deployed on Vercel:  
[https://rihal-task-frontend-save-cityx.vercel.app/](https://rihal-task-frontend-save-cityx.vercel.app/)

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/save-cityx.git
   cd save-cityx
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables:**

   Create a `.env` file in the root directory and add your Mapbox access token:

   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

   Make sure to add `.env` to your `.gitignore` to keep your token secure.

### Running Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

This project can be easily deployed to platforms like Vercel. To deploy on Vercel:

1. Push the project to a GitHub repository.
2. Import the repository into Vercel.
3. Set your environment variable `VITE_MAPBOX_TOKEN` in the Vercel dashboard.
4. Vercel will auto-detect the Vite configuration and deploy your project.
