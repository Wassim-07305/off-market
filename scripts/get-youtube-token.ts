import dotenv from "dotenv";
import http from "node:http";
import https from "node:https";
import { execFile } from "node:child_process";
import { URL, URLSearchParams } from "node:url";

dotenv.config({ path: ".env.local" });

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/api/auth/youtube/callback";
const PORT = 3000;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "❌ YOUTUBE_CLIENT_ID et YOUTUBE_CLIENT_SECRET doivent être définis dans .env.local",
  );
  process.exit(1);
}

// Construire l'URL d'autorisation Google OAuth
const authParams = new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope:
    "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube",
  access_type: "offline",
  prompt: "consent",
});

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

/**
 * Echange le code d'autorisation contre un access token + refresh token
 */
function exchangeCode(code: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      code,
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString();

    const req = https.request(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body) as Record<string, unknown>);
          } catch {
            reject(new Error(`Réponse invalide de Google: ${body}`));
          }
        });
      },
    );

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

// Démarrer le serveur HTTP pour recevoir le callback
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (url.pathname === "/api/auth/youtube/callback") {
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<h1>Erreur: ${error}</h1><p>Vous pouvez fermer cet onglet.</p>`);
      console.error(`\n❌ Erreur d'autorisation: ${error}`);
      server.close();
      process.exit(1);
      return;
    }

    if (!code) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>Erreur: code manquant</h1>");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>Autorisation reçue !</h1><p>Retournez dans le terminal pour voir le refresh token. Vous pouvez fermer cet onglet.</p>",
    );

    exchangeCode(code)
      .then((tokens) => {
        console.log("\n✅ Tokens obtenus avec succès !\n");

        if (tokens.refresh_token) {
          console.log("=".repeat(60));
          console.log("REFRESH TOKEN :");
          console.log("=".repeat(60));
          console.log(`\n${tokens.refresh_token}\n`);
          console.log("=".repeat(60));
          console.log("\n📋 Ajoutez cette ligne dans votre .env.local :\n");
          console.log(
            `YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token as string}\n`,
          );
        } else {
          console.warn(
            "⚠️  Pas de refresh token dans la réponse. Assurez-vous d'avoir prompt=consent et access_type=offline.",
          );
          console.log("\nRéponse complète :", JSON.stringify(tokens, null, 2));
        }

        if (tokens.access_token) {
          console.log(
            `ACCESS TOKEN (expire dans ${tokens.expires_in as number}s) :`,
          );
          console.log(`${tokens.access_token}\n`);
        }

        server.close();
        process.exit(0);
      })
      .catch((err: unknown) => {
        console.error("\n❌ Erreur lors de l'échange du code :", err);
        server.close();
        process.exit(1);
      });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`\n🔐 Script de génération du refresh token YouTube\n`);
  console.log(`Serveur en écoute sur http://localhost:${PORT}\n`);
  console.log(`Ouvrez cette URL pour autoriser l'application :\n`);
  console.log(authUrl);
  console.log(`\n⏳ En attente de l'autorisation...\n`);

  // Ouvrir automatiquement dans le navigateur (macOS)
  execFile("open", [authUrl]);
});
