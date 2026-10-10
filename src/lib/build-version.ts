interface BuildVersionResponse {
  buildId?: string;
}

let pendingCheck: Promise<boolean> | null = null;

const requestBuildCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}version.json`, {
      cache: 'no-store',
    });

    if (!response.ok) return false;

    const payload = (await response.json()) as BuildVersionResponse;
    return Boolean(payload.buildId && payload.buildId !== __APP_BUILD_ID__);
  } catch {
    // La aplicación debe continuar aunque version.json no esté disponible.
    return false;
  }
};

export const checkForNewBuild = (): Promise<boolean> => {
  if (!pendingCheck) {
    pendingCheck = requestBuildCheck().finally(() => {
      pendingCheck = null;
    });
  }

  return pendingCheck;
};
