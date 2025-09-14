import { useState, useRef, useCallback } from 'react';

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

export interface VoiceRecordingControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
  playRecording: () => void;
}

export const useVoiceRecording = () => {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
    audioBlob: null,
    error: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isProcessing: true }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder with fallback mime types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav';
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setState(prev => ({
          ...prev,
          audioBlob,
          isRecording: false,
          isProcessing: false,
          duration: 0
        }));

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Start duration timer
      let duration = 0;
      intervalRef.current = setInterval(() => {
        duration += 0.1;
        setState(prev => ({ ...prev, duration: Math.round(duration * 10) / 10 }));
      }, 100);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isProcessing: false,
        audioBlob: null,
        duration: 0
      }));

    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to access microphone. Please check permissions.',
        isProcessing: false,
        isRecording: false
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.isRecording]);

  const clearRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      audioBlob: null,
      duration: 0,
      error: null
    }));
    audioChunksRef.current = [];
  }, []);

  const playRecording = useCallback(() => {
    if (state.audioBlob) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioUrl = URL.createObjectURL(state.audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();

      // Clean up URL after playing
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [state.audioBlob]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearRecording,
    playRecording,
    cleanup
  };
};