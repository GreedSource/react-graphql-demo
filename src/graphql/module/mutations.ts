import { gql } from '@apollo/client';

export const CREATE_MODULE = gql`
  mutation CreateModule($input: CreateModuleInput!) {
    createModule(input: $input) {
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

export const UPDATE_MODULE = gql`
  mutation UpdateModule($input: UpdateModuleInput!) {
    updateModule(input: $input) {
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
