/**
 * Refresh Token Hook
 * 
 * NOTE: This hook is currently unused but kept for potential future use.
 * If token refresh functionality is needed, this hook can be integrated.
 * 
 * TODO: Remove this file if token refresh is not needed, or integrate it
 * when implementing token refresh functionality.
 */

import useAxios from './useAxios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const axios = useAxios();

    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });
        setAuth(prev => {
            return {
                ...prev,
                roles: response.data.roles,
                accessToken: response.data.accessToken
            }
        });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;
