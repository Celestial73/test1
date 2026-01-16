import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { initData, useSignal, useLaunchParams } from "@tma.js/sdk-react";
import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import useAuth from '../hooks/useAuth';
import { authService } from '../services/api/authService.js';

const Login = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const { auth, setAuth } = useAuth();
    const initDataRaw = useSignal(initData.raw);
    const lp = useLaunchParams();

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        const authenticateWithInitData = async () => {
            try {
                if (!initDataRaw) {
                    if (isMounted) {
                        setAuthError(true);
                        setIsLoading(false);
                    }
                    return;
                }

                const authData = await authService.loginWithTelegram(initDataRaw, abortController.signal);

                // If response is successful, store initData and all backend response data in auth context
                if (isMounted) {
                    setAuth(authData);
                    setAuthError(false);
                    setIsLoading(false);
                }
            } catch {
                if (isMounted) {
                    setAuthError(true);
                    setIsLoading(false);
                }
            }
        };

        // Only authenticate if we don't already have initData in context
        if (!auth?.initData) {
            authenticateWithInitData();
        } else {
            setIsLoading(false);
            setAuthError(false);
        }


        return () => {
            isMounted = false;
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initDataRaw]);

    // Show error screen if initData is not available
    if (authError && !isLoading) {
        return (
            <AppRoot
                appearance="light"
                platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
            >
                <Placeholder
                    header="Authentication Failed"
                    description="Unable to authenticate. Please try again later."
                />
            </AppRoot>
        );
    }

    return (
        <>
            {isLoading
                ? <p>Loading...</p>
                : <Outlet />
            }
        </>
    )
}

export default Login

