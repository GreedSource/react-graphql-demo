import { gql } from '@apollo/client';

export const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    name
    description
    status
    ownerId
    archivedAt
    createdAt
    updatedAt
  }
`;

export const PROJECTS = gql`
  ${PROJECT_FIELDS}
  query Projects($includeArchived: Boolean) {
    projects(includeArchived: $includeArchived) { status message data { ...ProjectFields } }
  }
`;

export const PROJECT = gql`
  ${PROJECT_FIELDS}
  query Project($id: ID!) {
    project(id: $id) { status message data { ...ProjectFields } }
  }
`;
