import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import crypto from "crypto";
import {
  GetAnimeDetailInputSchema,
  GetAnimeDetailOutputSchema,
  GetAnimeListInputSchema,
  GetAnimeListOutputSchema,
  GetAnimeRankingInputSchema,
  GetSeasonalAnimeInputSchema,
  GetSeasonalAnimeOutputSchema,
  GetSuggestedAnimeInputSchema,
  GetSuggestedAnimeOutputSchema,
  UpdateMyAnimeListStatusInputSchema,
  UpdateMyAnimeListStatusOutputSchema,
  DeleteMyAnimeListItemInputSchema,
  DeleteMyAnimeListItemOutputSchema,
  GetUserAnimeListInputSchema,
  GetUserAnimeListOutputSchema,
  GetAnimeRankingOutputSchema,
} from "./zod/animeSchemas";
import {
  GetMangaListInputSchema,
  GetMangaListOutputSchema,
  GetMangaDetailsInputSchema,
  GetMangaDetailsOutputSchema,
  GetMangaRankingInputSchema,
  GetMangaRankingOutputSchema,
  UpdateMyMangaListStatusInputSchema,
  UpdateMyMangaListStatusOutputSchema,
  DeleteMyMangaListItemInputSchema,
  DeleteMyMangaListItemOutputSchema,
  GetUserMangaListInputSchema,
  GetUserMangaListOutputSchema,
} from "./zod/mangaSchemas";

const BASE_URL = `https://api.myanimelist.net/v2`;
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID || "";
const MAL_CLIENT_SECRET = process.env.MAL_CLIENT_SECRET || "";
const PORT = process.env.PORT || "106";
const savedState = { state: "", codeVerifier: "" };

export let token: any = null;
async function fetchMAL(suburl: string, options?: RequestInit): Promise<any> {
  const response = await fetch(BASE_URL + suburl, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Authorization: token?.access_token ? `Bearer ${token.access_token}` : "",
      "X-MAL-CLIENT-ID": MAL_CLIENT_ID,
    },
  });
  if (!response.ok) {
    console.error(await response.text());
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Create an MCP server
const server = new McpServer({
  name: "MAL",
  version: "1.0.0",
});

server.registerTool(
  "getanimelist",
  {
    title: "Get anime list",
    description: "Get anime list from MAL",
    inputSchema: GetAnimeListInputSchema,
    outputSchema: GetAnimeListOutputSchema,
  },
  async ({ q, limit, offset, fields }) => {
    const params = new URLSearchParams({
      q,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });
    const fullResponse = await fetchMAL("/anime?" + params.toString());
    const structuredContent = {
      data: fullResponse.data.map((item: any) => item.node),
      paging: fullResponse.paging,
    };

    return {
      structuredContent,
      content: [
        { type: "text", text: JSON.stringify(structuredContent, null, 2) },
      ],
    };
  }
);

server.registerTool(
  "getanimedetails",
  {
    title: "Get anime detail",
    description: "Get anime detail from MAL",
    inputSchema: GetAnimeDetailInputSchema,
    outputSchema: GetAnimeDetailOutputSchema,
  },
  async ({ id, fields }) => {
    const params = new URLSearchParams({
      fields: fields.join(","),
    });
    const res = await fetchMAL(`/anime/${id}?` + params.toString());
    const structuredContent = { data: res };
    return {
      structuredContent,
      content: [
        { type: "text", text: JSON.stringify(structuredContent, null, 2) },
      ],
    };
  }
);

server.registerTool(
  "getanimeranking",
  {
    title: "Get anime ranking",
    description: "Get anime ranking from MAL",
    inputSchema: GetAnimeRankingInputSchema,
    outputSchema: GetAnimeRankingOutputSchema,
  },
  async ({ ranking_type, limit, offset, fields }) => {
    const params = new URLSearchParams({
      ranking_type,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });
    const fullResponse = await fetchMAL("/anime/ranking?" + params.toString());
    const structuredContent = {
      data: fullResponse.data.map((item: any) => ({
        ...item.node,
        ranking: item.ranking,
      })),
      paging: fullResponse.paging,
    };
    return {
      structuredContent,
      content: [
        { type: "text", text: JSON.stringify(structuredContent, null, 2) },
      ],
    };
  }
);

server.registerTool(
  "getseasonalanime",
  {
    title: "Get seasonal anime",
    description: "Get seasonal anime from MAL",
    inputSchema: GetSeasonalAnimeInputSchema,
    outputSchema: GetSeasonalAnimeOutputSchema,
  },
  async ({ year, season, sort, limit, offset, fields }) => {
    const params = new URLSearchParams({
      ...(sort && { sort }),
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });
    const fullResponse = await fetchMAL(
      `/anime/season/${year}/${season}?` + params.toString()
    );
    const structuredContent = {
      data: fullResponse.data.map((item: any) => item.node),
      paging: fullResponse.paging,
    };

    return {
      structuredContent,
      content: [
        { type: "text", text: JSON.stringify(structuredContent, null, 2) },
      ],
    };
  }
);

server.registerTool(
  "getsuggestedanime",
  {
    title: "Get suggested anime",
    description: "Get suggested anime for the authorized user from MAL.",
    inputSchema: GetSuggestedAnimeInputSchema,
    outputSchema: GetSuggestedAnimeOutputSchema,
  },
  async ({ limit, offset, fields }) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });
    const fullResponse = await fetchMAL(
      `/anime/suggestions?` + params.toString()
    );
    const structuredContent = {
      data: fullResponse.data.map((item: any) => item.node),
      paging: fullResponse.paging,
    };
    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(fullResponse, null, 2) }],
    };
  }
);

