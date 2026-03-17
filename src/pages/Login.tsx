import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { Receipt, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { user, loading, login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { email, password, name } : { email, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-stone-50 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-sm">
            <Receipt className="h-6 w-6 text-stone-900" />
          </div>
        </div>
        
        <Card className="border-stone-200/60 shadow-xl shadow-stone-200/50 bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-3xl font-bold font-heading">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-base">
              {isRegister ? 'Sign up to manage deployments and expenses' : 'Sign in to your account to manage deployments and expenses'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              
              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-md border border-stone-200 bg-white"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-md border border-stone-200 bg-white"
                  placeholder="name@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-md border border-stone-200 bg-white"
                  placeholder="••••••••"
                />
              </div>
              
              <Button type="submit" className="w-full h-12 text-base mt-6" size="lg" disabled={isLoading}>
                {isLoading ? 'Please wait...' : (isRegister ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-stone-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsRegister(!isRegister)} 
                className="text-stone-900 font-medium hover:underline"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
