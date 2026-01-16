import { axiosPrivate } from "../api/axios";

/**
 * Hook to get the private axios instance with authentication interceptors.
 * Interceptors are set up once globally in App.jsx, so this hook just returns the instance.
 */
const useAxiosPrivate = () => {
    return axiosPrivate;
}

export default useAxiosPrivate;