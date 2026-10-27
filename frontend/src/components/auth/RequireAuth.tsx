import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLocation, Navigate } from 'react-router-dom';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/getstarted" state={{ from: location }} replace />;
  }
  return children;
}
