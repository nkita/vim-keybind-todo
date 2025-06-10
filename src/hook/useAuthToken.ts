import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface UseAuthTokenReturn {
    token: string | null;
    isLoading: boolean;
    isLogin: boolean;
    error: string | undefined;
}

export const useAuthToken = (): UseAuthTokenReturn => {
    const { getAccessTokenSilently, user, isLoading: auth0Loading } = useAuth0();
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        const getToken = async () => {
            try {
                const accessToken = await getAccessTokenSilently();
                setToken(accessToken);
                setError(undefined);
            } catch (err) {
                console.error('Auth token error:', err);
                setError("認証に失敗しました。ログインし直すか、時間をおいてから再度お試しください。");
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (!auth0Loading) {
            if (user) {
                getToken();
            } else {
                setToken(null);
                setIsLoading(false);
                setError(undefined);
            }
        }
    }, [getAccessTokenSilently, user, auth0Loading]);

    return {
        token,
        isLoading,
        isLogin: !!user && !!token,
        error,
    };
};