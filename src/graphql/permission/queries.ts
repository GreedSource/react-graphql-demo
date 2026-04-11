import { gql } from '@apollo/client';

export const PERMISSIONS = gql`
  query Permissions {
    permissions {
      status
      message
      data {
        id
        moduleId
        actionId
        description
      }
    }
  }
`;
