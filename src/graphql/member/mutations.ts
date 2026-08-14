import { gql } from '@apollo/client';
export const ADD_PROJECT_MEMBER = gql`mutation AddProjectMember($input: AddProjectMemberInput!) { addProjectMember(input: $input) { status message data { id projectId userId projectRoleId projectRole { id name } createdAt updatedAt } } }`;
export const UPDATE_PROJECT_MEMBER_ROLE = gql`mutation UpdateProjectMemberRole($input: UpdateProjectMemberRoleInput!) { updateProjectMemberRole(input: $input) { status message data { id projectId userId projectRoleId projectRole { id name } updatedAt } } }`;
export const REMOVE_PROJECT_MEMBER = gql`mutation RemoveProjectMember($id: ID!) { removeProjectMember(id: $id) { status message data } }`;
