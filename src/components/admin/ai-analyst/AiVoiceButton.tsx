"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"

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
        console.error("Speech Recognition Error:", event.error)
        setIsListening(false)
        setInterimText("")
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
    }
  }, [])

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimText("")
    } else {
      try {
        // Check for secure context (SpeechRecognition & MediaDevices are blocked on insecure origins)
        if (typeof window !== "undefined" && !window.isSecureContext) {
          alert("Speech input requires a secure connection (HTTPS) or accessing via 'localhost'. Browsers block microphone access on insecure HTTP connections.")
          return
        }

        // Prompt the user for microphone permission if not already granted
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          // Stop the stream tracks immediately so SpeechRecognition can use the microphone
          stream.getTracks().forEach(track => track.stop())
        } else {
          alert("Microphone APIs are unavailable on this connection. Ensure you are on HTTPS or localhost.")
          return
        }
        
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err: any) {
        console.error("Microphone permission request failed:", err)
        alert("Microphone permission is required for voice input. Please check your browser/system settings and try again.")
      }
    }
  }, [isListening])

  if (!isSupported) return null

  return (
    <div className="relative flex items-center">
      {/* Interim text preview */}
      {interimText && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-gray-800/95 px-3 py-1.5 text-xs text-gray-300 shadow-xl backdrop-blur-sm">
          <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" />
          {interimText}
        </div>
      )}

      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`
          group relative flex h-9 w-9 items-center justify-center rounded-full
          transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
          ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
          ${isListening
            ? "bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            : "bg-white/[0.06] text-gray-400 hover:bg-indigo-500/20 hover:text-indigo-400"
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
