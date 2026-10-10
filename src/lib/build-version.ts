interface BuildVersionResponse {
  buildId?: string;
}

export const ensureCurrentBuild = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}version.json`, {
      cache: 'no-store',
    });

    if (!response.ok) return true;

    const payload = (await response.json()) as BuildVersionResponse;
    if (payload.buildId && payload.buildId !== __APP_BUILD_ID__) {
      window.location.reload();
      return false;
    }
  } catch {
    // La aplicación debe poder iniciar aunque version.json no esté disponible.
  }

  return true;
};
