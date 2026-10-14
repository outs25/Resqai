'use client';

import React, { useState, useRef } from 'react';

interface EvidenceUploaderProps {
  description: string;
  voiceTranscript: string;
  onDescriptionChange: (desc: string) => void;
  onVoiceTranscriptChange: (transcript: string) => void;
  evidenceFiles: any[];
  onEvidenceFilesChange: (files: any[]) => void;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  description,
  voiceTranscript,
  onDescriptionChange,
  onVoiceTranscriptChange,
  evidenceFiles,
  onEvidenceFilesChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const QUICK_TAGS = [
    'Heavy Smoke',
    'Structural Collapse',
    'Trapped Persons',
    'Road Blocked',
    'Fuel Leak',
    'Water Rising',
  ];

  const handleAppendTag = (tagName: string) => {
    const current = description.trim();
    const updated = current.length > 0 ? `${current}, ${tagName}` : tagName;
    onDescriptionChange(updated);
  };

  const toggleAudioState = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      setIsTranscribing(true);
      try {
        const res = await fetch('/api/ai/voice-to-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: 'mock_audio' }),
        });
        const data = await res.json();
        if (data.transcript) {
          onVoiceTranscriptChange(data.transcript);
          if (!description) onDescriptionChange(data.transcript);
        }
      } catch (err) {
        console.error('Audio transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    const newEvidence = {
      id: `ev-${Date.now()}`,
      file_name: file.name,
      file_size: file.size,
      type: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
      storage_url: previewUrl,
    };

    onEvidenceFilesChange([...evidenceFiles, newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    onEvidenceFilesChange(evidenceFiles.filter((ev) => ev.id !== id));
  };

  const photoCount = evidenceFiles.filter((e) => e.type === 'IMAGE').length;
  const videoCount = evidenceFiles.filter((e) => e.type === 'VIDEO').length;

  return (
    <div className="space-y-space-md">
      {/* Incident Quick Description Card */}
      <div className="bg-surface-container-high rounded-xl p-space-md shadow-md space-y-space-sm">
        <div className="flex items-center justify-between">
          <label
            htmlFor="incident-notes"
            className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">edit_note</span>
            What is happening?
          </label>
          <span className="font-caption text-caption text-text-citizen-muted">Optional</span>
        </div>

        <div className="relative space-y-1.5">
          <textarea
            id="incident-notes"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="e.g. 2 cars collided near bridge, heavy smoke visible, lane blocked..."
            rows={3}
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-text-citizen-muted font-body-sm text-body-sm rounded-lg p-space-sm resize-none focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary-container transition-colors border border-surface-container"
          />

          {/* Quick Micro-Chips for high pressure single-tap insertion */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAppendTag(tag)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-caption text-caption hover:bg-surface-bright active:scale-95 transition-all"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Capture Row (Tactile Multi-button Grid) */}
      <div className="space-y-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">perm_media</span>
            Attach Field Media
          </span>
          <span className="font-caption text-caption text-text-citizen-muted">Instant Upload</span>
        </div>

        <div className="grid grid-cols-3 gap-space-xs">
          {/* Add Photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-space-sm rounded-xl active:scale-95 transition-all shadow-sm group ${
              photoCount > 0
                ? 'bg-primary-container text-white'
                : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform ${
                photoCount > 0 ? 'bg-white/20 text-white' : 'bg-surface-container-lowest text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">photo_camera</span>
            </div>
            <span
              className={`mt-1.5 font-label-sm text-label-sm font-medium ${
                photoCount > 0 ? 'text-white' : 'text-on-surface'
              }`}
            >
              {photoCount > 0 ? `${photoCount} Added` : 'Add Photo'}
            </span>
            <span
              className={`font-caption text-[10px] ${
                photoCount > 0 ? 'text-white/80' : 'text-text-citizen-muted'
              }`}
            >
              Camera/Roll
            </span>
          </button>

          {/* Add Video */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-space-sm rounded-xl active:scale-95 transition-all shadow-sm group ${
              videoCount > 0
                ? 'bg-primary-container text-white'
                : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform ${
                videoCount > 0 ? 'bg-white/20 text-white' : 'bg-surface-container-lowest text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">videocam</span>
            </div>
            <span
              className={`mt-1.5 font-label-sm text-label-sm font-medium ${
                videoCount > 0 ? 'text-white' : 'text-on-surface'
              }`}
            >
              {videoCount > 0 ? `${videoCount} Added` : 'Add Video'}
            </span>
            <span
              className={`font-caption text-[10px] ${
                videoCount > 0 ? 'text-white/80' : 'text-text-citizen-muted'
              }`}
            >
              Max 30s
            </span>
          </button>

          {/* Voice Note */}
          <button
            type="button"
            onClick={toggleAudioState}
            className={`flex flex-col items-center justify-center p-space-sm rounded-xl active:scale-95 transition-all shadow-sm group relative overflow-hidden ${
              isRecording
                ? 'bg-status-critical text-white'
                : voiceTranscript
                ? 'bg-primary-container text-white'
                : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform ${
                isRecording
                  ? 'bg-white text-status-critical animate-pulse'
                  : voiceTranscript
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-container-lowest text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">mic</span>
            </div>
            <span className="mt-1.5 font-label-sm text-label-sm font-medium">
              {isRecording
                ? `Recording...`
                : voiceTranscript
                ? 'Note Saved'
                : 'Voice Note'}
            </span>
            <span
              className={`font-caption text-[10px] ${
                isRecording || voiceTranscript ? 'text-white/80' : 'text-text-citizen-muted'
              }`}
            >
              {isRecording
                ? `0:0${recordingSeconds}s (Tap stop)`
                : voiceTranscript
                ? 'Audio linked'
                : 'Hold to record'}
            </span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,video/*"
          className="hidden"
        />

        {/* Transcribing indicator */}
        {isTranscribing && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-ai-recommendation-soft/30 text-ai-recommendation text-xs border border-ai-recommendation-soft">
            <span className="material-symbols-outlined text-[16px] animate-spin">
              progress_activity
            </span>
            <span>AI transcribing voice note in real-time...</span>
          </div>
        )}

        {/* Voice transcript preview */}
        {voiceTranscript && (
          <div className="p-3 rounded-xl bg-ai-recommendation-soft/20 border border-ai-recommendation/20 space-y-1 text-xs text-on-surface">
            <div className="flex items-center justify-between font-label-sm text-[11px] text-ai-recommendation font-semibold uppercase">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">volume_up</span>
                Transcribed Audio Note
              </span>
              <button
                type="button"
                onClick={() => onVoiceTranscriptChange('')}
                className="text-primary hover:underline lowercase font-normal"
              >
                Clear
              </button>
            </div>
            <p className="italic text-on-surface-variant">&ldquo;{voiceTranscript}&rdquo;</p>
          </div>
        )}

        {/* Evidence previews */}
        {evidenceFiles.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1">
            {evidenceFiles.map((ev) => (
              <div
                key={ev.id}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-container-highest shrink-0 bg-surface-container"
              >
                <img src={ev.storage_url} alt="Evidence" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(ev.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-on-surface/80 hover:bg-status-critical text-white flex items-center justify-center text-[10px]"
                >
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
