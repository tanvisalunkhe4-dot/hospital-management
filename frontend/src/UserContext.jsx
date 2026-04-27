import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 1. Initialize from localStorage so the UI doesn't "pop" or flicker on refresh
  const [profileImage, setProfileImage] = useState(() => 
    localStorage.getItem('patient_profile_image') || null
  );
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'patient');
  const fetchPersistentImage = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
   
    // Logic: Select endpoint based on role
    const endpoint = userRole === 'admin' 
      ? 'http://localhost:8000/api/v1/staff/profile' 
      : 'http://localhost:8000/api/v1/patient/profile';

    try {
      const res = await axios.get('http://localhost:8000/api/v1/patient/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 🟢 CHANGE THIS LINE: Match your backend key 'profile_url'
      const imageUrl = res.data.profile_url || res.data.profile_url; 
      
      if (imageUrl) {
        setProfileImage(imageUrl);
        localStorage.setItem(`${userRole}_profile_image`, imageUrl);
      }
    } catch (err) {
      console.warn("NexHealth: Profile sync deferred for", userRole);
    }
  }, [userRole])
  // 3. Sync on Mount
  useEffect(() => {
    fetchPersistentImage();
  }, [fetchPersistentImage]);

  // 4. Update localStorage only when profileImage actually changes
 

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