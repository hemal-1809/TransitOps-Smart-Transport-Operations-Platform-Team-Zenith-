/**
 * AUTHENTICATION & REGISTRATION TERMINAL COMPONENT
 */

import React, { useState, useEffect } from 'react';
import { useTransit } from '../context/TransitContext';
import { Shield, Key, Mail, Info, ArrowRight, Truck, User, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Authentication() {
  const { loginUser, setUserName } = useTransit();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('manager@transitops.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Fleet Manager');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initiating terminal handshakes...');

  const demoAccounts = [
    {
      role: 'Fleet Manager',
      email: 'manager@transitops.com',
      desc: 'Complete control of all systems, registries, financial audits, and analytical tools.',
      color: 'bg-[#edf2f6] text-[#1e2a33] border-[#ccd7e2]'
    },
    {
      role: 'Dispatcher',
      email: 'dispatcher@transitops.com',
      desc: 'Handles active trip dispatcher forms, vehicle availability state, and driver assignment.',
      color: 'bg-[#e5f3f0] text-[#112d26] border-[#c0dfd7]'
    },
    {
      role: 'Safety Officer',
      email: 'safety@transitops.com',
      desc: 'Monitors driver safety scores, license expirations, and active maintenance shops.',
      color: 'bg-[#f0f4e8] text-[#2b331f] border-[#d4dcc5]'
    },
    {
      role: 'Financial Analyst',
      email: 'finance@transitops.com',
      desc: 'Audits fuel logs, tallies operational costs, and tracks ROI charts.',
      color: 'bg-[#f5eef4] text-[#3d2438] border-[#e2cbdc]'
    }
  ];

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          const increment = Math.floor(Math.random() * 15) + 8;
          const nextVal = Math.min(prev + increment, 100);
          
          if (nextVal < 25) {
            setLoadingStatus('Authenticating credentials with backend gateway...');
          } else if (nextVal < 50) {
            setLoadingStatus('Decrypting security keys and role permissions...');
          } else if (nextVal < 75) {
            setLoadingStatus('Synchronizing local cache registries and financial sheets...');
          } else if (nextVal < 95) {
            setLoadingStatus('Handshaking with AI Advisor models...');
          } else {
            setLoadingStatus('Access authorized. Spawning control interface...');
          }
          return nextVal;
        });
      }, 180);
    } else {
      setLoadingProgress(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    if (loadingProgress === 100 && isLoading) {
      const finalizeAuth = setTimeout(() => {
        setIsLoading(false);
        if (isSignUp && name.trim()) {
          setUserName(name.trim());
          localStorage.setItem('transitops_username', name.trim());
        }
        
        let finalRole = selectedRole;
        if (!isSignUp) {
          if (email.includes('dispatcher')) finalRole = 'Dispatcher';
          else if (email.includes('safety')) finalRole = 'Safety Officer';
          else if (email.includes('finance')) finalRole = 'Financial Analyst';
          else if (email.includes('manager')) finalRole = 'Fleet Manager';
        }

        loginUser(email, finalRole);
      }, 400);
      return () => clearTimeout(finalizeAuth);
    }
  }, [loadingProgress, isLoading, isSignUp, name, email, selectedRole, loginUser, setUserName]);

  const handleDemoSelect = (account) => {
    if (isSignUp) {
      setIsSignUp(false);
    }
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword('secret_token_123');
    setError('');
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }
    setError('');
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStatus('Initiating terminal handshakes...');
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All profile fields are required for operational sign up.');
      return;
    }
    setError('');
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStatus('Initiating terminal handshakes...');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#f3f7f2] text-[#1c221e] antialiased">
        <div className="w-full max-w-md p-8 bg-white border border-[#e2ede4] rounded-[32px] shadow-[0_12px_40px_rgba(28,34,30,0.05)] text-center space-y-6 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#edf3ed]" />
            <div 
              className="absolute inset-0 rounded-full border-4 border-[#8ac959] border-t-transparent animate-spin" 
              style={{ animationDuration: '1s' }}
            />
            <div className="text-xs font-mono font-bold text-[#8ac959]">
              {loadingProgress}%
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-extrabold text-lg text-[#1c221e]">
              Securing Operational Terminal
            </h3>
            <p className="text-xs text-[#627267] font-mono font-bold uppercase tracking-wider animate-pulse min-h-[1.5rem]">
              {loadingStatus}
            </p>
          </div>

          <div className="w-full bg-[#edf3ed] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#8ac959] to-[#78b34c] h-full transition-all duration-200 ease-out rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <div className="text-[10px] font-mono text-[#7d93a6] pt-2 border-t border-[#f3f7f2]">
            SECURITY HANDSHAKE PROTOCOL TLS 1.3 // TRANSIT_OPS_SECURE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#f3f7f2] text-[#1c221e] overflow-hidden antialiased">
      <motion.div
        initial={false}
        animate={{ 
          width: isSignUp ? '0%' : '45%', 
          opacity: isSignUp ? 0 : 1,
          borderRightWidth: isSignUp ? '0px' : '1px'
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 140 }}
        className="hidden md:flex bg-[#edf3ed] flex-col justify-between overflow-y-auto border-[#e2ede4] shrink-0 h-full"
        style={{ overflow: 'hidden' }}
      >
        <div className="p-8 flex flex-col justify-between h-full min-w-[380px] md:w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1c221e] flex items-center justify-center shadow-sm">
              <Truck className="w-5.5 h-5.5 text-[#a7e274] stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-2xl tracking-tight text-[#1c221e]">
                Transit<span className="text-[#8ac959]">Ops</span>
              </h1>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#627267]">
                Smart Transport Operations Platform
              </p>
            </div>
          </div>

          <div className="my-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold tracking-tight text-[#1c221e]">
                One-Click Quick Login Roles
              </h2>
              <p className="text-sm text-[#526357] mt-1 font-medium">
                Select an operator profile below to automatically pre-fill the authentication system and inspect its specific RBAC credentials:
              </p>
            </div>

            <div className="space-y-3.5">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleDemoSelect(account)}
                  className={`w-full text-left p-4 rounded-[18px] border transition-all duration-200 flex flex-col gap-1 cursor-pointer ${
                    !isSignUp && selectedRole === account.role
                      ? 'bg-white border-[#8ac959] ring-2 ring-[#8ac959]/20 shadow-md translate-x-1'
                      : 'bg-white/75 border-[#e2ede4] hover:bg-white hover:border-[#8ac959]/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm tracking-tight text-[#1c221e]">{account.role}</span>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-bold font-mono ${account.color}`}>
                      Prefill Active
                    </span>
                  </div>
                  <p className="text-xs text-[#526357] leading-normal font-medium mt-1">{account.desc}</p>
                  <span className="text-[10px] font-mono font-bold text-[#627267] mt-1.5 select-all bg-[#f3f7f2] px-2.5 py-0.5 rounded-full w-fit">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#e2ede4] pt-4 text-xs text-[#627267] font-semibold flex items-center justify-between">
            <span>TransitOps v1.2.0</span>
            <span>© 2026 Fleet Systems Inc.</span>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 bg-white p-8 flex flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#f3f7f2] pb-4">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`pb-2 text-sm font-extrabold tracking-tight transition-all relative cursor-pointer ${
                !isSignUp ? 'text-[#1c221e]' : 'text-[#7d93a6] hover:text-[#1c221e]'
              }`}
            >
              Sign In
              {!isSignUp && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8ac959] rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`pb-2 text-sm font-extrabold tracking-tight transition-all relative cursor-pointer ${
                isSignUp ? 'text-[#1c221e]' : 'text-[#7d93a6] hover:text-[#1c221e]'
              }`}
            >
              Sign Up
              {isSignUp && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8ac959] rounded-full" />
              )}
            </button>
          </div>

          <div>
            <div className="w-12 h-12 rounded-full bg-[#f3f7f2] flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#8ac959]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1c221e]">
              {isSignUp ? 'Sign Up for Operational Profile' : 'Sign in to TransitOps Terminal'}
            </h2>
            <p className="text-sm text-[#526357] mt-1 font-medium">
              {isSignUp 
                ? 'Register your profile to access custom role credentials.' 
                : 'Please authenticate below to load your custom administrative clearance.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isSignUp ? (
              <motion.form 
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSignInSubmit} 
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    OPERATIONAL EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#627267]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959] transition-all"
                      placeholder="name@transitops.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                      SECURITY KEY / PASSWORD
                    </label>
                    <a href="#forgot" className="text-[11px] text-[#8ac959] font-bold hover:underline" onClick={(e) => e.preventDefault()}>
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-[#627267]" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-[#526357] font-semibold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#f3f7f2] border-[#e2ede4] text-[#8ac959] focus:ring-0 cursor-pointer"
                    />
                    <span>Remember session</span>
                  </label>

                  <div className="text-xs text-[#627267] font-bold">
                    Role: <span className="text-[#8ac959] font-extrabold">{selectedRole}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-5 bg-[#1c221e] hover:bg-[#2b352e] text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md shadow-[#1c221e]/10 active:scale-[0.98]"
                >
                  <span>Sign In as {selectedRole}</span>
                  <ArrowRight className="w-4 h-4 text-[#a7e274]" />
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSignUpSubmit} 
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    FULL OPERATOR NAME
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#627267]" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959] transition-all"
                      placeholder="Alex Mercer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    OPERATIONAL EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#627267]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959] transition-all"
                      placeholder="name@transitops.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    SECURITY PASS KEY
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-[#627267]" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    ASSIGN CORE OPERATIONAL ROLE
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`py-2 px-3 text-left rounded-xl border text-xs font-bold transition-all ${
                          selectedRole === role
                            ? 'bg-[#1c221e] border-[#1c221e] text-white shadow-sm'
                            : 'bg-[#f3f7f2] border-[#e2ede4] text-[#1c221e] hover:bg-white hover:border-[#8ac959]'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-5 bg-[#8ac959] hover:bg-[#78b34c] text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <span>Sign Up & Access Terminal</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="p-4 rounded-[18px] bg-[#f3f7f2] border border-[#e2ede4] flex gap-3">
            <Shield className="w-5 h-5 text-[#8ac959] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-[#526357] font-medium">
              <p className="font-extrabold text-[#1c221e] mb-1">TransitOps Security Sandbox</p>
              This application utilizes local in-memory storage to persist state. Selecting any pre-fill ID on the left automatically updates the system layout with the respective role clearance permission matrix!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
