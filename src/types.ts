export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  image?: string; // base64 data url
  isReading?: boolean; // TTS state
}
