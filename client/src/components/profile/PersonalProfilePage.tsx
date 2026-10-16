import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowLeftRight, AudioLines, BookOpen, Brush, Check, ChevronRight, CircleHelp, FileText, Heart, LogOut, Mail, Music2, PencilLine, Play, ShoppingBag, Sparkles, UserRound, Video, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import { CreateArtworkModal } from './CreateArtworkModal'
import { TradeProposalModal } from '../trading/TradeProposalModal'
import './PersonalProfilePage.css'

type ProfileTab = 'PAINTING' | 'MUSIC' | 'DANCE' | 'WRITING' | 'CHRONICLE' | 'MARKETPLACE'
interface Listing { id: string; category: string; priceCents: number | null; currency: string; isActive: boolean; isTradeable: boolean }
interface Artwork {
  id: string; title: string; description: string | null; type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'TEXT'; category: ProfileTab | 'PHOTOGRAPHY' | 'OTHER'; mediaUrl: string; thumbnailUrl: string | null; createdAt: string;
  listing: Listing | null; creatorId: string; creator?: { pseudonym: string }; _count?: { likes: number; comments: number }
}

const tabInfo: { id: ProfileTab; label: string; sub: string; icon: typeof Brush }[] = [
  { id: 'PAINTING', label: 'Paintings & Fine Art', sub: 'GALLERY', icon: Brush },
  { id: 'MUSIC', label: 'Music & Audio', sub: 'LISTEN', icon: Music2 },
  { id: 'DANCE', label: 'Dance & Performance', sub: 'WATCH', icon: Video },
  { id: 'WRITING', label: 'Literature & Poetry', sub: 'READ', icon: BookOpen },
  { id: 'CHRONICLE', label: 'World Art & Chronicles', sub: 'EXPLORE', icon: FileText },
  { id: 'MARKETPLACE', label: 'Marketplace', sub: 'COLLECT', icon: ShoppingBag },
]
const avatarFallback = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'

