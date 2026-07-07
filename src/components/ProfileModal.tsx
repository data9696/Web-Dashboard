import { useRef, useState } from 'react'
import { X, Camera, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getLocalAvatar, setLocalAvatar, removeLocalAvatar, fileToResizedDataUrl } from '../lib/localAvatar'

interface Props {
  onClose: () => void
}

export function ProfileModal({ onClose }: Props) {
  const { profile, updateMyProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [team, setTeam] = useState(profile?.team || '')
  const [role, setRole] = useState(profile?.role || '')
  const [dashboardUse, setDashboardUse] = useState(profile?.dashboard_use || '')
  const [avatar, setAvatar] = useState<string | null>(profile ? getLocalAvatar(profile.id) : null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setLocalAvatar(profile.id, dataUrl)
      setAvatar(dataUrl)
    } catch {
      setError('Could not process that image. Try a different file.')
    }
  }

  function removePhoto() {
    if (!profile) return
    removeLocalAvatar(profile.id)
    setAvatar(null)
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    const { error } = await updateMyProfile({
      full_name: fullName.trim(),
      team: team.trim(),
      role: role.trim(),
      dashboard_use: dashboardUse.trim(),
    })
    setSaving(false)
    if (error) setError(error)
    else onClose()
  }

  const initials = (fullName || profile?.email || 'T').slice(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg">Edit Profile</h3>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-charcoal)]">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0"
              style={{ background: 'var(--color-sage)' }}
            >
              {avatar ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" /> : initials}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-sage)]"
              title="Change photo"
            >
              <Camera size={12} className="text-[var(--color-charcoal)]" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div className="text-xs text-[var(--color-muted)]">
            Stored only on this device/browser — not uploaded anywhere.
            {avatar && (
              <button onClick={removePhoto} className="flex items-center gap-1 text-[#dc2626] mt-1 underline">
                <Trash2 size={12} /> Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-sage)]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Team</label>
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="e.g. Sales, Operations, Data"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-sage)]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Role in Company</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Founder, Warehouse Manager"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-sage)]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              What do you use this dashboard for?
            </label>
            <textarea
              value={dashboardUse}
              onChange={(e) => setDashboardUse(e.target.value)}
              rows={3}
              placeholder="e.g. Tracking daily sales and stock levels"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-sage)]"
            />
          </div>
        </div>

        {error && <div className="text-sm text-[#dc2626] mt-3">{error}</div>}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-sage)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-[var(--color-sage)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
