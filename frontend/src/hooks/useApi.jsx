import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    method = 'GET',
    body = null,
    dependencies = [],
    immediate = true,
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async (customUrl = null, customOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api({
        method: customOptions.method || method,
        url: customUrl || url,
        data: customOptions.body || body,
        ...customOptions
      });

      setData(response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method, body, onSuccess, onError]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate: setData
  };
};