import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { PROFILE } from '@/graphql/auth/queries';
import { UPDATE_MY_PROFILE } from '@/graphql/auth/mutations';
import { useProfileQuery } from '@/hooks/auth.hook';
import { getApolloErrorMessage, ensureSuccess } from '@/lib/graphql';
import { useUserStore } from '@/stores/user.store';
import type { ApiResponse, UpdateMyProfileInput, User } from '@/types/admin';

interface UpdateMyProfileMutationResult {
  updateMyProfile: ApiResponse<Pick<User, 'id' | 'name' | 'lastname' | 'email'>>;
}

interface ProfileFormErrors {
  name?: string;
  lastname?: string;
}

export const useProfilePage = () => {
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data?.profile?.data;
  const currentUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [updateMutation, updateState] = useMutation<UpdateMyProfileMutationResult>(UPDATE_MY_PROFILE);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  useEffect(() => {
    if (!editOpen && profile) {
      setName(profile.name);
      setLastname(profile.lastname);
    }
  }, [editOpen, profile?.name, profile?.lastname]);

  const permissionGroups = useMemo(() => {
    const permissions = profile?.role?.permissions ?? [];
    return permissions.reduce<Record<string, string[]>>((groups, permission) => {
      const key = permission.type || 'general';
      groups[key] = [...(groups[key] ?? []), permission.action];
      return groups;
    }, {});
  }, [profile]);
  const groupEntries = Object.entries(permissionGroups);
  const enabledPermissionCount = groupEntries.reduce(
    (total, [, actions]) => total + actions.length,
    0,
  );

  const openEdit = () => {
    setName(profile?.name ?? '');
    setLastname(profile?.lastname ?? '');
    setErrors({});
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (updateState.loading) return;
    setEditOpen(false);
    setErrors({});
  };

  const saveProfile = async () => {
    const input: UpdateMyProfileInput = {
      name: name.trim(),
      lastname: lastname.trim(),
    };
    const nextErrors: ProfileFormErrors = {};
    if (input.name.length < 3) nextErrors.name = 'Escribe al menos 3 caracteres.';
    if (input.lastname.length < 3) nextErrors.lastname = 'Escribe al menos 3 caracteres.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const result = await updateMutation({
        variables: { input },
        refetchQueries: [{ query: PROFILE }],
        awaitRefetchQueries: true,
      });
      const response = ensureSuccess(result.data?.updateMyProfile, 'No se pudo actualizar el perfil.');
      if (currentUser) {
        setUser({ ...currentUser, name: response.data.name, lastname: response.data.lastname });
      }
      toast.success(response.message || 'Perfil actualizado.');
      setEditOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return {
    profileQuery,
    profile,
    groupEntries,
    enabledPermissionCount,
    editOpen,
    name,
    lastname,
    errors,
    updateState,
    setName,
    setLastname,
    openEdit,
    closeEdit,
    saveProfile,
  };
};
