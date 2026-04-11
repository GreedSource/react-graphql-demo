import { gql } from '@apollo/client';

export const HELLO_STREAM_SUBSCRIPTION = gql`
  subscription HelloStream {
    helloStream
  }
`;
