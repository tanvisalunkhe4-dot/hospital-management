import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 1. Initialize from localStorage so the UI doesn't "pop" or flicker on refresh
  const [profileImage, setProfileImage] = useState(() => 
    localStorage.getItem('patient_profile_image') || null
  );

  // 2. Wrap the fetch in useCallback to keep the identity stable
  const fetchPersistentImage = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:8000/api/v1/patient/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.image_url) {
        setProfileImage(res.data.image_url);
        localStorage.setItem('patient_profile_image', res.data.image_url);
      }
    } catch (err) {
      // Silently fail or handle error - prevents console noise during dev
      console.warn("NexHealth Vault: Profile sync deferred.");
    }
  }, []);

  // 3. Sync on Mount
  useEffect(() => {
    fetchPersistentImage();
  }, [fetchPersistentImage]);

  // 4. Update localStorage only when profileImage actually changes
  useEffect(() => {
    if (profileImage) {
      localStorage.setItem('patient_profile_image', profileImage);
    } else {
      localStorage.removeItem('patient_profile_image');
    }
  }, [profileImage]);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};

// 5. The Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};