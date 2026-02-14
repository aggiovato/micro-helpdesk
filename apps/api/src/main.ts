import "dotenv/config";
import express from "express";

// Import apollo server
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs, resolvers } from "./infra/graphql/schema";

// Test db connection
import { dbPing } from "./infra/db/pool";
import { buildContext } from "./infra/graphql/context";

const PORT = Number(process.env.PORT ?? "4000");

// Bootstrap server
async function bootstrap() {
  const app = express();

  app.use(express.json());

  // health check
  app.get("/health", async (_req, res) => {
    try {
      const dbOk = await dbPing();
      res.json({ ok: true, db: dbOk ? "up" : "down" });
    } catch (err) {
      res.status(500).json({ ok: false, db: "down" });
    }
  });

  // Apollo server
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apollo.start();

  app.use("/graphql", expressMiddleware(apollo, { context: buildContext }));

  // Start server
  app.listen(PORT, () => {
    console.log(`[api] listening on port http://localhost:${PORT}`);
    console.log(`[api] health     -> http://localhost:${PORT}/health`);
    console.log(`[api] graphql    -> http://localhost:${PORT}/graphql`);
  });
}

bootstrap().catch((err) => {
  console.error("[api] error", err);
  process.exit(1);
});
