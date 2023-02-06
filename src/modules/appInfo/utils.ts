export const checkMeetMinVersion = (min: string, version: string) => {
  const minSplitted = min.split('.').map((str) => Number(str));
  const versionSplitted = version.split('.').map((str) => Number(str));

  for (let i = 0; i < 3; i++) {
    if (minSplitted[i] < versionSplitted[i]) {
      return true;
    }

    if (minSplitted[i] > versionSplitted[i]) {
      return false;
    }
  }

  return true;
};
