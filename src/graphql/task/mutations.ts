import { gql } from '@apollo/client';

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
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
        dueDate
        completedAt
        updatedAt
      }
    }
  }
`;

export const CREATE_TASK = gql`mutation CreateTask($input: CreateTaskInput!) { createTask(input: $input) { status message data { id projectId title description status priority assigneeId createdById dueDate completedAt createdAt updatedAt } } }`;
export const ASSIGN_TASK = gql`mutation AssignTask($id: ID!, $assigneeId: ID!) { assignTask(id: $id, assigneeId: $assigneeId) { status message data { id assigneeId updatedAt } } }`;
export const COMPLETE_TASK = gql`mutation CompleteTask($id: ID!) { completeTask(id: $id) { status message data { id status completedAt updatedAt } } }`;
export const DELETE_TASK = gql`mutation DeleteTask($id: ID!) { deleteTask(id: $id) { status message data } }`;
