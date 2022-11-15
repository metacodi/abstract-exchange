
export const concatError = (error: any, message: string): { code?: number; message: string } => {
  const internal = getErrorMessage(error);
  const err = message ? `${message} ${internal}` : internal;
  error = getErrorObject(error);
  error.message = err;
  return error;
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') { return error; }
  if (typeof error?.message === 'string') { return error.message; }
  if (typeof error === 'object') { return JSON.stringify(error); }
  if (typeof error?.toString === 'function') { return error.toString(); }
  return `${error}`;
};

export const getErrorObject = (error: any): { code?: number; message: string } => {
  if (typeof error === 'string') { return { message: error }; }
  if (typeof error === 'object') {
    if (typeof error.message !== 'string') { error.message = 'unknown'; }
    return error;
  }
  if (typeof error?.toString === 'function') { return { message: error.toString() }; }
  return { message: 'unknown' };
};
