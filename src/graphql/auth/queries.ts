import { gql } from '@apollo/client';

export const PROFILE = gql`
  query Profile {
    profile {
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
          permissions {
            type
            action
          }
        }
      }
    }
  }
`;
