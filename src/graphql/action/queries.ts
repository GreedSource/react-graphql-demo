import { gql } from '@apollo/client';

export const ACTIONS = gql`
  query Actions {
    actions {
      status
      message
      data {
        id
        name
        key
        description
        active
      }
    }
  }
`;
