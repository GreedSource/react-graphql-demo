import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      lastname
      email
    }
  }
`;

// Queries
export const GET_USERS = gql`
  query {
    users {
      id
      name
      lastname
    }
  }
`;
