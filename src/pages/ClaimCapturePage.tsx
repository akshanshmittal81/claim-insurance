import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  Video,
  VideoOff,
  Image as ImageIcon,
  X,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useCamera } from '@/hooks/useCamera'
import { useAppStore } from '@/store'
import { claimApi } from '@/services/api'
import { fileToBase64, getLocationString } from '@/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  description: z
    .string()
    .min(10, 'Please provide at least 10 characters describing the damage')
    .max(500),
})

type FormData = z.infer<typeof schema>

type CaptureMode = 'idle' | 'camera' | 'preview'

export default function ClaimCapturePage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const setActiveClaim = useAppStore((s) => s.setActiveClaim)

  const {
    videoRef,
    isRecording,
    capturedImage,
    startCamera,
    stopCamera,
    capturePhoto,
    startRecording,
    stopRecording,
    clearCapture,
  } = useCamera()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<CaptureMode>('idle')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [videoBase64, setVideoBase64] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const activeImage = capturedImage || uploadedImage
  const timestamp = new Date().toISOString()

  const handleStartCamera = async () => {
    setMode('camera')
    await startCamera()
  }

  const handleCapturePhoto = () => {
    const img = capturePhoto()
    if (img) {
      setMode('preview')
      stopCamera()
    }
  }

  const handleStartVideo = () => {
    startRecording()
    toast('Recording started...', { icon: '🔴' })
  }

  const handleStopVideo = async () => {
    const base64 = await stopRecording()
    if (base64) {
      setVideoBase64(base64)
      toast.success('Video recorded successfully')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxMB = 10
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File size must be under ${maxMB}MB`)
      return
    }

    const base64 = await fileToBase64(file)
    const dataUrl = `data:${file.type};base64,${base64}`
    setUploadedImage(dataUrl)
    setMode('preview')
    clearCapture()
    toast.success('Image uploaded')
  }

  const handleClear = () => {
    clearCapture()
    setUploadedImage(null)
    setVideoBase64(null)
    setMode('idle')
    stopCamera()
  }

  const onSubmit = async (data: FormData) => {
    if (!activeImage && !videoBase64) {
      toast.error('Please capture or upload damage evidence')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Submitting claim...')

    try {
      let location: { latitude?: number; longitude?: number; locationLabel?: string } = {}

      if (locationEnabled) {
        const loc = await getLocationString()
        if (loc) {
          location = { latitude: loc.latitude, longitude: loc.longitude, locationLabel: 'GPS Location' }
        }
      }

      const imageBase64 = activeImage
        ? activeImage.startsWith('data:')
          ? activeImage.split(',')[1]
          : activeImage
        : undefined

      const response = await claimApi.submit({
        vehicleNumber: user?.vehicleNumber ?? '',
        description: data.description,
        imageBase64,
        videoBase64: videoBase64 ?? undefined,
        timestamp,
        ...location,
      })

      const claim = response.data.data
      setActiveClaim(claim)
      toast.dismiss(toastId)
      toast.success('Claim submitted! Tracking in progress.')
      navigate(`/claim/${claim.id}/processing`)
    } catch {
      toast.dismiss(toastId)
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'New Claim' }]} />

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary mb-1">File a Claim</h1>
          <p className="text-ink-secondary text-sm">
            Capture or upload evidence of vehicle damage to begin processing.
          </p>
        </div>

        {/* Metadata strip */}
        <div className="flex items-center gap-4 text-xs text-ink-muted font-mono">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleString('en-IN')}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {locationEnabled ? 'GPS enabled' : 'Location off'}
          </span>
        </div>

        {/* Camera / Upload area */}
        <div className="card border border-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-ink-muted" />
                  </div>
                  <p className="text-ink-secondary font-medium">Add damage evidence</p>
                  <p className="text-xs text-ink-muted mt-1">
                    Clear photos or video improve AI accuracy
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-surface-3 hover:border-surface-4 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <Camera className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-ink-primary">Live Camera</p>
                      <p className="text-xs text-ink-muted">Capture photo or 360° video</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-surface-3 hover:border-surface-4 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      <Upload className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-ink-primary">Upload from Gallery</p>
                      <p className="text-xs text-ink-muted">JPG, PNG up to 10MB</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded-2xl bg-surface-2 aspect-video object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 backdrop-blur px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-semibold text-white">REC</span>
                  </div>
                )}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClear}
                    icon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCapturePhoto}
                    icon={<Camera className="w-4 h-4" />}
                  >
                    Capture
                  </Button>
                  {!isRecording ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleStartVideo}
                      icon={<Video className="w-4 h-4" />}
                    >
                      Record
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleStopVideo}
                      icon={<VideoOff className="w-4 h-4" />}
                    >
                      Stop
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {mode === 'preview' && activeImage && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <img
                  src={activeImage}
                  alt="Captured damage"
                  className="w-full rounded-2xl aspect-video object-cover"
                />
                {videoBase64 && (
                  <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur px-3 py-1.5 rounded-full">
                    <span className="text-xs font-semibold text-white">Video attached</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute top-4 right-4 w-8 h-8 bg-surface-0/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-surface-1 transition-colors"
                >
                  <X className="w-4 h-4 text-ink-primary" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Fraud warning */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-ink-secondary leading-relaxed">
            All images are verified for tampering. Submitting edited, reused, or fake damage
            photos constitutes insurance fraud and will result in claim rejection.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="card border border-white/5 space-y-5">
            <h2 className="font-semibold text-ink-primary text-sm uppercase tracking-wide">
              Claim Details
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                Damage Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe the incident and damage in detail. E.g., 'Rear-end collision at a junction. Significant dent on the boot lid and broken tail lights.'"
                className="input-field resize-none"
              />
              {errors.description && (
                <p className="text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-surface-3">
              <div>
                <p className="text-sm font-medium text-ink-primary">Enable GPS Location</p>
                <p className="text-xs text-ink-muted">Attach incident location to claim</p>
              </div>
              <button
                type="button"
                onClick={() => setLocationEnabled((v) => !v)}
                className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                  locationEnabled ? 'bg-blue-500' : 'bg-surface-4'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                    locationEnabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Submit Claim
          </Button>
        </form>
      </div>
    </AppLayout>
  )
}
