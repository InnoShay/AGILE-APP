import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Plus, Trash2, ExternalLink } from 'lucide-react';
import { sponsorService } from '../services';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function SponsorsAdmin() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [tier, setTier] = useState<'title' | 'gold' | 'silver'>('gold');
  const [website, setWebsite] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: () => sponsorService.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => sponsorService.create({ name, logoUrl, tier, website: website || undefined }),
    onSuccess: () => {
      toast.success('Sponsor added!');
      setShowCreate(false);
      setName(''); setLogoUrl(''); setTier('gold'); setWebsite('');
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sponsorService.delete(id),
    onSuccess: () => { toast.success('Sponsor removed'); queryClient.invalidateQueries({ queryKey: ['sponsors'] }); },
  });

  const sponsors = data?.data || [];
  const tierOrder = { title: 0, gold: 1, silver: 2 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-lg">SPONSORS</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Sponsor
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : sponsors.length === 0 ? (
        <EmptyState icon={<Award className="w-10 h-10 text-prisma-muted" />} title="NO SPONSORS" description="Add sponsors to display on the landing page." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.sort((a: any, b: any) => tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder]).map((sponsor: any) => (
            <motion.div key={sponsor.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 text-center">
              <img src={sponsor.logoUrl} alt={sponsor.name} className="w-20 h-20 mx-auto object-contain mb-3" />
              <h3 className="font-display text-sm tracking-wider">{sponsor.name}</h3>
              <span className={`badge text-[9px] mt-2 ${
                sponsor.tier === 'title' ? 'badge-gold' : sponsor.tier === 'gold' ? 'badge-gold' : 'badge-crimson'
              }`}>
                {sponsor.tier} sponsor
              </span>
              {sponsor.website && (
                <a href={sponsor.website} target="_blank" className="flex items-center justify-center gap-1 text-[10px] font-mono text-prisma-muted mt-2 hover:text-prisma-ivory">
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button onClick={() => deleteMutation.mutate(sponsor.id)} className="btn-ghost text-[10px] text-prisma-crimson mt-3 mx-auto">
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Sponsor" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label-text">Sponsor Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Company name" />
          </div>
          <div>
            <label className="label-text">Logo URL</label>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="label-text">Tier</label>
            <div className="flex gap-2">
              {(['title', 'gold', 'silver'] as const).map((t) => (
                <button key={t} onClick={() => setTier(t)} className={`flex-1 p-3 rounded-xl border text-center font-display text-sm capitalize ${tier === t ? 'border-prisma-crimson bg-prisma-crimson/10' : 'border-prisma-border'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-text">Website (optional)</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" placeholder="https://..." />
          </div>
          <button onClick={() => createMutation.mutate()} disabled={!name || !logoUrl || createMutation.isPending} className="btn-primary w-full">
            {createMutation.isPending ? 'Adding...' : 'Add Sponsor'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
