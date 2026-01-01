import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProfileCompletion = () => {
  const [profileCompleted, setProfileCompleted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('user');

      if (!token || !userType) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post('http://127.0.0.1:5000/check-profile', {
          token: token,
          user_type: userType
        });

        setProfileCompleted(response.data.profile_completed);
        setLoading(false);
      } catch (err) {
        console.error('Error checking profile completion:', err);
        setError(err);
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, []);

  return { profileCompleted, loading, error };
};
