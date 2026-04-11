import { gql } from '@apollo/client';

export const CREATE_PERMISSION = gql`
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
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

export const DELETE_PERMISSION = gql`
  mutation DeletePermission($id: ID!) {
    deletePermission(id: $id)
  }
`;
