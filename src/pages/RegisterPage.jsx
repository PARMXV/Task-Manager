// RegisterPage – account creation with premium design matching LoginPage
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function Field({ id, label, icon: Icon, type, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {label}
            </label>
            <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                    id={id} type={type} value={value} onChange={onChange}
                    required placeholder={placeholder}
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.target.style.border = '1px solid var(--accent)'}
                    onBlur={e => e.target.style.border = '1px solid var(--border)'}
                />
            </div>
        </div>
    );
}

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
        if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return; }
        if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
        setLoading(true);
        try {
            await register(email, password, name);
            navigate('/dashboard');
            toast.success('¡Cuenta creada! Bienvenido 🎉');
        } catch (err) {
            toast.error(err.code === 'auth/email-already-in-use' ? 'Este email ya está registrado' : 'Error al crear cuenta');
        } finally { setLoading(false); }
    }

    async function handleGoogle() {
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
            toast.success('¡Cuenta creada con Google! 🚀');
        } catch (err) {
            if (!err.message?.includes('cancel')) toast.error('Error con Google Sign-In');
        } finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            {/* Ambient orbs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="float-orb-slow absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
                <div className="float-orb absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
            </div>

            <div className="relative w-full max-w-[400px] fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-4 ring-pulse">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Crear cuenta</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Empieza a gestionar tus tareas hoy</p>
                </div>

                <div className="glass rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field id="reg-name" label="Nombre" icon={User} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
                        <Field id="reg-email" label="Email" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
                        <Field id="reg-password" label="Contraseña" icon={Lock} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                        <Field id="reg-confirm" label="Confirmar contraseña" icon={Lock} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" />

                        <button
                            type="submit" disabled={loading} id="reg-submit"
                            className="glow-btn w-full py-3 mt-2 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {loading ? <span className="spinner" /> : null}
                            {loading ? 'Creando cuenta…' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>o regístrate con</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    <button
                        onClick={handleGoogle} disabled={loading} id="reg-google"
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--bg-hover)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-semibold" style={{ color: 'var(--accent-2)' }}>
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
