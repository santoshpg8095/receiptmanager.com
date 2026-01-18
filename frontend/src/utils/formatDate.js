export const formatDate = (dateString, format = 'default') => {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  if (format === 'time') {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Default format
  return date.toLocaleDateString('en-IN');
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
};