export function PersonalProfilePage() {
  const { artist, signOut } = useAuth()
  const [tab, setTab] = useState<ProfileTab>('PAINTING')
  const [works, setWorks] = useState<Artwork[]>([])
  const [selected, setSelected] = useState<Artwork | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [tradeWork, setTradeWork] = useState<Artwork | null>(null)
  const [message, setMessage] = useState('')
  const [loadingWorks, setLoadingWorks] = useState(true)
  const [retryWorks, setRetryWorks] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!artist) return
    let active = true
    setLoadingWorks(true)
    apiRequest<{ artworks: Artwork[] }>(`/artworks?creatorId=${encodeURIComponent(artist.id)}`)
      .then(({ artworks }) => { if (active) setWorks(artworks) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Your gallery could not load.') })
      .finally(() => { if (active) setLoadingWorks(false) })
    return () => { active = false }
  }, [artist, retryWorks])

  const visibleWorks = useMemo(() => works.filter(work => tab === 'MARKETPLACE' ? Boolean(work.listing?.isActive) : work.category === tab || (tab === 'PAINTING' && work.category === 'PHOTOGRAPHY')), [works, tab])
  const toast = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(''), 3200) }
  if (!artist) return null

  const currentTab = tabInfo.find(item => item.id === tab)!
  const displayDate = (date: string) => new Date(date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const renderArtwork = (work: Artwork) => <button className={`artwork-card ${work.type.toLowerCase()}-card`} key={work.id} onClick={() => setSelected(work)}>
    {work.type === 'IMAGE' && <img className="artwork-cover" src={work.thumbnailUrl || work.mediaUrl} alt={work.title} />}
    {work.type === 'VIDEO' && <div className="video-cover"><video src={work.mediaUrl} preload="metadata" /><span><Play size={18} fill="currentColor" /></span></div>}
    {work.type === 'AUDIO' && <div className="audio-cover"><span className="audio-visual"><AudioLines size={32} /></span><small>AN AUDIO PIECE</small><strong>{work.title}</strong><span className="audio-play-icon"><Play size={16} fill="currentColor" /></span></div>}
    {work.type === 'TEXT' && <div className="text-cover"><span>✳ &nbsp; A PAGE FROM MY WORLD</span><strong>{work.title}</strong><p>{work.description}</p><small>READ A LITTLE MORE <ChevronRight size={12} /></small></div>}
    {work.listing?.isActive && work.listing.priceCents !== null && <span className="for-sale-badge"><ShoppingBag size={12} /> FOR SALE <b>${(work.listing.priceCents / 100).toFixed(2)}</b></span>}
    {work.listing?.isActive && work.listing.priceCents === null && work.listing.isTradeable && <span className="for-sale-badge"><ArrowLeftRight size={12} /> OPEN FOR TRADE</span>}
    <div className="artwork-meta"><span><b>{work.title}</b><small>{work.category.replaceAll('_', ' ')} · {displayDate(work.createdAt)}</small></span><ChevronRight size={16} /></div>
  </button>

  return <main className="profile-app">
    <header className="profile-topbar"><a className="profile-brand" href="#my-page"><span>✳</span> commonroom</a><div className="topbar-note">YOUR OWN LITTLE CORNER OF THE INTERNET <Sparkles size={13}/></div><button className="logout-button" onClick={signOut}><LogOut size={16}/><span>Sign out</span></button></header>
    <div className="profile-page-wrap">
      <div className="profile-welcome"><span>YOUR PERSONAL PAGE</span><span className="welcome-line"/><span>MADE WITH A LITTLE HEART <i>✳</i></span></div>
      <section className="personal-hero" id="my-page">
        <div className="hero-flower flower-one">✳</div><div className="hero-flower flower-two">✳</div>
        <div className="hero-overline"><span/><span>AN ARTIST, IN THEIR OWN WORDS</span><span/></div>
        <div className="personal-avatar-wrap"><img className="personal-avatar" src={artist.avatarUrl || avatarFallback} alt={`${artist.pseudonym} profile`}/><span className="avatar-presence"/></div>
        <h1>{artist.pseudonym}</h1><p className="personal-fullname">{artist.displayName}</p>
        <p className="personal-role">{artist.role.replaceAll('_', ' ')}{artist.instruments?.length ? ` · ${artist.instruments.join(' · ')}` : ''}</p>
        <button className="about-trigger" onClick={() => setAboutOpen(true)}><UserRound size={15}/> About me <ChevronRight size={14}/></button>
        <div className="profile-numbers"><span><b>{works.length}</b><small>works shared</small></span><i/><span><b>{artist._count?.followers ?? 0}</b><small>kindred spirits</small></span><i/><span><b>{artist._count?.following ?? 0}</b><small>you follow</small></span></div>
        <span className="hero-bottom-note">A WORK IN PROGRESS IS STILL A WORK WORTH SHARING.</span>
      </section>

      <section className="profile-art-section">
        <div className="art-section-heading"><div><span className="section-kicker"><Sparkles size={13}/> THE THINGS I MAKE</span><h2>A collection of <em>becoming.</em></h2><p>A little look around my creative world.</p></div><div className="profile-tools"><button className="share-profile" onClick={() => setCreateOpen(true)}><PencilLine size={15}/> Add a work</button><button className="copy-profile" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast('Your page link is copied.') }}><ArrowDownToLine size={15}/><span>Share my page</span></button></div></div>
        <div className="category-tabs" role="tablist" aria-label="Art categories">{tabInfo.map(item => { const TabIcon = item.icon; return <button role="tab" aria-selected={tab === item.id} className={`category-tab ${tab === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setTab(item.id)}><span className="tab-icon"><TabIcon size={17}/></span><span className="tab-label">{item.label}</span><small>{item.sub}</small></button> })}</div>
        <div className="gallery-heading"><div><span className="gallery-kicker">{currentTab.sub} <i>✳</i></span><h3>{currentTab.label}</h3></div><span className="work-count">{visibleWorks.length} {visibleWorks.length === 1 ? 'piece' : 'pieces'}</span></div>
        {error && <div className="gallery-state gallery-error"><CircleHelp size={19}/><span>{error}</span><button onClick={() => { setError(''); setRetryWorks(value => value + 1) }}>Try again</button></div>}
        {loadingWorks ? <div className="gallery-state"><span className="soft-spinner"/>Gathering your work...</div> : error ? null : visibleWorks.length === 0 ? <div className="empty-gallery"><span className="empty-flower">✳</span><span className="gallery-kicker">A LITTLE SPACE, JUST WAITING</span><h3>{tab === 'MARKETPLACE' ? 'Nothing listed for sale yet.' : 'Your next idea can live here.'}</h3><p>{tab === 'MARKETPLACE' ? 'When you list a work, it will find a home in this collection.' : 'This part of your gallery is waiting for the first thing you share.'}</p><button onClick={() => setCreateOpen(true)}>Add your first work <ChevronRight size={15}/></button></div> : <div className={`artwork-grid ${tab.toLowerCase()}`}>{visibleWorks.map(renderArtwork)}</div>}
      </section>
      <footer className="profile-footer"><span>KEEP MAKING ROOM FOR THE THINGS THAT MOVE YOU <i>✳</i></span><span>COMMONROOM · YOUR PERSONAL PAGE</span></footer>
    </div>
    {aboutOpen && <div className="profile-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setAboutOpen(false) }}><section className="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-title"><button className="modal-x" onClick={() => setAboutOpen(false)} aria-label="Close"><X size={19}/></button><span className="section-kicker"><Sparkles size={13}/> THE PERSON BEHIND THE WORK</span><div className="about-modal-avatar"><img src={artist.avatarUrl || avatarFallback} alt=""/></div><h2 id="about-title">A little about <em>{artist.pseudonym}.</em></h2><div className="about-facts"><div><span>ART FORM</span><b>{artist.role.replaceAll('_', ' ')}</b></div>{artist.instruments?.length ? <div><span>INSTRUMENTS</span><b>{artist.instruments.join(', ')}</b></div> : null}{artist.artStyle && <div><span>MY STYLE</span><b>{artist.artStyle}</b></div>}{artist.contactInfo && <div><span>SAY HELLO</span><b><Mail size={14}/>{artist.contactInfo}</b></div>}</div><div className="about-story"><span>MY STORY</span><p>{artist.bio || 'I’m finding my way through making things, one small idea at a time.'}</p>{artist.backstory && <p>{artist.backstory}</p>}</div><button className="about-done" onClick={() => setAboutOpen(false)}>Back to my page <ChevronRight size={16}/></button></section></div>}
    {selected && <div className="profile-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}><section className="art-detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="modal-x" onClick={() => setSelected(null)} aria-label="Close"><X size={19}/></button><div className="detail-art">{selected.type === 'IMAGE' ? <img src={selected.mediaUrl} alt={selected.title}/> : selected.type === 'VIDEO' ? <video src={selected.mediaUrl} controls/> : selected.type === 'AUDIO' ? <div className="detail-audio"><Music2 size={32}/><h3>{selected.title}</h3><audio controls src={selected.mediaUrl}/></div> : <div className="detail-writing"><BookOpen size={26}/><h3>{selected.title}</h3><p>{selected.description}</p></div>}</div><div className="detail-copy"><span className="section-kicker">{selected.category.replaceAll('_', ' ')} <i>✳</i></span><h2 id="detail-title">{selected.title}</h2><p>{selected.description || 'A piece from my creative world.'}</p><div className="detail-actions">{selected.listing?.isActive && selected.listing.priceCents !== null && <button className="detail-buy" onClick={() => toast('Checkout will be available when a payment provider is connected.')}><ShoppingBag size={16}/> Buy now · ${(selected.listing.priceCents / 100).toFixed(2)}</button>}{selected.listing?.isTradeable ? <button className="detail-trade" onClick={() => { setSelected(null); setTradeWork(selected) }}><ArrowLeftRight size={16}/> Propose art swap</button> : !selected.listing?.isActive ? <span className="not-listed"><Heart size={15}/> This work is not currently listed.</span> : null}</div><span className="detail-footnote"><Check size={13}/> A work shared with care, directly from the artist.</span></div></section></div>}
    {tradeWork && <TradeProposalModal offeredWork={tradeWork} artistId={artist.id} onClose={() => setTradeWork(null)} onSent={() => { setTradeWork(null); toast('Your trade proposal has been sent.') }}/>}
    {createOpen && <CreateArtworkModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); setRetryWorks(value => value + 1); toast('Your work is now in your gallery.') }} /> }
    {message && <div className="profile-toast"><Sparkles size={15}/>{message}</div>}
  </main>
}
