import { createContext, useContext, useState } from 'react'

const CaptureContext = createContext(null)

export function CaptureProvider({ children }) {
  const [photoBlob, setPhotoBlob] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  function setPhoto(blob) {
    setPhotoBlob(blob)
    if (blob) {
      setPhotoPreview(URL.createObjectURL(blob))
    } else {
      setPhotoPreview(null)
    }
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoBlob(null)
    setPhotoPreview(null)
  }

  return (
    <CaptureContext.Provider value={{ photoBlob, photoPreview, setPhoto, clearPhoto }}>
      {children}
    </CaptureContext.Provider>
  )
}

export function useCapture() {
  const context = useContext(CaptureContext)
  if (!context) throw new Error('useCapture must be used within CaptureProvider')
  return context
}
