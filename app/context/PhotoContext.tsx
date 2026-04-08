'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const PhotoContext = createContext<{
  photo: string|null
  setPhoto: (p: string|null) => void
}>({ photo: null, setPhoto: () => {} })

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photo, setPhotoState] = useState<string|null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('batizo_photo')
    if (stored) setPhotoState(stored)
  }, [])

  const setPhoto = (p: string|null) => {
    setPhotoState(p)
    if (p) localStorage.setItem('batizo_photo', p)
    else localStorage.removeItem('batizo_photo')
  }

  return (
    <PhotoContext.Provider value={{ photo, setPhoto }}>
      {children}
    </PhotoContext.Provider>
  )
}

export const usePhoto = () => useContext(PhotoContext)
