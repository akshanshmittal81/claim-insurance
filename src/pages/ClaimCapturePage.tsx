import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Video, VideoOff, Image as ImageIcon, X, MapPin, Clock, ChevronRight, AlertCircle, Plus, Check } from 'lucide-react'
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
  const [mode, setMode] = useState<'idle' | 'camera' | 'photo-preview' | 'video-preview' | 'preview'>('idle')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [recordedVideos, setRecordedVideos] = useState<{ base64: string; duration: number; thumbnail?: string }[]>([])
  const [previewVideo, setPreviewVideo] = useState<{ base64: string; duration: number; thumbnail?: string } | null>(null)
  const [lightbox, setLightbox] = useState<{ type: 'image' | 'video'; src: string; duration?: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const allImages = [...(capturedImage ? [capturedImage] : []), ...uploadedImages]
  const hasEvidence = allImages.length > 0 || recordedVideos.length > 0

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isRecording])

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const captureThumbnail = (): string | null => {
    if (!videoRef.current) return null
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 320
    canvas.height = videoRef.current.videoHeight || 180
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(videoRef.current, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.7)
  }

  const handleStartCamera = async () => { setMode('camera'); await startCamera() }

  const handleCapturePhoto = () => {
    const img = capturePhoto()
    if (img) setMode('photo-preview')
  }

  const handleAcceptPhoto = () => { stopCamera(); setMode('preview') }

  const handleRetakePhoto = async () => { clearCapture(); setMode('camera'); await startCamera() }

  const handleStartVideo = () => { startRecording(); toast('Recording started...', { icon: '🔴' }) }

  const handleStopVideo = async () => {
    const thumbnail = captureThumbnail()
    const b = await stopRecording()
    if (b) {
      setPreviewVideo({ base64: b, duration: recordingSeconds, thumbnail: thumbnail ?? undefined })
      stopCamera()
      setMode('video-preview')
      setRecordingSeconds(0)
    }
  }

  const handleAcceptVideo = () => {
    if (previewVideo) { setRecordedVideos(prev => [...prev, previewVideo]); setPreviewVideo(null) }
    setMode('preview')
  }

  const handleRetakeVideo = async () => { setPreviewVideo(null); setMode('camera'); await startCamera() }

  const handleClear = () => {
    clearCapture(); setUploadedImages([]); setRecordedVideos([])
    setPreviewVideo(null); setLightbox(null); setMode('idle'); stopCamera()
  }

  const handleRemoveImage = (index: number) => {
    if (capturedImage && index === 0) {
      clearCapture()
      if (uploadedImages.length === 0 && recordedVideos.length === 0) setMode('idle')
    } else {
      const uploadedIdx = capturedImage ? index - 1 : index
      setUploadedImages(prev => prev.filter((_, i) => i !== uploadedIdx))
      if (allImages.length === 1 && !capturedImage && recordedVideos.length === 0) setMode('idle')
    }
  }

  const handleRemoveVideo = (index: number) => {
    setRecordedVideos(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0 && allImages.length === 0) setMode('idle')
      return updated
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024)
    if (oversized.length) { toast.error('Each file must be under 10MB'); return }
    const base64s = await Promise.all(files.map(async (file) => {
      const b64 = await fileToBase64(file)
      return `data:${file.type};base64,${b64}`
    }))
    setUploadedImages(prev => {
      const combined = [...prev, ...base64s]
      if (combined.length > 6) { toast.error('Max 6 images allowed'); return combined.slice(0, 6) }
      return combined
    })
    setMode('preview')
    toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`)
    e.target.value = ''
  }

  const onSubmit = async (data: FormData) => {
    if (!hasEvidence) { toast.error('Please capture or upload damage evidence'); return }
    setIsSubmitting(true)
    const toastId = toast.loading('Submitting claim...')
    try {
      let location: { latitude?: number; longitude?: number } = {}
      if (locationEnabled) { const loc = await getLocationString(); if (loc) location = loc }
      const primaryRaw = allImages[0]
      const imageBase64 = primaryRaw?.startsWith('data:') ? primaryRaw.split(',')[1] : primaryRaw
      const videoBase64 = recordedVideos[0]?.base64 ?? undefined
      const response = await claimApi.submit({
        vehicleNumber: user?.vehicleNumber ?? '',
        description: data.description,
        imageBase64: imageBase64 ?? undefined,
        videoBase64,
        timestamp: new Date().toISOString(),
        ...location,
      })
      const claim = response.data.data
      setActiveClaim(claim)
      toast.dismiss(toastId); toast.success('Claim submitted!')
      navigate(`/claim/${claim.id}/processing`)
    } catch {
      toast.dismiss(toastId); toast.error('Submission failed. Please try again.')
    } finally { setIsSubmitting(false) }
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

        {/* Main Area */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #BFDBFE', boxShadow: '0 4px 24px rgba(59,130,246,0.08)' }}>
          <AnimatePresence mode="wait">

            {/* IDLE */}
            {mode === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}>
                    <ImageIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-700 font-semibold">Add damage evidence</p>
                  <p className="text-xs text-slate-400 mt-1">Upload up to 6 photos — clear photos improve AI accuracy</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" onClick={handleStartCamera}
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02]"
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
                      <p className="text-xs text-slate-500">JPG, PNG up to 10MB each</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* CAMERA */}
            {mode === 'camera' && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video object-cover" style={{ background: '#0F172A' }} />
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.92)' }}>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-bold text-white font-mono">REC {formatTime(recordingSeconds)}</span>
                  </div>
                )}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-3">
                  <Button variant="secondary" size="sm" onClick={() => { stopCamera(); setMode('idle') }} icon={<X className="w-4 h-4" />}>Cancel</Button>
                  {!isRecording && (
                    <Button variant="primary" size="md" onClick={handleCapturePhoto} icon={<Camera className="w-4 h-4" />}>Capture</Button>
                  )}
                  {!isRecording
                    ? <Button variant="danger" size="sm" onClick={handleStartVideo} icon={<Video className="w-4 h-4" />}>Record</Button>
                    : <Button variant="secondary" size="sm" onClick={handleStopVideo} icon={<VideoOff className="w-4 h-4" />}>Stop {formatTime(recordingSeconds)}</Button>
                  }
                </div>
              </motion.div>
            )}

            {/* PHOTO PREVIEW */}
            {mode === 'photo-preview' && capturedImage && (
              <motion.div key="photo-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <img src={capturedImage} alt="Preview" className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-3">
                  <p className="text-white text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    Photo captured — looks good?
                  </p>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleRetakePhoto}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#334155' }}>
                      <Camera className="w-4 h-4" /> Retake
                    </button>
                    <button type="button" onClick={handleAcceptPhoto}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #059669, #10B981)', color: 'white' }}>
                      <Check className="w-4 h-4" /> Use Photo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIDEO PREVIEW */}
            {mode === 'video-preview' && previewVideo && (
              <motion.div key="video-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="relative w-full aspect-video" style={{ background: '#0F172A' }}>
                  {previewVideo.thumbnail
                    ? <img src={previewVideo.thumbnail} alt="Video preview" className="w-full h-full object-cover opacity-80" />
                    : <div className="w-full h-full flex items-center justify-center"><Video className="w-16 h-16 text-slate-600" /></div>
                  }
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
                      style={{ background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.3)' }}>
                      <Video className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-white font-mono">{formatTime(previewVideo.duration)}</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-3">
                  <p className="text-white text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    Video recorded — use this?
                  </p>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleRetakeVideo}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#334155' }}>
                      <Camera className="w-4 h-4" /> Retake
                    </button>
                    <button type="button" onClick={handleAcceptVideo}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #059669, #10B981)', color: 'white' }}>
                      <Check className="w-4 h-4" /> Use Video
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PREVIEW GRID */}
            {mode === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-700">
                    {allImages.length > 0 && `${allImages.length} photo${allImages.length !== 1 ? 's' : ''}`}
                    {allImages.length > 0 && recordedVideos.length > 0 && ' + '}
                    {recordedVideos.length > 0 && `${recordedVideos.length} video${recordedVideos.length !== 1 ? 's' : ''}`}
                  </p>
                  <div className="flex gap-2">
                    {allImages.length < 6 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0', color: '#059669' }}>
                        <Plus className="w-3.5 h-3.5" /> Add Photos
                      </button>
                    )}
                    <button type="button" onClick={handleClear}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                      <X className="w-3.5 h-3.5" /> Clear All
                    </button>
                  </div>
                </div>

                {/* Photos Grid */}
                {allImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {allImages.map((img, i) => (
                      <div key={i}
                        className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                        style={{ border: '1.5px solid #BFDBFE' }}
                        onClick={() => setLightbox({ type: 'image', src: img })}>
                        <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                            <ImageIcon className="w-4 h-4 text-slate-700" />
                          </div>
                        </div>
                        {/* Remove button */}
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(i) }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(0,0,0,0.6)' }}>
                          <X className="w-3 h-3 text-white" />
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold"
                            style={{ background: 'rgba(37,99,235,0.85)', color: 'white' }}>Primary</div>
                        )}
                      </div>
                    ))}
                    {allImages.length < 6 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-[1.02]"
                        style={{ border: '2px dashed #BFDBFE', background: '#F0F7FF', color: '#93C5FD' }}>
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-xs font-semibold">Add</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Videos */}
                {recordedVideos.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Recorded Videos</p>
                    {recordedVideos.map((vid, i) => (
                      <div key={i}
                        className="flex items-center gap-3 p-3 rounded-xl group cursor-pointer transition-colors hover:bg-blue-50"
                        style={{ background: '#F8FAFF', border: '1px solid #DBEAFE' }}
                        onClick={() => vid.thumbnail && setLightbox({ type: 'video', src: vid.thumbnail, duration: vid.duration })}>
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 relative"
                          style={{ background: '#0F172A', border: '1px solid #BFDBFE' }}>
                          {vid.thumbnail
                            ? <img src={vid.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Video className="w-5 h-5 text-slate-400" /></div>
                          }
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                              <Video className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700">Video {i + 1}</p>
                          <p className="text-xs text-slate-400 font-mono">{formatTime(vid.duration)} recorded</p>
                        </div>
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveVideo(i) }}
                          className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          style={{ background: '#FEE2E2', color: '#DC2626' }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" onClick={handleStartCamera}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE', color: '#2563EB' }}>
                  <Camera className="w-3.5 h-3.5" /> Add from Camera
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileUpload} />

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

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.88)' }}
            onClick={() => setLightbox(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>

              {lightbox.type === 'image' ? (
                <img src={lightbox.src} alt="Full view" className="w-full object-contain max-h-[80vh]" style={{ background: '#0F172A' }} />
              ) : (
                <div className="relative w-full aspect-video" style={{ background: '#0F172A' }}>
                  {lightbox.src && <img src={lightbox.src} alt="Video" className="w-full h-full object-cover opacity-80" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                      style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.3)' }}>
                      <Video className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  {lightbox.duration !== undefined && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.7)' }}>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-bold text-white font-mono">{formatTime(lightbox.duration)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Close button */}
              <button onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Tap outside hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs text-white/50">
                Tap outside to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </AppLayout>
  )
}