import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { userModule } from "./modules/user/index.js";
import { authModule } from "./modules/auth/index.js";

const baseTypeDefs = /* GraphQL */ `
  type Query {
    ping: String!
  }
  type Mutation {
    _empty: Boolean
  }
`;

const baseResolvers = {
  Query: {
    ping: () => "pong",
  },
};

export const typeDefs = mergeTypeDefs([baseTypeDefs, userModule.typeDefs, authModule.typeDefs]);
export const resolvers = mergeResolvers([
  baseResolvers,
  userModule.resolvers,
  authModule.resolvers,
]);
