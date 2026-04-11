import { gql } from '@apollo/client';

export const MODULES = gql`
  query Modules {
    modules {
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

export const MODULE = gql`
  query Module($id: ID!) {
    module(id: $id) {
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
