import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Video, VideoOff, Image as ImageIcon, X, MapPin, Clock, ChevronRight, AlertCircle } from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useCamera } from '@/hooks/useCamera'
import { useAppStore } from '@/store'
import { claimApi } from '@/services/api'
import { fileToBase64, getLocationString } from '@/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  description: z.string().min(10, 'Please provide at least 10 characters').max(500),
})
type FormData = z.infer<typeof schema>

export default function ClaimCapturePage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const setActiveClaim = useAppStore((s) => s.setActiveClaim)
  const { videoRef, isRecording, capturedImage, startCamera, stopCamera, capturePhoto, startRecording, stopRecording, clearCapture } = useCamera()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [videoBase64, setVideoBase64] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const activeImage = capturedImage || uploadedImage

  const handleStartCamera = async () => { setMode('camera'); await startCamera() }
  const handleCapturePhoto = () => { const img = capturePhoto(); if (img) { setMode('preview'); stopCamera() } }
  const handleStartVideo = () => { startRecording(); toast('Recording started...', { icon: '🔴' }) }
  const handleStopVideo = async () => { const b = await stopRecording(); if (b) { setVideoBase64(b); toast.success('Video recorded!') } }
  const handleClear = () => { clearCapture(); setUploadedImage(null); setVideoBase64(null); setMode('idle'); stopCamera() }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return }
    const base64 = await fileToBase64(file)
    setUploadedImage(`data:${file.type};base64,${base64}`)
    setMode('preview'); clearCapture(); toast.success('Image uploaded')
  }

  const onSubmit = async (data: FormData) => {
    if (!activeImage && !videoBase64) { toast.error('Please capture or upload damage evidence'); return }
    setIsSubmitting(true)
    const toastId = toast.loading('Submitting claim...')
    try {
      let location: { latitude?: number; longitude?: number } = {}
      if (locationEnabled) { const loc = await getLocationString(); if (loc) location = loc }
      const imageBase64 = activeImage?.startsWith('data:') ? activeImage.split(',')[1] : activeImage
      const response = await claimApi.submit({ vehicleNumber: user?.vehicleNumber ?? '', description: data.description, imageBase64: imageBase64 ?? undefined, videoBase64: videoBase64 ?? undefined, timestamp: new Date().toISOString(), ...location })
      const claim = response.data.data
      setActiveClaim(claim)
      toast.dismiss(toastId); toast.success('Claim submitted!')
      navigate(`/claim/${claim.id}/processing`)
    } catch { toast.dismiss(toastId); toast.error('Submission failed. Please try again.') }
    finally { setIsSubmitting(false) }
  }

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'New Claim' }]} />
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">File a Claim</h1>
          <p className="text-slate-500 text-sm">Capture or upload evidence of vehicle damage.</p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{new Date().toLocaleString('en-IN')}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{locationEnabled ? 'GPS enabled' : 'Location off'}</span>
        </div>

        {/* Camera Area */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #BFDBFE', boxShadow: '0 4px 24px rgba(59,130,246,0.08)' }}>
          <AnimatePresence mode="wait">
            {mode === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}>
                    <ImageIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-700 font-semibold">Add damage evidence</p>
                  <p className="text-xs text-slate-400 mt-1">Clear photos improve AI accuracy</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" onClick={handleStartCamera}
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] group"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">Live Camera</p>
                      <p className="text-xs text-slate-500">Photo or 360° video</p>
                    </div>
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">Upload from Gallery</p>
                      <p className="text-xs text-slate-500">JPG, PNG up to 10MB</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
            {mode === 'camera' && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video object-cover" style={{ background: '#0F172A' }} />
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.9)' }}>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-bold text-white">REC</span>
                  </div>
                )}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-3">
                  <Button variant="secondary" size="sm" onClick={handleClear} icon={<X className="w-4 h-4" />}>Cancel</Button>
                  <Button variant="primary" size="md" onClick={handleCapturePhoto} icon={<Camera className="w-4 h-4" />}>Capture</Button>
                  {!isRecording
                    ? <Button variant="danger" size="sm" onClick={handleStartVideo} icon={<Video className="w-4 h-4" />}>Record</Button>
                    : <Button variant="secondary" size="sm" onClick={handleStopVideo} icon={<VideoOff className="w-4 h-4" />}>Stop</Button>}
                </div>
              </motion.div>
            )}
            {mode === 'preview' && activeImage && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <img src={activeImage} alt="Captured" className="w-full aspect-video object-cover" />
                {videoBase64 && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full" style={{ background: 'rgba(5,150,105,0.9)' }}>
                    <span className="text-xs font-bold text-white">Video attached</span>
                  </div>
                )}
                <button type="button" onClick={handleClear}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.9)' }}>
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            All images verified for AI generation and tampering. Submitting fake images is insurance fraud.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #BFDBFE', boxShadow: '0 4px 20px rgba(59,130,246,0.06)' }}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">Claim Details</h2>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Damage Description</label>
              <textarea {...register('description')} rows={4} placeholder="Describe the incident and damage in detail..."
                className="input-field resize-none w-full" />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl mt-4"
              style={{ background: 'linear-gradient(135deg, #F0F7FF, #F0FDF4)', border: '1px solid #BFDBFE' }}>
              <div>
                <p className="text-sm font-semibold text-slate-700">Enable GPS Location</p>
                <p className="text-xs text-slate-400">Attach incident location to claim</p>
              </div>
              <button type="button" onClick={() => setLocationEnabled((v) => !v)}
                className="w-11 h-6 rounded-full transition-all duration-300 relative"
                style={{ background: locationEnabled ? 'linear-gradient(135deg, #2563EB, #10B981)' : '#E2E8F0' }}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${locationEnabled ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
          <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full"
            icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
            Submit Claim
          </Button>
        </form>
      </div>
    </AppLayout>
  )
}