server.registerTool(
  "updatemyanimeliststatus",
  {
    title: "Update my anime list status",
    description: "Update the user's list status for a specific anime.",
    inputSchema: UpdateMyAnimeListStatusInputSchema,
    outputSchema: UpdateMyAnimeListStatusOutputSchema,
  },
  async ({ anime_id, ...statusUpdate }) => {
    if (!token) {
      throw new Error(
        `User not authenticated. Please go to http://localhost:${PORT}/auth/mal to authenticate.`
      );
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(statusUpdate)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.append(key, value.join(","));
        } else {
          params.append(key, String(value));
        }
      }
    }

    const res = await fetch(BASE_URL + `/anime/${anime_id}/my_list_status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: token?.access_token
          ? `Bearer ${token.access_token}`
          : "",
        "X-MAL-CLIENT-ID": MAL_CLIENT_ID,
      },
      body: params.toString(),
    });

    let structuredContent = await res.json();

    if (res.status === 404) {
      console.error(structuredContent);
      throw new Error("Anime not found in your list.");
    } else if (!res.ok) {
      console.error(structuredContent);
      throw new Error("Failed to update anime list status.");
    }

    return {
      structuredContent,
      content: [
        { type: "text", text: JSON.stringify(structuredContent, null, 2) },
      ],
    };
  }
);

server.registerTool(
  "deletemyanimelistitem",
  {
    title: "Delete my anime list item",
    description: "Deletes an anime from the user's list.",
    inputSchema: DeleteMyAnimeListItemInputSchema,
    outputSchema: DeleteMyAnimeListItemOutputSchema,
  },
  async ({ anime_id }) => {
    if (!token) {
      throw new Error(
        "User not authenticated. Please go to http://localhost:5839/auth/mal to authenticate."
      );
    }

    const response = await fetch(
      `${BASE_URL}/anime/${anime_id}/my_list_status`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    if (response.status === 200) {
      const structuredContent = {
        success: true,
        message: "Anime deleted successfully from your list.",
      };
      return {
        structuredContent,
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
      };
    } else if (response.status === 404) {
      const structuredContent = {
        success: false,
        message: "Anime not found in your list.",
      };
      return {
        structuredContent,
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
      };
    } else {
      const errorText = await response.text();
      throw new Error(
        `Failed to delete anime from list. Status: ${response.status}. Message: ${errorText}`
      );
    }
  }
);

server.registerTool(
  "getuseranimelist",
  {
    title: "Get user anime list",
    description: "Gets the anime list for a specified user.",
    inputSchema: GetUserAnimeListInputSchema,
    outputSchema: GetUserAnimeListOutputSchema,
  },
  async ({ user_name, status, sort, limit, offset, fields }) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });

    if (status) {
      params.append("status", status);
    }
    if (sort) {
      params.append("sort", sort);
    }

    const fullResponse = await fetchMAL(
      `/users/${user_name}/animelist?` + params.toString()
    );
    const structuredContent = {
      data: fullResponse.data.map((item: any) => item.node),
      paging: fullResponse.paging,
    };
    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(fullResponse, null, 2) }],
    };
  }
);

server.registerTool(
  "getmangalist",
  {
    title: "Get manga list",
    description: "Get manga list from MAL",
    inputSchema: GetMangaListInputSchema,
    outputSchema: GetMangaListOutputSchema,
  },
  async ({ q, limit, offset, fields }) => {
    const params = new URLSearchParams({
      q,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });
    const fullResponse = await fetchMAL("/manga?" + params.toString());
    const structuredContent = {
      data: fullResponse.data.map((item: any) => item.node),
      paging: fullResponse.paging,
    };

    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(fullResponse, null, 2) }],
    };
  }
);

server.registerTool(
  "getmangadetails",
  {
    title: "Get manga details",
    description: "Get details for a specific manga from MAL.",
    inputSchema: GetMangaDetailsInputSchema,
    outputSchema: GetMangaDetailsOutputSchema,
  },
  async ({ manga_id, fields }) => {
    const params = new URLSearchParams({
      fields: fields.join(","),
    });
    const res = await fetchMAL(`/manga/${manga_id}?` + params.toString());

    return {
      structuredContent: res,
      content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
    };
  }
);

server.registerTool(
  "getmangaranking",
  {
    title: "Get manga ranking",
    description: "Get manga ranking from MAL.",
    inputSchema: GetMangaRankingInputSchema,
    outputSchema: GetMangaRankingOutputSchema,
  },
  async ({ ranking_type, limit, offset, fields }) => {
    const params = new URLSearchParams({
      ranking_type,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });
    const fullResponse = await fetchMAL("/manga/ranking?" + params.toString());
    const structuredContent = {
      data: fullResponse.data.map((item: any) => ({
        ...item.node,
        ranking: item.ranking,
      })),
      paging: fullResponse.paging,
    };

    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(fullResponse, null, 2) }],
    };
  }
);

server.registerTool(
  "updatemymangaliststatus",
  {
    title: "Update my manga list status",
    description: "Update the user's list status for a specific manga.",
    inputSchema: UpdateMyMangaListStatusInputSchema,
    outputSchema: UpdateMyMangaListStatusOutputSchema,
  },
  async ({ manga_id, ...statusUpdate }) => {
    if (!token) {
      throw new Error(
        "User not authenticated. Please go to http://localhost:5839/auth/mal to authenticate."
      );
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(statusUpdate)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.append(key, value.join(","));
        } else {
          params.append(key, String(value));
        }
      }
    }

    const res = await fetchMAL(`/manga/${manga_id}/my_list_status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return {
      structuredContent: res,
      content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
    };
  }
);

