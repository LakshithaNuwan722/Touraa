import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { toast } from 'sonner';
import { useAuth } from 'context/AuthContext';
import { countryCodes } from 'constants/countryCodes';

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+94');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Redirect if already logged in
  if (user) {
    if (user.role === 'admin' || user.email === 'admin@touraa.com') {
      window.location.href = 'http://localhost:3001/admin';
    } else {
      navigate('/dashboard');
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const loggedUser = await login(formData.email, formData.password);
        toast.success('Welcome back!');
        
        if (loggedUser.role === 'admin' || loggedUser.email === 'admin@touraa.com') {
          window.location.href = 'http://localhost:3001/admin';
          return;
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-Z\s]+$/;

        if (!formData.name || !formData.phone || !formData.email || !formData.password) {
          toast.error('Please fill in all fields');
          setLoading(false);
          return;
        }

        if (!nameRegex.test(formData.name)) {
          toast.error('Full name can only contain letters and spaces');
          setLoading(false);
          return;
        }

        if (!emailRegex.test(formData.email)) {
          toast.error('Please enter a valid email address');
          setLoading(false);
          return;
        }

        const cleanPhone = formData.phone.replace(/\s/g, '');
        const digits = cleanPhone.replace(/^0/, '');
        const fullPhone = `${countryCode}${digits}`;
        const totalDigits = fullPhone.replace('+', '').length;

        if (totalDigits < 8 || totalDigits > 15) {
          toast.error('Total phone digits (including country code) must be between 8 and 15');
          setLoading(false);
          return;
        }

        await register(formData.name, formData.email, formData.password, fullPhone);
        toast.success('Account created successfully!');
      }

      const from = location.state?.from || '/dashboard';
      navigate(from);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12" data-testid="auth-page">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-black/5 shadow-[0_20px_50px_rgb(0,0,0,0.1)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1A4D2E] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="font-serif text-3xl font-medium text-[#1A4D2E]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? 'Sign in to manage your bookings'
                : 'Join us to book your Sri Lankan adventure'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-12"
                  data-testid="name-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="h-12"
                required
                data-testid="email-input"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone (WhatsApp)
                </Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[110px] h-12">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                    placeholder="77 123 4567"
                    className="h-12 flex-1"
                    data-testid="phone-input"
                    maxLength={20}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="h-12 pr-12"
                  required
                  data-testid="password-input"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-xl text-lg font-semibold"
              data-testid="submit-auth-btn"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                className="ml-2 text-[#1A4D2E] font-semibold hover:underline"
                onClick={() => setIsLogin(!isLogin)}
                data-testid="toggle-auth-btn"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Why create an account?</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Track Bookings', 'Faster Checkout', 'Special Offers'].map((benefit) => (
              <span
                key={benefit}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-[#1A4D2E] border border-black/5"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
