import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentPrompt } from '../hooks/useCurrentPrompt'
import { useCapture } from '../context/CaptureContext'
import PromptHeader from '../components/PromptHeader'
import BottomNav from '../components/BottomNav'

export default function Capture() {
  const { prompt } = useCurrentPrompt()
  const { setPhoto, photoPreview, clearPhoto } = useCapture()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraError, setCameraError] = useState(false)
  const [captured, setCaptured] = useState(false)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
      streamRef.current = s
    } catch {
      setCameraError(true)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      setPhoto(blob)
      setCaptured(true)
      stopCamera()
    }, 'image/jpeg', 0.85)
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setCaptured(true)
      stopCamera()
    }
  }

  function handleUndo() {
    clearPhoto()
    setCaptured(false)
    startCamera()
  }

  function handleConfirm() {
    stopCamera()
    navigate('/new-post')
  }

  return (
    <div className="has-bottom-nav">
      <PromptHeader text={prompt?.text} variant="blue" />

      <div className="d-flex flex-column align-items-center gap-3 p-3">
        <div className="viewfinder bg-light border rounded-3 d-flex align-items-center justify-content-center w-100">
          {captured && photoPreview ? (
            <img src={photoPreview} alt="Captured" />
          ) : cameraError ? (
            <div className="text-center text-secondary p-4">
              <p>Camera not available</p>
              <button
                className="btn bg-sondr-blue text-white rounded-pill fw-semibold mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload a photo instead
              </button>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted />
          )}
        </div>

        {!cameraError && (
          <p className="text-coral fst-italic small">Capture a photo inspired by the prompt.</p>
        )}

        <div className="d-flex align-items-center justify-content-center gap-5 py-1">
          <button className="btn fs-4 text-secondary" onClick={handleUndo} disabled={!captured}>
            &#x21A9;
          </button>
          {!captured && !cameraError && (
            <button className="shutter-btn" onClick={capturePhoto}>
              <span className="shutter-btn__inner" />
            </button>
          )}
          <button className="btn fs-4 text-secondary" onClick={() => fileInputRef.current?.click()}>
            &#x1F5BC;
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="d-none"
        />

        {captured && (
          <button className="btn bg-sondr-blue text-white rounded-pill fw-bold px-5 py-2" onClick={handleConfirm}>
            CONFIRM
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
