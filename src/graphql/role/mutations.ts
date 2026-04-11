import { gql } from '@apollo/client';

export const CREATE_ROLE = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
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

export const UPDATE_ROLE = gql`
  mutation UpdateRole($input: UpdateRoleInput!) {
    updateRole(input: $input) {
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

export const DELETE_ROLE = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id) {
      status
      message
      data
    }
  }
`;

export const ADD_PERMISSIONS_TO_ROLE = gql`
  mutation AddPermissionsToRole($roleId: ID!, $permissionIds: [ID!]!) {
    addPermissionsToRole(roleId: $roleId, permissionIds: $permissionIds) {
      status
      message
      data
    }
  }
`;

export const REMOVE_PERMISSIONS_FROM_ROLE = gql`
  mutation RemovePermissionsFromRole($roleId: ID!, $permissionIds: [ID!]!) {
    removePermissionsFromRole(roleId: $roleId, permissionIds: $permissionIds) {
      status
      message
      data
    }
  }
`;
