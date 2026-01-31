export const getBaseUrl = () => {
  return `http://${window.location.hostname}:5000`;
};

export const API_URL = `${getBaseUrl()}/api`;
