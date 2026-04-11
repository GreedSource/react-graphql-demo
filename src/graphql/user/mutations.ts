import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
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
        }
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      status
      message
      data
    }
  }
`;
