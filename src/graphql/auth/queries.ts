import { gql } from '@apollo/client';

export const PROFILE = gql`
  query Profile {
    profile {
      data {
        id
        name
        lastname
        email
      }
    }
  }
`;
