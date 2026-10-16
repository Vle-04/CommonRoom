import { useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpFromLine, Check, Image, Music2, Video, X } from 'lucide-react'
import { apiRequest } from '../../lib/api'

type Category = 'PAINTING' | 'PHOTOGRAPHY' | 'MUSIC' | 'DANCE' | 'WRITING' | 'CHRONICLE'
const categories: { value: Category; label: string; type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'TEXT' }[] = [
  { value: 'PAINTING', label: 'Paintings & Fine Art', type: 'IMAGE' },
  { value: 'PHOTOGRAPHY', label: 'Photography', type: 'IMAGE' },
  { value: 'MUSIC', label: 'Music & Audio', type: 'AUDIO' },
  { value: 'DANCE', label: 'Dance & Performance', type: 'VIDEO' },
  { value: 'WRITING', label: 'Literature & Poetry', type: 'TEXT' },
  { value: 'CHRONICLE', label: 'World Art & Chronicles', type: 'TEXT' },
]

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('This file could not be read.'))
    reader.readAsDataURL(file)
  })
}

export function CreateArtworkModal({ onClose, onCreated }: { onClose(): void; onCreated(): void }) {
  const [category, setCategory] = useState<Category>('PAINTING')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [forSale, setForSale] = useState(false)
  const [forTrade, setForTrade] = useState(false)
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const activeCategory = categories.find(item => item.value === category)!
  const mediaIcon = activeCategory.type === 'AUDIO' ? <Music2 size={22}/> : activeCategory.type === 'VIDEO' ? <Video size={22}/> : <Image size={22}/>

  const selectFile = async (file?: File) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('For this local starter, media files must be smaller than 2 MB.'); return }
    try { setMediaUrl(await toDataUrl(file)); setFileName(file.name); setError('') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not read this file.') }
  }

  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (activeCategory.type !== 'TEXT' && !mediaUrl) { setError('Choose a media file to add to your work.'); return }
    if (forSale && (!price || Number(price) <= 0)) { setError('Add a price, or turn off “List for sale.”'); return }
    setBusy(true)
    try {
      await apiRequest('/artworks', { method: 'POST', body: JSON.stringify({
        title: title.trim(), description, type: activeCategory.type, category,
        mediaUrl: mediaUrl || `data:text/plain;charset=utf-8,${encodeURIComponent(description || title)}`,
        ...(forSale ? { listPriceCents: Math.round(Number(price) * 100), listingCategory: category === 'MUSIC' ? 'MUSIC_LICENSE' : category === 'WRITING' ? 'SIGNED_BOOK' : 'ORIGINAL_ART' } : {}),
        isTradeable: forTrade,
      }) })
      onCreated()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your work could not be shared.') }
    finally { setBusy(false) }
  }

  return <div className="profile-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="create-art-modal" role="dialog" aria-modal="true" aria-labelledby="create-art-title"><button type="button" className="modal-x" onClick={onClose} aria-label="Close"><X size={19}/></button><span className="section-kicker">MAKE SOMETHING, SHARE SOMETHING</span><h2 id="create-art-title">Put it out <em>into the world.</em></h2><p className="create-art-intro">A work in progress is still a work worth sharing.</p><form onSubmit={publish}>
    <label className="create-label">ART CATEGORY<select value={category} onChange={event => { setCategory(event.target.value as Category); setMediaUrl(''); setFileName('') }}>{categories.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
    {activeCategory.type !== 'TEXT' && <label className="create-upload"><input type="file" accept={activeCategory.type === 'IMAGE' ? 'image/*' : activeCategory.type === 'AUDIO' ? 'audio/*' : 'video/*'} onChange={event => selectFile(event.target.files?.[0])}/><span>{mediaIcon}</span><b>{fileName || 'Choose a file for your work'}</b><small>Up to 2 MB · stored locally for this starter</small><span className="upload-action"><ArrowUpFromLine size={14}/> Browse files</span></label>}
    <label className="create-label">TITLE<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Give this piece a name" maxLength={140} required/></label>
    <label className="create-label">A FEW WORDS ABOUT IT<textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="What would you like people to know?" maxLength={10000}/></label>
    <div className="listing-options"><label><input type="checkbox" checked={forSale} onChange={event => setForSale(event.target.checked)}/><span className="create-check"><Check size={12}/></span><span><b>List for sale</b><small>Offer it to someone who loves it</small></span></label>{forSale && <div className="price-field"><span>$</span><input type="number" min="0.01" step="0.01" value={price} onChange={event => setPrice(event.target.value)} placeholder="Price" aria-label="Price in US dollars"/>USD</div>}<label><input type="checkbox" checked={forTrade} onChange={event => setForTrade(event.target.checked)}/><span className="create-check"><Check size={12}/></span><span><b>Open for trade</b><small>Invite an art swap proposal</small></span></label></div>
    {error && <p className="create-art-error" role="alert">{error}</p>}<button className="create-art-submit" type="submit" disabled={busy}>{busy ? 'Sharing your work...' : 'Share with the community'}<ArrowRight size={16}/></button>
  </form></section></div>
}
