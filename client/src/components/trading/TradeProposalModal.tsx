import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeftRight, ArrowRight, LoaderCircle, Sparkles, X } from 'lucide-react'
import { apiRequest } from '../../lib/api'

interface TradeableWork { id: string; title: string; category: string; creatorId: string; creator: { pseudonym: string } }
interface OfferWork { id: string; title: string }

export function TradeProposalModal({ offeredWork, artistId, onClose, onSent }: { offeredWork: OfferWork; artistId: string; onClose(): void; onSent(): void }) {
  const [works, setWorks] = useState<TradeableWork[]>([])
  const [requestedId, setRequestedId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<{ artworks: TradeableWork[] }>('/artworks')
      .then(({ artworks }) => setWorks(artworks.filter(work => work.creatorId !== artistId)))
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Could not find other artists’ work.'))
      .finally(() => setLoading(false))
  }, [artistId])

  const sendProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const requested = works.find(work => work.id === requestedId)
    if (!requested) { setError('Choose a work from another artist first.'); return }
    setError(''); setBusy(true)
    try {
      await apiRequest('/trades', { method: 'POST', body: JSON.stringify({ recipientId: requested.creatorId, offeredArtworkId: offeredWork.id, requestedArtworkId: requested.id, message }) })
      onSent()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Trade proposal could not be sent.') }
    finally { setBusy(false) }
  }

  return <div className="profile-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="trade-modal" role="dialog" aria-modal="true" aria-labelledby="trade-title"><button type="button" className="modal-x" onClick={onClose} aria-label="Close"><X size={19}/></button><span className="section-kicker"><Sparkles size={13}/> A LITTLE CREATIVE EXCHANGE</span><h2 id="trade-title">Offer a <em>trade.</em></h2><p className="trade-intro">Good things can find their way to each other.</p><div className="trade-exchange"><div><small>YOU’RE OFFERING</small><b>{offeredWork.title}</b></div><ArrowLeftRight size={19}/><div><small>YOU’D LIKE</small><b>{works.find(work => work.id === requestedId)?.title || 'Choose a work'}</b></div></div><form onSubmit={sendProposal}><label className="create-label">CHOOSE A WORK FROM ANOTHER ARTIST<select value={requestedId} onChange={event => setRequestedId(event.target.value)} disabled={loading}><option value="">{loading ? 'Finding work...' : 'Select a work'}</option>{works.map(work => <option key={work.id} value={work.id}>{work.title} — {work.creator.pseudonym}</option>)}</select></label>{!loading && works.length === 0 && !error && <p className="trade-empty">There aren’t any other published works to trade for yet.</p>}<label className="create-label">ADD A NOTE<textarea value={message} onChange={event => setMessage(event.target.value)} placeholder="Tell them what you love about their work..." maxLength={2000}/></label>{error && <p className="create-art-error">{error}</p>}<button className="create-art-submit" type="submit" disabled={busy || loading || works.length === 0}>{busy ? <><LoaderCircle size={15} className="spin-icon"/> Sending...</> : <>Send trade proposal <ArrowRight size={16}/></>}</button></form></section></div>
}
