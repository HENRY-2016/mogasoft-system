import React from 'react';
import { Navigate } from 'react-router-dom';

const CheckAuth = ({ children }) => {
    // Check if user is authenticated
    const isAuthenticated = () => {
        try {
            const userInfo = sessionStorage.getItem('userInfo');
            if (!userInfo) return false;
            const userData = JSON.parse(userInfo);
            return userData && userData.loggedIn === true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    };

    if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        return <Navigate to="/" replace />;
    }

    // Return children if authenticated
    return <>{children}</>;
};

export default CheckAuth;


// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const CheckAuth = ({ children, requiredRole }) => {
//     // Check if user is authenticated
//     const isAuthenticated = () => {
//         try {
//             const userInfo = sessionStorage.getItem('userInfo');
//             if (!userInfo) return false;
            
//             const userData = JSON.parse(userInfo);
//             return userData && userData.loggedIn === true;
//         } catch (error) {
//             console.error('Error checking authentication:', error);
//             return false;
//         }
//     };

//     // Check if user has required role
//     const hasRequiredRole = () => {
//         if (!requiredRole) return true; // No role requirement
        
//         try {
//             const userInfo = sessionStorage.getItem('userInfo');
//             if (!userInfo) return false;
            
//             const userData = JSON.parse(userInfo);
//             return userData.role === requiredRole;
//         } catch (error) {
//             return false;
//         }
//     };

//     if (!isAuthenticated()) {
//         return <Navigate to="/" replace />;
//     }

//     if (!hasRequiredRole()) {
//         return <Navigate to="/dashboard" replace />;
//     }

//     return <>{children}</>;
// };

// export default CheckAuth;

// For admin-only routes
{/* <Route path="/users" element={
    <CheckAuth requiredRole="admin">
        <Users />
    </CheckAuth>
} /> */}