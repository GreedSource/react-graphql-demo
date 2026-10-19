import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      status
      message
      data {
        accessToken
        refreshToken
        user {
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
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      status
      message
      data {
        accessToken
        refreshToken
        user {
          id
          name
          lastname
          email
        }
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      status
      message
      data {
        accessToken
        refreshToken
        user {
          id
          name
          lastname
          email
          role {
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
    }
  }
`;

export const RECOVER_PASSWORD = gql`
  mutation RecoverPassword($email: String!) {
    recoverPassword(email: $email) {
      status
      message
      data
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      status
      message
      data
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      status
      message
      data
    }
  }
`;

const AUTH_PAYLOAD_FIELDS = `
  accessToken
  refreshToken
  user {
    id
    name
    lastname
    email
    role {
      id
      name
      permissions {
        type
        action
      }
    }
  }
`;

export const IMPERSONATE_USER = gql`
  mutation ImpersonateUser($userId: ID!) {
    impersonateUser(userId: $userId) {
      status
      message
      data {
        ${AUTH_PAYLOAD_FIELDS}
      }
    }
  }
`;

export const STOP_IMPERSONATION = gql`
  mutation StopImpersonation {
    stopImpersonation {
      status
      message
      data {
        ${AUTH_PAYLOAD_FIELDS}
      }
    }
  }
`;
