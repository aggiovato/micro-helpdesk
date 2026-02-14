export const userTypeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    role: String!
    createdAt: String!
  }

  extend type Query {
    users: [User!]!
  }
`;
