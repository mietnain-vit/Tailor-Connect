import { useState } from 'react'
import useClipboardHook from 'react-use-clipboard'
import toast from 'react-hot-toast'

export function useClipboard(text: string, options?: { successDuration?: number }) {
  const [isCopied, setCopied] = useClipboardHook(text, {
    successDuration: options?.successDuration || 2000,
  })

  const copy = () => {
    setCopied()
    toast.success('Copied to clipboard!')
  }

  return { isCopied, copy }
}

