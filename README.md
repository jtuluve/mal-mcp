![mal-mcp banner](/banner.png)

# MAL-MCP

A Model Context Protocol (MCP) server for MyAnimeList, enabling AI chats and applications to interact with MyAnimeList data.

### Developer Guide

**Prerequisites:**

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   Git
*   MAL Api client ID and secret. You can get it from [https://myanimelist.net/apiconfig](https://myanimelist.net/apiconfig)

**Setup:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jtuluve/mal-mcp.git
    cd mal-mcp
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root directory. This file will store your sensitive API keys and other configuration. You will need to obtain a Client ID and Client Secret from MyAnimeList API.

    ```
    MAL_CLIENT_ID=your_myanimelist_client_id
    MAL_CLIENT_SECRET=your_myanimelist_client_secret
    ```

**Running the Server:**

*   **Development Mode:**
    To run the server in development mode with automatic restarts on file changes:
    ```bash
    npm run dev
    ```
    The server will typically run on `http://localhost:106` (or another port if configured).

*   **Production Mode:**
    First, build the project:
    ```bash
    npm run build
    ```
    Then, start the server:
    ```bash
    npm start
    ```
    The production server will serve the compiled JavaScript code.

**Project Structure:**

*   `src/server.ts`: The main entry point for the Express server, handling API routes and MCP tool exposure.
*   `src/zod/`: Houses Zod schemas for data validation, ensuring type safety and data integrity for requests and responses.
*   `.env`: Stores environment variables (e.g., API keys).

**Contributing:**

Feel free to create an issue, fork the repository, make improvements, and submit pull requests.
