export const typeDefs = /* GraphQL */ `
  type Query {
    ping: String!
  }
`;

export const resolvers = {
  Query: {
    ping: () => "pong",
  },
};
