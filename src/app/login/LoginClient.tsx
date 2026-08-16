'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { isAdminRole } from '@/lib/is-admin';
import { PageShell } from '@/components/PageShell';
import { api } from '@/lib/api';

type Mode = 'password' | 'otp';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, setSession } = useAuth();
  const [mode, setMode] = useState<Mode>('otp');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const redirect = searchParams.get('redirect');
    if (isAdminRole(user.role)) router.replace('/admin');
    else if (redirect) router.replace(redirect);
    else router.replace('/account');
  }, [user, authLoading, router, searchParams]);

  function goAfterLogin(nextUser: { role: string }) {
    const redirect = searchParams.get('redirect');
    if (isAdminRole(nextUser.role)) router.push('/admin');
    else if (redirect) router.push(redirect);
    else router.push('/account');
  }

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const { accessToken, user: nextUser } = await api.login({
        login: login.trim(),
        password,
      });
      setSession(accessToken, nextUser);
      goAfterLogin(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const result = await api.requestLoginOtp(email.trim());
      setOtpSent(true);
      setInfo(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { accessToken, user: nextUser } = await api.verifyLoginOtp({
        email: email.trim(),
        code: otp.trim(),
      });
      setSession(accessToken, nextUser);
      goAfterLogin(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || user) {
    return (
      <PageShell hideFooter>
        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center text-slate-400">
          Loading...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell hideFooter>
      <div className="hero-glow grid-pattern relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="badge-live">Live marketplace</span>
            <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
              Move freight with{' '}
              <span className="gradient-text">confidence</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-400">
              Sign in with email OTP or password to manage shipments, browse loads, and connect with partners worldwide.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                ['500+', 'Active loads'],
                ['2 min', 'Avg. match'],
                ['OTP', 'Email login'],
              ].map(([val, label]) => (
                <div key={label} className="glass-panel rounded-2xl p-4 text-center">
                  <div className="text-xl font-bold text-white">{val}</div>
                  <div className="mt-1 text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Account access</p>
            <h2 className="mt-3 text-2xl font-bold">Welcome back</h2>

            <div className="mt-6 flex gap-2 rounded-full border border-white/10 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('otp');
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                  mode === 'otp' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('password');
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                  mode === 'password' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Password
              </button>
            </div>

            {mode === 'otp' ? (
              <form
                onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                className="mt-6"
              >
                <label className="block text-sm font-medium text-slate-300">
                  Email
                  <input
                    className="input-field mt-2"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                {otpSent ? (
                  <label className="mt-5 block text-sm font-medium text-slate-300">
                    6-digit code
                    <input
                      className="input-field mt-2 tracking-[0.35em]"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </label>
                ) : null}

                {info && <p className="mt-4 text-sm text-emerald-400">{info}</p>}
                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary mt-8 w-full py-3.5">
                  {loading
                    ? otpSent
                      ? 'Verifying...'
                      : 'Sending code...'
                    : otpSent
                      ? 'Verify & sign in'
                      : 'Send login code'}
                </button>

                {otpSent ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setInfo('');
                      setError('');
                    }}
                    className="mt-3 w-full text-sm text-slate-400 hover:text-white"
                  >
                    Use a different email
                  </button>
                ) : null}
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="mt-6">
                <label className="block text-sm font-medium text-slate-300">
                  Email or username
                  <input
                    className="input-field mt-2"
                    type="text"
                    placeholder="you@example.com or username"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoCapitalize="none"
                    required
                  />
                </label>
                <label className="mt-5 block text-sm font-medium text-slate-300">
                  Password
                  <div className="relative mt-2">
                    <input
                      className="input-field w-full pr-12"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-sky-400"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary mt-8 w-full py-3.5">
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-400">
              Need access?{' '}
              <Link href="/join" className="font-medium text-sky-400 hover:underline">
                Request shipper / carrier
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
