import { gql } from '@apollo/client';
export const PROJECT_MEMBERS = gql`query ProjectMembers($projectId: ID!) { projectMembers(projectId: $projectId) { status message data { id projectId userId projectRoleId projectRole { id name description active } createdAt updatedAt } } }`;
