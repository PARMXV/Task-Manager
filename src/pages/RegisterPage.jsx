// RegisterPage – new user signup with email, display name and password
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirm) { toast.error('Passwords do not match'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register(email, password, name);
            navigate('/dashboard');
            toast.success('Account created! Let\'s get productive 🎉');
        } catch (err) {
            toast.error(err.message.includes('already-in-use') ? 'Email already registered' : 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
            toast.success('Signed up with Google! 🚀');
        } catch (err) {
            if (!err.message.includes('cancelled')) toast.error('Google sign-in failed');
        } finally {
            setLoading(false);
        }
    }

    const Field = ({ id, label, icon: Icon, type, value, onChange, placeholder }) => (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    id={id} type={type} value={value} onChange={onChange}
                    required placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4">
                        <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create account</h1>
                    <p className="text-slate-400 mt-1">Start managing tasks like a pro</p>
                </div>

                <div className="glass rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field id="reg-name" label="Display Name" icon={User} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                        <Field id="reg-email" label="Email" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                        <Field id="reg-password" label="Password" icon={Lock} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                        <Field id="reg-confirm" label="Confirm Password" icon={Lock} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />

                        <button
                            type="submit" disabled={loading} id="reg-submit"
                            className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <hr className="flex-1 border-slate-700" /><span className="text-xs text-slate-500">or</span><hr className="flex-1 border-slate-700" />
                    </div>

                    <button
                        onClick={handleGoogle} disabled={loading} id="reg-google"
                        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all text-sm font-medium"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
