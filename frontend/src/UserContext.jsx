import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 1. Initialize from localStorage
  const [profileImage, setProfileImage] = useState(() => 
    localStorage.getItem('patient_profile_image') || null
  );
  
  // Note: Ensure your login component sets 'user_role' in localStorage
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'patient');

  const fetchPersistentImage = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
   
    // ✅ FIX 1: Use the roles your backend expects (e.g., 'doctor' usually uses staff endpoint)
    const isStaff = userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse';
    
    const endpoint = isStaff 
      ? 'http://localhost:8000/api/v1/staff/profile' 
      : 'http://localhost:8000/api/v1/patient/profile';

    try {
      // ✅ FIX 2: Use the 'endpoint' variable instead of the hardcoded patient URL
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const imageUrl = res.data.profile_url; 
      
      if (imageUrl) {
        setProfileImage(imageUrl);
        localStorage.setItem(`${userRole}_profile_image`, imageUrl);
      }
    } catch (err) {
      console.warn("NexHealth: Profile sync deferred for", userRole);
    }
  }, [userRole]);

  // 3. Sync on Mount
  useEffect(() => {
    fetchPersistentImage();
  }, [fetchPersistentImage]);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};