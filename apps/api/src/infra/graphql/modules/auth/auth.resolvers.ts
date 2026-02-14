import type { GraphQLContext } from "../../context.js";
import { register, login } from "../../../../application/services/auth.service.js";

export const authResolvers = {
  Mutation: {
    register: async (
      _: unknown,
      args: { input: { email: string; password: string; role?: string } },
      ctx: GraphQLContext,
    ) => register(ctx.db, args.input),

    login: async (
      _: unknown,
      args: { input: { email: string; password: string } },
      ctx: GraphQLContext,
    ) => login(ctx.db, args.input),
  },
};
