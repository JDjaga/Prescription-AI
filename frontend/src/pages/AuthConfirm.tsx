import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

/**
 * Email-confirmation landing page.
 *
 * Supabase emails a link shaped like:
 *   {SITE_URL}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
 *
 * This page verifies the token_hash, establishes the session, then redirects
 * the user into the app. Configure the confirmation URL in:
 *   Supabase Dashboard -> Authentication -> Emails -> Confirmation URL
 */
const AuthConfirm = () => {
  const [status, setStatus] = useState<'working' | 'ok' | 'fail'>('working');
  const [message, setMessage] = useState('Confirming your email...');
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const tokenHash = params.get('token_hash');
      const type = (params.get('type') || 'email') as
        | 'signup'
        | 'invite'
        | 'magiclink'
        | 'recovery'
        | 'email_change'
        | 'email';

      // Fallback: some flows deliver ?code=... (PKCE) instead of token_hash
      const code = params.get('code');

      try {
        if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          throw new Error('Confirmation link is missing its token. Please use the latest email.');
        }

        setStatus('ok');
        setMessage('Email confirmed! Taking you in...');
        setTimeout(() => navigate(params.get('next') || '/', { replace: true }), 1200);
      } catch (err: unknown) {
        setStatus('fail');
        setMessage(
          err instanceof Error
            ? `Confirmation failed: ${err.message}`
            : 'Confirmation failed. Please try the link again from the newest email.'
        );
      }
    };
    run();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
        {status === 'working' && (
          <>
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800">Confirming your email</h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}
        {status === 'ok' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800">All set!</h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}
        {status === 'fail' && (
          <>
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800">Confirmation failed</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthConfirm;
