export type WavRecordingSession = {
  stop: () => Promise<{ blob: Blob; file: File; previewUrl: string }>;
};

const mergeBuffers = (buffers: Float32Array[]) => {
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;

  buffers.forEach((buffer) => {
    result.set(buffer, offset);
    offset += buffer.length;
  });

  return result;
};

const encodeWav = (samples: Float32Array, sampleRate: number) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  samples.forEach((sample) => {
    const value = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
    offset += 2;
  });

  return buffer;
};

export const startWavRecording = async (stream: MediaStream): Promise<WavRecordingSession> => {
  const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextConstructor();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const muteGain = audioContext.createGain();
  const chunks: Float32Array[] = [];

  muteGain.gain.value = 0;

  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(input));
  };

  source.connect(processor);
  processor.connect(muteGain);
  muteGain.connect(audioContext.destination);

  return {
    stop: async () => {
      processor.disconnect();
      source.disconnect();
      muteGain.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await audioContext.close();

      const merged = mergeBuffers(chunks);
      const wavBuffer = encodeWav(merged, audioContext.sampleRate);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const previewUrl = URL.createObjectURL(blob);
      const file = new File([blob], `voice-note-${Date.now()}.wav`, { type: "audio/wav" });

      return { blob, file, previewUrl };
    },
  };
};
