import { userTypeDefs } from "./user.typeDefs.js";
import { userResolvers } from "./user.resolvers.js";

export const userModule = {
  typeDefs: userTypeDefs,
  resolvers: userResolvers,
};
