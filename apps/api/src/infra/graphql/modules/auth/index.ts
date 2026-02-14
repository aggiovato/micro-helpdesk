import { authTypeDefs } from "./auth.typeDefs.js";
import { authResolvers } from "./auth.resolvers.js";

export const authModule = {
  typeDefs: authTypeDefs,
  resolvers: authResolvers,
};
