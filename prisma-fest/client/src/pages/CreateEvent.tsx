import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Upload, Calendar, MapPin, DollarSign, Users, FileText } from 'lucide-react';
import { eventService } from '../services';
import toast from 'react-hot-toast';

const steps = ['Basic Info', 'Schedule & Venue', 'Pricing & Capacity', 'Media Upload', 'Review & Publish'];
const categories = ['technical', 'cultural', 'sports', 'workshop', 'gaming', 'music', 'dance', 'arts', 'literary', 'other'];

export default function CreateEvent() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: 'technical',
    venue: '', date: '', time: '',
    totalCapacity: 100, isFree: true, price: 0,
    coverImage: '',
  });

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const createMutation = useMutation({
    mutationFn: () => eventService.create({ ...form, totalCapacity: Number(form.totalCapacity), price: Number(form.price) }),
    onSuccess: () => {
      toast.success('Event created!');
      navigate('/organizer');
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const canProceed = () => {
    if (step === 0) return form.title && form.description && form.category;
    if (step === 1) return form.venue && form.date && form.time;
    if (step === 2) return form.totalCapacity > 0;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="font-display text-display-lg">CREATE EVENT</h1>

      {/* Step Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono ${
              i < step ? 'bg-prisma-crimson text-prisma-ivory' :
              i === step ? 'bg-prisma-crimson/20 text-prisma-crimson border border-prisma-crimson' :
              'bg-prisma-card text-prisma-muted border border-prisma-border'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? 'bg-prisma-crimson' : 'bg-prisma-border'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="font-display text-sm tracking-wider text-prisma-muted">STEP {step + 1}: {steps[step].toUpperCase()}</p>

      {/* Step Content */}
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-5">
        {step === 0 && (
          <>
            <div>
              <label className="label-text">Event Title</label>
              <input value={form.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="e.g., CodeStorm Hackathon" />
            </div>
            <div>
              <label className="label-text">Description (HTML supported)</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="input-field h-32 resize-none" placeholder="Describe your event in detail..." />
            </div>
            <div>
              <label className="label-text">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => update('category', cat)} className={`badge cursor-pointer ${form.category === cat ? 'badge-crimson' : 'bg-prisma-card text-prisma-muted border border-prisma-border'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="label-text">Venue</label>
              <input value={form.venue} onChange={(e) => update('venue', e.target.value)} className="input-field" placeholder="e.g., Main Auditorium, Block A" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Date</label>
                <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-text">Time</label>
                <input value={form.time} onChange={(e) => update('time', e.target.value)} className="input-field" placeholder="e.g., 10:00 AM" />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="label-text">Total Capacity</label>
              <input type="number" value={form.totalCapacity} onChange={(e) => update('totalCapacity', e.target.value)} className="input-field" min="1" />
            </div>
            <div>
              <label className="label-text">Is this event free?</label>
              <div className="flex gap-3 mt-2">
                <button onClick={() => { update('isFree', true); update('price', 0); }} className={`flex-1 p-4 rounded-xl border-2 text-center ${form.isFree ? 'border-prisma-crimson bg-prisma-crimson/10' : 'border-prisma-border'}`}>
                  <p className="font-display text-sm">FREE</p>
                </button>
                <button onClick={() => update('isFree', false)} className={`flex-1 p-4 rounded-xl border-2 text-center ${!form.isFree ? 'border-prisma-crimson bg-prisma-crimson/10' : 'border-prisma-border'}`}>
                  <p className="font-display text-sm">PAID</p>
                </button>
              </div>
            </div>
            {!form.isFree && (
              <div>
                <label className="label-text">Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className="input-field" min="0" />
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="label-text">Cover Image URL</label>
              <input value={form.coverImage} onChange={(e) => update('coverImage', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            {form.coverImage && (
              <div className="rounded-xl overflow-hidden h-48">
                <img src={form.coverImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="font-mono text-xs text-prisma-muted">Tip: Use Unsplash or Cloudinary URLs for high-quality images</p>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="font-display text-lg tracking-wider mb-4">REVIEW YOUR EVENT</h3>
            <div className="space-y-3">
              {[
                { icon: FileText, label: 'Title', value: form.title },
                { icon: Calendar, label: 'Date', value: `${form.date} · ${form.time}` },
                { icon: MapPin, label: 'Venue', value: form.venue },
                { icon: Users, label: 'Capacity', value: form.totalCapacity },
                { icon: DollarSign, label: 'Price', value: form.isFree ? 'Free' : `₹${form.price}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-prisma-card rounded-lg">
                  <item.icon className="w-4 h-4 text-prisma-crimson" />
                  <span className="font-mono text-xs text-prisma-muted w-20">{item.label}</span>
                  <span className="text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-secondary text-sm">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="btn-primary text-sm">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="btn-primary text-sm">
            {createMutation.isPending ? 'Publishing...' : 'Publish Event'}
          </button>
        )}
      </div>
    </div>
  );
}
