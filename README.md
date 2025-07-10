
# Microsoft Teams Meeting Generator

This is a simple Node.js application that allows you to generate Microsoft Teams meeting links. It uses the Microsoft Graph API to create a calendar event with a Teams meeting.

## Prerequisites

- Node.js
- A Microsoft Azure account with an application registration

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file in the root of the project and add the following environment variables:**
   ```
   TENANT_ID=<your-tenant-id>
   CLIENT_ID=<your-client-id>
   CLIENT_SECRET=<your-client-secret>
   REDIRECT_URI=http://localhost:3000/auth/callback
   ```

## Usage

1. **Start the application:**
   ```bash
   node index.js
   ```
2. **Authenticate with your Microsoft account:**
   - Open your browser and go to `http://localhost:3000`.
   - You will be redirected to the Microsoft login page. Log in with your credentials.
   - After successful authentication, you will be redirected back to the application.
3. **Create a meeting:**
   - Open a new browser tab and go to `http://localhost:3000/create-meeting`.
   - The application will create a new Teams meeting in your calendar and return the meeting details in JSON format.
