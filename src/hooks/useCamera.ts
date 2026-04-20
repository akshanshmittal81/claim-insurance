import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  isStreaming: boolean
  isRecording: boolean
  capturedImage: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  capturePhoto: () => string | null
  startRecording: () => void
  stopRecording: () => Promise<string | null>
  clearCapture: () => void
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isStreaming, setIsStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      // Pehle purani stream band karo agar chal rahi ho
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Play ka wait karo properly
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject()
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current!.play()
              resolve()
            } catch (e) {
              reject(e)
            }
          }
        })
      }

      setIsStreaming(true)
    } catch (err: any) {
      console.error('Camera error:', err)
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        toast.error('Camera access denied. Please allow camera permissions.')
      } else if (err?.name === 'NotFoundError') {
        toast.error('No camera found on this device.')
      } else if (err?.name === 'NotReadableError') {
        toast.error('Camera is already in use by another app.')
      } else {
        toast.error('Could not start camera. Please try again.')
      }
      setIsStreaming(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load()
    }
    setIsStreaming(false)
    setIsRecording(false)
  }, [])

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(dataUrl)
    return dataUrl
  }, [])

  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    chunksRef.current = []

    // Browser support ke hisaab se mimeType choose karo
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : ''

    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined
    )

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start(100)
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) { resolve(null); return }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.readAsDataURL(blob)
      }

      mediaRecorderRef.current.stop()
      setIsRecording(false)
    })
  }, [])

  const clearCapture = useCallback(() => {
    setCapturedImage(null)
  }, [])

  return {
    videoRef,
    isStreaming,
    isRecording,
    capturedImage,
    startCamera,
    stopCamera,
    capturePhoto,
    startRecording,
    stopRecording,
    clearCapture,
  }
}