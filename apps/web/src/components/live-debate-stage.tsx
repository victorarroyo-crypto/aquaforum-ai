"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LiveKitRoom,
  VideoTrack,
  useRemoteParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import { api, type DebateStartResponse } from "@/lib/api";
import { Video, VideoOff, Wifi, WifiOff, Volume2 } from "lucide-react";

/* ─── Agent metadata ─────────────────────────────────────────────────────── */

const AGENT_COLORS: Record<string, string> = {
  "Carmen Solís": "#E11D48",
  "Elena Vásquez": "#8B5CF6",
  "Marcus Chen": "#0EA5E9",
  "Dr. Ingrid Hoffmann": "#F59E0B",
  "Richard Langford": "#10B981",
};

const AGENT_PROVIDERS: Record<string, string> = {
  "Carmen Solís": "Simli",
  "Elena Vásquez": "Hedra",
  "Marcus Chen": "Simli",
  "Dr. Ingrid Hoffmann": "Hedra",
  "Richard Langford": "Simli",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ─── Inner: participant video tiles ─────────────────────────────────────── */

function ParticipantGrid() {
  const participants = useRemoteParticipants();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const room = useRoomContext();
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const onSpeaking = () => {
      // Find currently speaking participant
      for (const p of room.remoteParticipants.values()) {
        if (p.isSpeaking) {
          setSpeakingId(p.identity);
          return;
        }
      }
      setSpeakingId(null);
    };

    room.on(RoomEvent.ActiveSpeakersChanged, onSpeaking);
    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, onSpeaking);
    };
  }, [room]);

  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-[#52525B]">
            Esperando avatares...
          </p>
          <p className="text-[11px] text-[#3F3F46] mt-1">
            Los agentes se conectan al iniciar la primera ronda
          </p>
        </div>
      </div>
    );
  }

  // Find the active speaker's track for the main view
  const speakerTrack = tracks.find(
    (t) => t.participant.identity === speakingId
  );
  const mainTrack = speakerTrack || tracks[0];

  return (
    <div className="flex flex-col h-full gap-2 p-2">
      {/* Main speaker - large */}
      <div className="flex-1 relative rounded-xl overflow-hidden bg-[#18181B] border border-[rgba(255,255,255,0.06)]">
        {mainTrack ? (
          <>
            <VideoTrack
              trackRef={mainTrack}
              className="w-full h-full object-cover"
            />
            {/* Speaker name overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    AGENT_COLORS[mainTrack.participant.identity] || "#52525B",
                }}
              />
              <span className="text-[13px] font-semibold text-white drop-shadow-lg">
                {mainTrack.participant.identity}
              </span>
              {mainTrack.participant.isSpeaking && (
                <Volume2 className="h-3.5 w-3.5 text-[#14B8A6] animate-pulse" />
              )}
            </div>
            {/* Provider badge */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-white/60">
              {AGENT_PROVIDERS[mainTrack.participant.identity] || "Avatar"}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-[#3F3F46]">Sin video</p>
          </div>
        )}
      </div>

      {/* Thumbnail strip - other participants */}
      {tracks.length > 1 && (
        <div className="flex gap-2 h-[120px] shrink-0">
          {tracks
            .filter((t) => t !== mainTrack)
            .map((trackRef) => {
              const name = trackRef.participant.identity;
              const isSpeaking = trackRef.participant.isSpeaking;
              return (
                <div
                  key={trackRef.participant.sid}
                  className={`relative flex-1 rounded-lg overflow-hidden bg-[#18181B] cursor-pointer transition-all ${
                    isSpeaking
                      ? "ring-2 ring-[#14B8A6]"
                      : "border border-[rgba(255,255,255,0.06)]"
                  }`}
                  onClick={() => setSpeakingId(name)}
                >
                  <VideoTrack
                    trackRef={trackRef}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1.5 flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: AGENT_COLORS[name] || "#52525B",
                      }}
                    />
                    <span className="text-[10px] font-medium text-white drop-shadow">
                      {name.split(" ")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Placeholder tiles for agents without video yet */}
      {participants.length > 0 && tracks.length < participants.length && (
        <div className="flex gap-2 h-[80px] shrink-0">
          {participants
            .filter(
              (p) => !tracks.find((t) => t.participant.sid === p.sid)
            )
            .map((p) => (
              <div
                key={p.sid}
                className="relative flex-1 rounded-lg overflow-hidden bg-[#18181B] border border-[rgba(255,255,255,0.06)] flex items-center justify-center"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white/80"
                  style={{
                    backgroundColor:
                      AGENT_COLORS[p.identity] || "#3F3F46",
                  }}
                >
                  {getInitials(p.identity)}
                </div>
                <span className="absolute bottom-1 text-[9px] text-[#52525B]">
                  Conectando...
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* ─── Connection status bar ──────────────────────────────────────────────── */

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
        connected
          ? "text-[#22C55E] bg-[rgba(34,197,94,0.08)]"
          : "text-[#F59E0B] bg-[rgba(245,158,11,0.08)]"
      }`}
    >
      {connected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {connected ? "Video en vivo" : "Conectando..."}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

interface LiveDebateStageProps {
  sessionId: string;
}

export function LiveDebateStage({ sessionId }: LiveDebateStageProps) {
  const [livekit, setLivekit] = useState<DebateStartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const initLive = useCallback(async () => {
    if (livekit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.debateStart(sessionId);
      setLivekit(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al conectar video";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sessionId, livekit, loading]);

  // Auto-init on mount
  useEffect(() => {
    initLive();
  }, []);

  if (!videoEnabled) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0C0C0F] rounded-xl border border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => setVideoEnabled(true)}
          className="flex items-center gap-2 px-4 py-2 text-[13px] text-[#52525B] hover:text-[#FAFAFA] transition-colors"
        >
          <Video className="h-4 w-4" />
          Activar video
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0C0C0F] rounded-xl border border-[rgba(255,255,255,0.06)] gap-3">
        <VideoOff className="h-6 w-6 text-[#3F3F46]" />
        <p className="text-[13px] text-[#52525B]">{error}</p>
        <button
          onClick={() => { setError(null); setLivekit(null); initLive(); }}
          className="px-4 py-1.5 text-[12px] text-[#14B8A6] border border-[#14B8A6]/30 rounded-lg hover:bg-[#14B8A6]/10 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!livekit || loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0C0C0F] rounded-xl border border-[rgba(255,255,255,0.06)]">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[12px] text-[#52525B]">Iniciando video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0C0C0F] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Video className="h-3.5 w-3.5 text-[#14B8A6]" />
          <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
            Avatares en vivo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionStatus connected={connected} />
          <button
            onClick={() => setVideoEnabled(false)}
            className="p-1 text-[#3F3F46] hover:text-[#FAFAFA] transition-colors"
            title="Desactivar video"
          >
            <VideoOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* LiveKit Room */}
      <div className="flex-1 min-h-0">
        <LiveKitRoom
          serverUrl={livekit.livekit_url}
          token={livekit.viewer_token}
          connect={true}
          audio={true}
          video={false}
          onConnected={() => setConnected(true)}
          onDisconnected={() => setConnected(false)}
          className="h-full"
        >
          <ParticipantGrid />
        </LiveKitRoom>
      </div>
    </div>
  );
}
