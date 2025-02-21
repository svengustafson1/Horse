# Event Response System

A web application for managing events and collecting responses from users.

## Features

- Event management (create, edit, delete events)
- User management
- Response collection (Yes/No/Maybe/Other)
- Event filtering and search
- Notes support for events

## Project Structure

- `/client` - React frontend
- `/server` - Node.js/Express backend
- `/server/db` - SQLite database and schemas

## Local Development Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Start the development servers
```bash
# Start the backend server (from /server directory)
npm start

# Start the frontend development server (from /client directory)
npm start
```

## Deployment

### Backend (Node.js/Express)

1. Set up environment variables:
   - `PORT` - Server port (default: 3001)

2. Build and start the server:
```bash
cd server
npm install
npm start
```

### Frontend (React)

1. Update the API base URL in `client/src/config.ts` to match your production server URL.

2. Build the frontend:
```bash
cd client
npm install
npm run build
```

3. Deploy the built files from the `build` directory to your hosting service.

## Vercel Deployment

1. Push your code to GitHub

2. Connect your GitHub repository to Vercel:
   - Create a new project in Vercel
   - Import your GitHub repository
   - Configure build settings:
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `client/build`
     - Install Command: `npm install`

3. Configure environment variables in Vercel:
   - Add any necessary environment variables in the Vercel project settings

## Database Management

To clear all responses from the database:

```bash
cd server
sqlite3 db/database.sqlite < db/clear.sql
```

## License

MIT 