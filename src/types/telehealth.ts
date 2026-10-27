export interface TeleSession {
  id: string;
  patientId: string;
  patientName: string;
  dietitianName: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'Upcoming' | 'In Session' | 'Completed' | 'Cancelled';
  roomUrl: string;
  mode: 'webrtc_sim' | 'jitsi_live';
  sessionNotes: string;
}
