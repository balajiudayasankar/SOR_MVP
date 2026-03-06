export const extractErrorMessage = (error) => {
  if (error.response?.data?.Message) return error.response.data.Message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return Object.values(error.response.data.errors).flat().join('. ');
  if (error.response?.data?.title) return error.response.data.title;
  return error.message || 'An error occurred';
};

export const triggerBlobDownload = (blobData, filename) => {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
