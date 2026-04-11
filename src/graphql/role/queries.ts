import { gql } from '@apollo/client';

export const ROLES = gql`
  query Roles {
    roles {
      status
      message
      data {
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

export const ROLE = gql`
  query Role($id: ID!) {
    role(id: $id) {
      status
      message
      data {
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
