import axiosInstance from "../api/axios";

// Interceptors are registered as singletons in axios.js at module level
// This hook just returns the instance
const useAxios = () => {
    return axiosInstance;
}

export default useAxios;