server.registerTool(
  "deletemymangalistitem",
  {
    title: "Delete my manga list item",
    description: "Deletes a manga from the user's list.",
    inputSchema: DeleteMyMangaListItemInputSchema,
    outputSchema: DeleteMyMangaListItemOutputSchema,
  },
  async ({ manga_id }) => {
    if (!token) {
      throw new Error(
        "User not authenticated. Please go to http://localhost:5839/auth/mal to authenticate."
      );
    }

    const response = await fetch(
      `${BASE_URL}/manga/${manga_id}/my_list_status`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    if (response.status === 200) {
      const structuredContent = {
        success: true,
        message: "Manga deleted successfully from your list.",
      };
      return {
        structuredContent,
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
      };
    } else if (response.status === 404) {
      const structuredContent = {
        success: false,
        message: "Manga not found in your list.",
      };
      return {
        structuredContent,
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
      };
    } else {
      const errorText = await response.text();
      throw new Error(
        `Failed to delete manga from list. Status: ${response.status}. Message: ${errorText}`
      );
    }
  }
);

server.registerTool(
  "getusermangalist",
  {
    title: "Get user manga list",
    description: "Gets the manga list for a specified user.",
    inputSchema: GetUserMangaListInputSchema,
    outputSchema: GetUserMangaListOutputSchema,
  },
  async ({ user_name, status, sort, limit, offset, fields }) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(","),
    });

    if (status) {
      params.append("status", status);
    }
    if (sort) {
      params.append("sort", sort);
    }

    const fullResponse = await fetchMAL(
      `/users/${user_name}/mangalist?` + params.toString()
    );

    const structuredContent = {
      data: fullResponse.data.map((item: any) => item.node),
      paging: fullResponse.paging,
    };

    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(fullResponse, null, 2) }],
    };
  }
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  // Create a new transport for each request to prevent request ID collisions
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/auth/mal", (req, res) => {
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = codeVerifier;

  savedState.codeVerifier = codeVerifier;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: MAL_CLIENT_ID,
    code_challenge: codeChallenge,
    code_challenge_method: "plain",
    state: "nanana",
    redirect_uri: "http://localhost:5839/oauth/callback",
  });

  // store state and codeVerifier in session or DB to validate later
  // req.session.oauthState = state; req.session.codeVerifier = codeVerifier;

  res.redirect(
    `https://myanimelist.net/v1/oauth2/authorize?${params.toString()}`
  );
});

app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code as string;
  const codeVerifier = savedState.codeVerifier;
  if (!codeVerifier) {
    res.status(400).send("Invalid state");
    return;
  }
  const params = new URLSearchParams({
    client_id: MAL_CLIENT_ID,
    client_secret: MAL_CLIENT_SECRET,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: "http://localhost:5839/oauth/callback",
  });

  const tokenResponse = await fetch("https://myanimelist.net/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!tokenResponse.ok) return res.status(500).json({ success: false });
  token = await tokenResponse.json();
  res.json({ success: true });
});

app
  .listen(PORT, () => {
    console.log(`MAL MCP Server running on http://localhost:${PORT}/mcp`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
