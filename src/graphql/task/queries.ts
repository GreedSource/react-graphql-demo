import { gql } from '@apollo/client';

export const TASKS = gql`
  query Tasks($projectId: ID) {
    tasks(projectId: $projectId) {
      status
      message
      data {
        id
        projectId
        title
        description
        status
        priority
        assigneeId
        createdById
        dueDate
        completedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const TASK = gql`
  query Task($id: ID!) {
    task(id: $id) {
      status message
      data { id projectId title description status priority assigneeId createdById dueDate completedAt createdAt updatedAt }
    }
  }
`;
