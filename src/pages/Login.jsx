import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // Mock network delay
      await login(email, password);
      const role = email.includes('teacher') ? 'teacher' : 'student';
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (error) {
      console.error(error);
      alert('Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-[hsl(var(--color-bg))]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
           <h2 className="text-4xl font-extrabold text-[hsl(var(--color-primary))] tracking-tighter mb-6">QueryQuill</h2>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
           <p className="text-gray-500 mt-2">Continue your learning journey</p>
           <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg inline-block text-left">
             <p className="font-bold mb-1">Test Credentials:</p>
             <p>Student: student@test.com / password</p>
             <p>Teacher: teacher@test.com / password</p>
           </div>
        </div>

        <Card className="p-8 shadow-xl shadow-indigo-100/50 border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <span className="text-sm font-medium text-[hsl(var(--color-primary))] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <div className="pt-2">
              <Button loading={loading} className="w-full justify-center text-base py-2.5">
                Sign In <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center bg-gray-50 p-4 rounded-lg">
             <span className="text-gray-600 text-sm">Don't have an account? </span>
             <Link to="/signup" className="text-[hsl(var(--color-primary))] font-semibold hover:underline text-sm ml-1">
               Create Account
             </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
