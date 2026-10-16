import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Brush, Check, CircleUserRound, Eye, EyeOff, FileText, LockKeyhole, Mail, Music2, PencilLine, ShieldCheck, Sparkles, Upload, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './AuthPage.css'

type AuthMode = 'login' | 'signup'
const roles = [
  ['PAINTER', 'Painter'], ['SINGER', 'Singer'], ['WRITER', 'Writer'], ['POET', 'Poet'],
  ['DANCER', 'Dancer'], ['INSTRUMENTALIST', 'Instrumentalist / musician'], ['CHRONICLER', 'Chronicler'],
]

function fileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.readAsDataURL(file)
  })
}

export function AuthPage() {
  const { signInWithPassword, register } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const [role, setRole] = useState('PAINTER')
  const [instruments, setInstruments] = useState('')
  const [bio, setBio] = useState('')
  const [artStyle, setArtStyle] = useState('')
  const [backstory, setBackstory] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarName, setAvatarName] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const selectAvatar = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choose an image file for your profile picture.'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Profile images must be smaller than 2 MB.'); return }
    try { setAvatar(await fileAsDataUrl(file)); setAvatarName(file.name); setError('') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not read this image.') }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!termsAccepted) { setError('Please accept the Terms and Privacy Policy to continue.'); return }
    setBusy(true)
    try {
      if (mode === 'login') await signInWithPassword(email, password)
      else await register({
        email, password, displayName: fullName, pseudonym, role,
        instruments: role === 'INSTRUMENTALIST' ? instruments.split(',').map(item => item.trim()).filter(Boolean) : [],
        bio, artStyle, backstory, contactInfo,
        avatarUrl: avatar || undefined,
        acceptedTerms: true,
      })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not sign you in. Please try again.')
    } finally { setBusy(false) }
  }

  return <main className="auth-screen">
    <section className="auth-story" aria-label="About Commonroom">
      <a className="auth-brand" href="#welcome"><span className="brand-flower">✳</span> commonroom</a>
      <div className="story-content">
        <span className="auth-kicker"><Sparkles size={14}/> A LITTLE ROOM FOR A LOT OF IMAGINATION</span>
        <h1>Make things.<br/>Find your <em>people.</em></h1>
        <p>A home for the things you make, the ideas you’re still growing, and the people who get it.</p>
        <div className="story-artists"><div className="artist-stack"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=90"/><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=90"/><img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=90"/></div><span><b>A softer corner of the internet.</b><small>Made for every kind of maker.</small></span></div>
      </div>
      <div className="story-footer">ARTISTS, MUSICIANS, WORD PEOPLE, AND THE REST OF US <span>✳</span></div>
      <div className="story-sun">✳</div><div className="story-orbit"/>
    </section>
    <section className="auth-panel" id="welcome">
      <div className="auth-panel-top"><span>YOUR CREATIVE CORNER</span><span><ShieldCheck size={14}/> A kind place to land</span></div>
      <div className="auth-card">
        <div className="auth-mobile-brand"><span>✳</span> commonroom</div>
        <div className="auth-heading"><span className="auth-mark"><Brush size={18}/></span><p className="auth-kicker">{mode === 'login' ? 'GOOD TO HAVE YOU BACK' : 'PULL UP A CHAIR'}</p><h2>{mode === 'login' ? <>Welcome back,<br/><em>maker.</em></> : <>Find your<br/><em>creative people.</em></>}</h2><p className="auth-description">{mode === 'login' ? 'Pick up right where your imagination left off.' : 'Make a little space for yourself and what you make.'}</p></div>
        <div className="auth-switch" role="tablist" aria-label="Authentication"><button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button><button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setError('') }}>Sign up</button></div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && <>
            <div className="avatar-upload-wrap"><button type="button" className={`avatar-upload ${avatar ? 'has-avatar' : ''}`} onClick={() => fileRef.current?.click()} aria-label="Upload profile picture">{avatar ? <img src={avatar} alt="Selected profile"/> : <><Upload size={19}/><span>ADD PHOTO</span></>}</button><input ref={fileRef} className="visually-hidden" type="file" accept="image/*" onChange={event => selectAvatar(event.target.files?.[0])}/><span><b>Profile picture</b><small>{avatarName || 'A face, a painting, a tiny self-portrait.'}</small></span></div>
            <label className="auth-label">FULL NAME<div className="auth-input"><UserRound size={16}/><input autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} placeholder="The name your people know" required/></div></label>
            <label className="auth-label">ARTISTIC PSEUDONYM<div className="auth-input"><Sparkles size={16}/><input autoComplete="nickname" value={pseudonym} onChange={event => setPseudonym(event.target.value)} placeholder="Your unreal name" required/></div></label>
            <label className="auth-label">I MAKE<div className="auth-input select-input"><Brush size={16}/><select value={role} onChange={event => setRole(event.target.value)}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></label>
            {role === 'INSTRUMENTALIST' && <label className="auth-label">INSTRUMENTS<div className="auth-input"><Music2 size={16}/><input value={instruments} onChange={event => setInstruments(event.target.value)} placeholder="Violin, guitar, piano..."/></div><small className="field-hint">Separate instruments with commas.</small></label>}
            <label className="auth-label">A LITTLE ABOUT ME<div className="auth-input auth-textarea"><PencilLine size={16}/><textarea value={bio} onChange={event => setBio(event.target.value)} placeholder="The things that make you, you..." maxLength={2000}/></div></label>
            <label className="auth-label">ART STYLE<div className="auth-input"><Brush size={16}/><input value={artStyle} onChange={event => setArtStyle(event.target.value)} placeholder="Soft surrealism, folk, jazz..."/></div></label>
            <label className="auth-label">MY BACKGROUND<div className="auth-input auth-textarea"><FileText size={16}/><textarea value={backstory} onChange={event => setBackstory(event.target.value)} placeholder="How did you find your way to making?" maxLength={5000}/></div></label>
            <label className="auth-label">CONTACT INFO<div className="auth-input"><Mail size={16}/><input value={contactInfo} onChange={event => setContactInfo(event.target.value)} placeholder="A public email or link"/></div></label>
          </>}
          <label className="auth-label">EMAIL ADDRESS<div className="auth-input"><CircleUserRound size={16}/><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required/></div></label>
          <label className="auth-label">PASSWORD<div className="auth-input"><LockKeyhole size={16}/><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'signup' ? 10 : 1} value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === 'signup' ? 'At least 10 characters' : 'Your password'} required/><button type="button" className="reveal-password" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
          <label className="terms-check"><input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)}/><span className="custom-check"><Check size={12}/></span><span>I agree to the <a href="#terms" onClick={event => event.preventDefault()}>Terms</a> and <a href="#privacy" onClick={event => event.preventDefault()}>Privacy Policy</a>.</span></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'One moment...' : mode === 'login' ? 'Sign in to your page' : 'Create my artist page'}<ArrowRight size={17}/></button>
        </form>
        <p className="auth-smallprint">A place to share the work, the wonder, and the works in progress.</p>
      </div>
      <footer className="auth-panel-footer">© COMMONROOM <span>MADE WITH A LITTLE HEART <i>✳</i></span></footer>
    </section>
  </main>
}
