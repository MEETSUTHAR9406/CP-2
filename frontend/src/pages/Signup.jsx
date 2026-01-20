import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import { Check, X, Shield, BookOpen, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const p = formData.password;
    let s = 0;
    if (p.length > 5) s++;
    if (p.length > 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    setPasswordStrength(s);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Name Validation (Letters only)
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      setErrors({ form: "Name must contain only letters." });
      return;
    }

    if (formData.password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000)); // Mock API
      signup(formData);
      navigate(formData.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (err) {
      setErrors({ form: "Signup failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-[hsl(var(--color-bg))]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-[hsl(var(--color-primary))] tracking-tighter mb-6">QueryQuill</h2>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-2">Join thousands of learners today</p>
        </div>

        <Card className="p-8 shadow-xl shadow-indigo-100/50 border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Pills */}
            <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={clsx(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                  formData.role === 'student' ? "bg-white text-[hsl(var(--color-primary))] shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <BookOpen size={16} /> Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'teacher' })}
                className={clsx(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                  formData.role === 'teacher' ? "bg-white text-[hsl(var(--color-primary))] shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Shield size={16} /> Teacher
              </button>
            </div>

            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="John Doe"
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="you@example.com"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                required
                placeholder="Create a strong password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="flex gap-1 h-1.5 mt-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={clsx(
                      "flex-1 rounded-full transition-all duration-300", 
                      i < passwordStrength 
                        ? (passwordStrength < 2 ? "bg-red-500" : passwordStrength < 3 ? "bg-yellow-500" : "bg-green-500") 
                        : "bg-gray-200"
                    )} 
                  />
                ))}
              </div>
            )}

            <div className="pt-2">
              {errors.form && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <X size={16} /> {errors.form}
                </div>
              )}
              <Button loading={loading} className="w-full justify-center text-base py-2.5">
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
             <span className="text-gray-600 text-sm">Already have an account? </span>
             <Link to="/login" className="text-[hsl(var(--color-primary))] font-semibold hover:underline text-sm ml-1">
               Sign In
             </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
