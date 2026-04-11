import { gql } from '@apollo/client';

export const USER_UPDATED = gql`
  subscription UserUpdated($userId: ID!) {
    userUpdated(userId: $userId) {
      id
      name
      lastname
      email
      role {
        id
        name
        description
        active
        permissions {
          type
          action
        }
      }
    }
  }
`;
