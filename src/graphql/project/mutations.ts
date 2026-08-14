import { gql } from '@apollo/client';
import { PROJECT_FIELDS } from './queries';

export const CREATE_PROJECT = gql`${PROJECT_FIELDS} mutation CreateProject($input: CreateProjectInput!) { createProject(input: $input) { status message data { ...ProjectFields } } }`;
export const UPDATE_PROJECT = gql`${PROJECT_FIELDS} mutation UpdateProject($input: UpdateProjectInput!) { updateProject(input: $input) { status message data { ...ProjectFields } } }`;
export const ARCHIVE_PROJECT = gql`${PROJECT_FIELDS} mutation ArchiveProject($id: ID!) { archiveProject(id: $id) { status message data { ...ProjectFields } } }`;
export const DELETE_PROJECT = gql`mutation DeleteProject($id: ID!) { deleteProject(id: $id) { status message data } }`;
