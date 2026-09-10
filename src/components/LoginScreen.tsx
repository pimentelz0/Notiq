import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: (email?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          // Provide friendly message in Portuguese
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('E-mail ou senha incorretos.');
          } else if (error.message.includes('Email not confirmed')) {
            setErrorMessage('E-mail ainda não confirmado no Supabase.');
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.session || data.user) {
          onLoginSuccess(data.user?.email || cleanEmail);
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          // Auto logged in
          onLoginSuccess(data.user?.email || cleanEmail);
        } else if (data.user) {
          setSuccessMessage('Conta criada! Você já pode entrar.');
          setMode('signin');
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-[#1C1917] flex flex-col items-center justify-center p-4 selection:bg-[#E7E5E4] selection:text-[#1C1917]">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-[0.24em] text-[#1C1917] font-times uppercase select-none">
            NOTIQ
          </h1>
          <p className="text-xs text-[#78716C] font-times mt-1.5 tracking-wide">
            {mode === 'signin' ? 'Entrar no bloco compartilhado' : 'Criar nova conta de acesso'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-7 shadow-xs">
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] font-times">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] font-times">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label 
                htmlFor="login-email"
                className="block text-xs text-[#78716C] mb-1 font-times tracking-wide"
              >
                E-mail
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm text-[#1C1917] bg-[#FAF9F8] border border-[#E7E5E4] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1C1917] transition font-times"
                />
                <Mail className="w-3.5 h-3.5 text-[#A8A29E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="login-password"
                className="block text-xs text-[#78716C] mb-1 font-times tracking-wide"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm text-[#1C1917] bg-[#FAF9F8] border border-[#E7E5E4] rounded-lg px-3 py-2 pr-9 focus:outline-none focus:border-[#1C1917] transition font-times"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#A8A29E] hover:text-[#1C1917] transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] active:scale-[0.99] text-xs font-normal text-[#F9F9F8] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Acessando...</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Entrar' : 'Cadastrar e Entrar'}</span>
              )}
            </button>
          </form>

          {/* Toggle Signin / Signup */}
          <div className="mt-5 pt-4 border-t border-[#F5F5F4] text-center">
            {mode === 'signin' ? (
              <p className="text-xs text-[#78716C] font-times">
                Não possui conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#1C1917] underline hover:text-[#44403C] transition cursor-pointer"
                >
                  Criar conta
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#78716C] font-times">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#1C1917] underline hover:text-[#44403C] transition cursor-pointer"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-[#A8A29E] text-center mt-6 font-times">
          Sincronização instantânea e privada.
        </p>
      </div>
    </div>
  );
};
