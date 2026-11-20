type PlaybackSettings = MediaTrackSettings & { suppressLocalAudioPlayback?: boolean };
type TabCaptureOptions = DisplayMediaStreamOptions & {
  audio: MediaTrackConstraints & { suppressLocalAudioPlayback: boolean };
  selfBrowserSurface: 'exclude';
  systemAudio: 'exclude';
  windowAudio: 'exclude';
};

export async function openTabCapture(signal: AbortSignal, initialLevel: number) {
  if (!navigator.mediaDevices?.getDisplayMedia) throw Error('Open the studio in desktop Chrome over HTTPS to share a tab.');
  const options: TabCaptureOptions = {
    video: true,
    audio: { suppressLocalAudioPlayback: true },
    selfBrowserSurface: 'exclude',
    systemAudio: 'exclude',
    windowAudio: 'exclude',
  };
  const stream = await navigator.mediaDevices.getDisplayMedia(options);
  const release = () => stream.getTracks().forEach(track => track.stop());
  const track = stream.getAudioTracks()[0];
  const video = stream.getVideoTracks()[0];
  const surface = video?.getSettings().displaySurface;
  if (signal.aborted || !track || (surface && surface !== 'browser')) {
    release();
    if (signal.aborted) throw new DOMException('Capture cancelled.', 'AbortError');
    throw Error('Choose a browser tab and enable Share tab audio.');
  }

  let context: AudioContext | undefined;
  const close = () => {
    release();
    if (context && context.state !== 'closed') void context.close();
  };
  try {
    const output = new AudioContext();
    context = output;
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);
    const gain = context.createGain();
    gain.gain.value = initialLevel;
    const canDuck = [track, video].some(item => (item?.getSettings() as PlaybackSettings | undefined)?.suppressLocalAudioPlayback === true);
    if (canDuck) source.connect(gain).connect(context.destination);
    await context.resume();
    if (signal.aborted) throw new DOMException('Capture cancelled.', 'AbortError');
    return {
      analyser, stream, track, close, canDuck,
      setGain(level: number) { if (canDuck && output.state !== 'closed') gain.gain.setTargetAtTime(level, output.currentTime, 0.025); },
    };
  } catch (error) {
    close();
    throw error;
  }
}
