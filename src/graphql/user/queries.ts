import { gql } from '@apollo/client';

export const USER = gql`
  query User($id: ID!) {
    user(id: $id) {
      status
      message
      data {
        id
        name
        lastname
        email
        role {
          id
          name
          description
          active
        }
      }
    }
  }
`;

export const USERS = gql`
  query Users {
    users {
      status
      message
      data {
        id
        name
        lastname
        email
        role {
          id
          name
          description
          active
        }
      }
    }
  }
`;
