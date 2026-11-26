"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface AiVoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function AiVoiceButton({ onTranscript, disabled }: AiVoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [interimText, setInterimText] = useState("")
  const recognitionRef = useRef<any>(null)

  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = "en-IN"
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        let interim = ""
        let final = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }
        setInterimText(interim)
        if (final) {
          onTranscriptRef.current(final)
          setInterimText("")
          setIsListening(false)
        }
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        setInterimText("")

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Microphone access was denied. Please allow microphone access in your browser settings.")
        } else if (event.error === "audio-capture") {
          toast.error("No microphone detected. Please connect a microphone and try again.")
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          toast.error("Voice input error. Please try again or type your question.")
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch { }
      }
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      try {
        recognitionRef.current.stop()
      } catch { }
      setIsListening(false)
      setInterimText("")
    } else {
      try {
        if (typeof window !== "undefined" && !window.isSecureContext) {
          toast.error("Voice input requires HTTPS or localhost.")
          return
        }

        recognitionRef.current.start()
        setIsListening(true)
      } catch (err: any) {
        setIsListening(false)
        if (err?.name === "NotAllowedError" || err?.message?.includes("Permission denied")) {
          toast.error("Microphone permission denied. Please enable mic access in your browser.")
        } else if (err?.name === "InvalidStateError") {
          // Already active, restart cleanly
          try {
            recognitionRef.current.abort()
            recognitionRef.current.start()
            setIsListening(true)
          } catch { }
        } else {
          toast.error("Could not start voice recognition. Please try typing.")
        }
      }
    }
  }, [isListening])

  if (!isSupported) return null

  return (
    <div className="relative flex items-center">
      {/* Interim text preview */}
      {interimText && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-lg">
          <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin text-indigo-600" />
          {interimText}
        </div>
      )}

      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`
          group relative flex h-9 w-9 items-center justify-center rounded-lg
          transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
          ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
          ${isListening
            ? "bg-rose-50 text-rose-600 border border-rose-200"
            : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
          }
        `}
        title={isListening ? "Stop listening" : "Voice input"}
      >
        {/* Pulsating rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
            <span className="absolute inset-[-4px] animate-pulse rounded-full border-2 border-red-500/30" />
          </>
        )}

        {isListening ? (
          <MicOff className="relative z-10 h-4 w-4" />
        ) : (
          <Mic className="relative z-10 h-4 w-4" />
        )}
      </button>
    </div>
  )
}
