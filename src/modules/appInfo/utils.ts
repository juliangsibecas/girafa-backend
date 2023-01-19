export const checkMeetMinVersion = (min: string, version: string) => {
  const minSplitted = min.split('.');
  const versionSplitted = version.split('.');

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
