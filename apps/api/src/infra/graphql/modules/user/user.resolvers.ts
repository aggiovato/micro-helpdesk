import type { GraphQLContext } from "../../context.js";
import { getUsers } from "../../../../application/services/user.service.js";

export const userResolvers = {
  Query: {
    users: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      return getUsers(ctx.db, ctx.user, { limit: 50 });
    },
  },
};
