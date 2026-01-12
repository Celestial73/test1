import { axiosPrivate } from "../api/axios";
import { useEffect, useRef } from "react";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
    const { auth } = useAuth();
    const authRef = useRef(auth);

    // Keep authRef in sync with auth, but don't trigger interceptor re-registration
    useEffect(() => {
        authRef.current = auth;
    }, [auth]);

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // Log the full URL
                let fullUrl;
                if (config.url?.startsWith('http://') || config.url?.startsWith('https://')) {
                    // URL is already absolute
                    fullUrl = config.url;
                } else if (config.baseURL) {
                    // Construct full URL from baseURL and url
                    const baseURL = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
                    const url = config.url?.startsWith('/') ? config.url : `/${config.url || ''}`;
                    fullUrl = `${baseURL}${url}`;
                } else {
                    fullUrl = config.url || '';
                }
                // Add initData to Authorization header if available (using ref to get latest value)
                if (authRef.current?.initData && !config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${authRef.current.initData}`;
                }
                
                // Add ngrok-skip-browser-warning header to bypass ngrok warning page
                if (!config.headers['ngrok-skip-browser-warning']) {
                    config.headers['ngrok-skip-browser-warning'] = 'true';
                }
                
                console.log('axiosPrivate Request URL:', fullUrl);
                console.log('axiosPrivate Request Headers:', config.headers);
                
                return config;
            }, (error) => Promise.reject(error)
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }
    }, []) // Empty dependency array - interceptor is set up once and uses ref for auth

    return axiosPrivate;
}

export default useAxiosPrivate;