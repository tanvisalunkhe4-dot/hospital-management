import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 1. Initialize from storage - Check both localStorage and sessionStorage for consistency
  const [profileImage, setProfileImage] = useState(() => 
    localStorage.getItem('patient_profile_image') || null
  );
  
  // ✅ FIX: Use sessionStorage to match your login logic and default to null to prevent premature API calls
  const [userRole, setUserRole] = useState(() => {
    const rawData = sessionStorage.getItem('user_data');
    if (rawData) {
      try {
        return JSON.parse(rawData).role;
      } catch { return null; }
    }
    return null;
  });

  const fetchPersistentImage = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token || !userRole) return; 
   
    const staffRoles = ['admin', 'doctor', 'nurse', 'staff', 'pharmacist', 'receptionist', 'superadmin'];
    
    // ✅ FIX: Change 'role' to 'userRole' (matches the state variable above)
    const normalizedRole = userRole.toLowerCase().replace(" ", "");
    const isStaff = staffRoles.includes(normalizedRole);

    const endpoint = isStaff 
      ? 'http://127.0.0.1:8000/api/v1/staff/profile' 
      : 'http://127.0.0.1:8000/api/v1/patient/profile';

    try {
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

  // 3. Sync on Mount and when userRole changes
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