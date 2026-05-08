import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';
import api from '../../lib/api';

function validateName(name) {
  if (!name) return 'Nome completo é obrigatório';
  if (name.trim().split(/\s+/).length < 2) return 'Informe o nome completo (nome e sobrenome)';
  return '';
}

function validateEmail(email) {
  if (!email) return 'E-mail é obrigatório';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail inválido';
  return '';
}

function validatePassword(password) {
  if (!password) return 'Senha é obrigatória';
  if (password.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
  if (!/\d/.test(password)) return 'Senha deve conter pelo menos um número';
  if (!/[A-Z]/.test(password)) return 'Senha deve conter pelo menos uma letra maiúscula';
  return '';
}

function validateConfirmPassword(confirm, password) {
  if (!confirm) return 'Confirmação de senha é obrigatória';
  if (confirm !== password) return 'As senhas não coincidem';
  return '';
}

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
  if (score <= 3) return { level: 3, label: 'Média', color: 'bg-yellow-500' };
  return { level: 6, label: 'Forte', color: 'bg-green-500' };
}

function PasswordStrengthIndicator({ password }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const bars = Array.from({ length: 6 }, (_, i) => i < strength.level);

  return (
    <div className="mt-2">
      <div className="flex gap-0.5 mb-1 font-mono text-xs tracking-wider">
        <span className={`transition-colors ${strength.level >= 1 ? strength.color : 'bg-gray-200 dark:bg-gray-700'} rounded-sm px-1`}>█</span>
        <span className={`transition-colors ${strength.level >= 2 ? strength.color : 'bg-gray-200 dark:bg-gray-700'} rounded-sm px-1`}>█</span>
        <span className={`transition-colors ${strength.level >= 3 ? strength.color : 'bg-gray-200 dark:bg-gray-700'} rounded-sm px-1`}>█</span>
        <span className={`transition-colors ${strength.level >= 4 ? strength.color : 'bg-gray-200 dark:bg-gray-700'} rounded-sm px-1`}>█</span>
        <span className={`transition-colors ${strength.level >= 5 ? strength.color : 'bg-gray-200 dark:bg-gray-700'} rounded-sm px-1`}>█</span>
        <span className={`transition-colors ${strength.level >= 6 ? strength.color : 'bg-gray-200 dark:bg-gray-700'} rounded-sm px-1`}>█</span>
      </div>
      <p className={`text-xs ${strength.level <= 2 ? 'text-red-500' : strength.level <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
        {strength.label}
      </p>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('CANDIDATE');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlur = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setTouched((prev) => ({ ...prev, [field]: true }));
    let err = '';
    switch (field) {
      case 'name':
        err = validateName(value);
        break;
      case 'email':
        err = validateEmail(value);
        break;
      case 'password':
        err = validatePassword(value);
        break;
      case 'confirmPassword':
        err = validateConfirmPassword(value, password);
        break;
      case 'acceptTerms':
        if (!value) err = 'Você deve aceitar os termos de uso';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'acceptTerms':
        setAcceptTerms(value);
        break;
      default:
        break;
    }
    if (touched[field]) {
      let err = '';
      switch (field) {
        case 'name':
          err = validateName(value);
          break;
        case 'email':
          err = validateEmail(value);
          break;
        case 'password':
          err = validatePassword(value);
          break;
        case 'confirmPassword':
          err = validateConfirmPassword(value, password);
          break;
        case 'acceptTerms':
          if (!value) err = 'Você deve aceitar os termos de uso';
          break;
        default:
          break;
      }
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);
    const termsErr = acceptTerms ? '' : 'Você deve aceitar os termos de uso';

    setErrors({
      name: nameErr,
      email: emailErr,
      password: passErr,
      confirmPassword: confirmErr,
      acceptTerms: termsErr,
    });
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    });

    if (nameErr || emailErr || passErr || confirmErr || termsErr) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        role: accountType,
      });
      setUser(data.user, data.token);
      toast.success('Conta criada com sucesso', 'Bem-vindo ao JobPortal!');
      navigate('/');
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          email: 'Uma conta com este e-mail já existe',
        }));
      } else {
        const msg = err.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
        setGlobalError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H6m8 0h2a2 2 0 012 2v6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">JobPortal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Crie sua conta</h2>
            <p className="text-gray-500 mt-2">Junte-se a mais de 50 mil profissionais</p>
          </div>

          {globalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3" role="alert">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm">{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name" className="label">Nome completo</label>
              <input
                id="name"
                type="text"
                className="input-field"
                value={name}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                autoComplete="name"
              />
              {touched.name && errors.name && (
                <p id="name-error" className="form-error" role="alert">{errors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="label">E-mail</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {touched.email && errors.email && (
                <p id="email-error" className="form-error" role="alert">{errors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">Senha</label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                aria-invalid={touched.password && !!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="new-password"
              />
              {touched.password && errors.password && (
                <p id="password-error" className="form-error" role="alert">{errors.password}</p>
              )}
              <PasswordStrengthIndicator password={password} />
              <p className="form-hint">Mínimo 8 caracteres, 1 número e 1 letra maiúscula</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="label">Confirmar senha</label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                autoComplete="new-password"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p id="confirm-error" className="form-error" role="alert">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="form-group">
              <span className="label block mb-3">Tipo de conta</span>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="accountType"
                    value="CANDIDATE"
                    checked={accountType === 'CANDIDATE'}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="radio-field"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Estou buscando emprego</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="accountType"
                    value="RECRUITER"
                    checked={accountType === 'RECRUITER'}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="radio-field"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Estou contratando</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={handleChange('acceptTerms')}
                  onBlur={handleBlur('acceptTerms')}
                  className="checkbox-field mt-0.5"
                  aria-invalid={touched.acceptTerms && !!errors.acceptTerms}
                  aria-describedby={errors.acceptTerms ? 'terms-error' : undefined}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Li e aceito os <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">Termos de Uso</a> e a <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Política de Privacidade</a>
                </span>
              </label>
              {touched.acceptTerms && errors.acceptTerms && (
                <p id="terms-error" className="form-error" role="alert">{errors.acceptTerms}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando conta...
                </span>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entre aqui
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-bl from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden flex-col justify-between p-12">
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-register" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-register)" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-800">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H6m8 0h2a2 2 0 012 2v6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold">JobPortal</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Comece sua jornada hoje</h1>
          <p className="text-primary-100 text-lg">Crie sua conta e descubra oportunidades ilimitadas</p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-white">10k+</div>
            <div className="text-primary-200 text-sm">Vagas ativas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">5k+</div>
            <div className="text-primary-200 text-sm">Empresas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">50k+</div>
            <div className="text-primary-200 text-sm">Candidatos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
