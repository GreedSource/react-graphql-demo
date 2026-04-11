import { gql } from '@apollo/client';

export const CREATE_ACTION = gql`
  mutation CreateAction($input: CreateActionInput!) {
    createAction(input: $input) {
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
