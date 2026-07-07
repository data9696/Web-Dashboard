const PREFIX = 'local_avatar_'

export function getLocalAvatar(userId: string): string | null {
  try {
    return localStorage.getItem(PREFIX + userId)
  } catch {
    return null
  }
}

export function setLocalAvatar(userId: string, dataUrl: string): void {
  try {
    localStorage.setItem(PREFIX + userId, dataUrl)
  } catch {
    // Ignore quota errors
  }
}

export function removeLocalAvatar(userId: string): void {
  try {
    localStorage.removeItem(PREFIX + userId)
  } catch {
    // ignore
  }
}

export function fileToResizedDataUrl(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
