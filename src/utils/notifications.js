// Browser Notifications & Floating Picture-in-Picture Window Manager

let pipWindow = null;
let pipVideoElement = null;
let canvasPip = null;
let canvasCtx = null;
let canvasStream = null;

/**
 * Request permission for standard OS desktop notifications
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    return 'denied';
  }
};

export const hasNotificationPermission = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Show OS level pop-up notification (visible across other tabs and desktop apps)
 */
export const showDesktopNotification = (title, body, tag = 'focusflow') => {
  if (hasNotificationPermission()) {
    try {
      return new Notification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⏳</text></svg>',
        tag,
        silent: false,
      });
    } catch (e) {
      console.warn('Failed to display notification', e);
    }
  }
  return null;
};

/**
 * Document Picture-in-Picture or Canvas PiP
 * Creates a genuine floating OS-level window that stays on top of other tabs/apps!
 */
export const isPipSupported = () => {
  return Boolean(
    window.documentPictureInPicture ||
    (document.createElement('video').requestPictureInPicture)
  );
};

export const isPipActive = () => {
  return Boolean(pipWindow || document.pictureInPictureElement);
};

export const closePipWindow = () => {
  if (pipWindow) {
    pipWindow.close();
    pipWindow = null;
  }
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {});
  }
};

/**
 * Launch always-on-top floating pop-up window
 */
export const openFloatingTimerWindow = async ({
  timeFormatted,
  elapsedFormatted = '00:00:00',
  mode,
  isRunning,
  subjectName,
  onToggleTimer,
  onSkip
}) => {
  // Option A: Document Picture-in-Picture (Chrome 111+ / Edge on Windows)
  if (window.documentPictureInPicture) {
    try {
      if (pipWindow) {
        pipWindow.focus();
        return pipWindow;
      }

      pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 360,
        height: 270,
      });

      // Inject styling
      const style = pipWindow.document.createElement('style');
      style.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          background: #090d16;
          color: #f1f5f9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
          user-select: none;
          padding: 12px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
          margin-bottom: 8px;
        }
        .timers-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-bottom: 8px;
        }
        .timer-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 8px 6px;
        }
        .timer-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        .time-value {
          font-size: 26px;
          font-weight: 700;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #ffffff;
          line-height: 1.1;
        }
        .time-value.elapsed {
          color: #38bdf8;
        }
        .subject {
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        button {
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 7px 18px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        button:hover { background: #4338ca; }
        button.secondary {
          background: #1e293b;
          color: #cbd5e1;
        }
        button.secondary:hover { background: #334155; }
      `;
      pipWindow.document.head.appendChild(style);

      // Render content
      const container = pipWindow.document.createElement('div');
      container.id = 'pip-content';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      container.style.width = '100%';

      pipWindow.document.body.appendChild(container);

      pipWindow.addEventListener('pagehide', () => {
        pipWindow = null;
      });

      updateFloatingWindow({ timeFormatted, elapsedFormatted, mode, isRunning, subjectName, onToggleTimer, onSkip });
      return pipWindow;
    } catch (err) {
      console.warn('Document PiP failed, falling back to Canvas PiP', err);
    }
  }

  // Option B: Canvas Video Picture-in-Picture Fallback (Works on all modern browsers!)
  return openCanvasPip({ timeFormatted, elapsedFormatted, mode, isRunning, subjectName });
};

/**
 * Update Document PiP DOM when time ticks
 */
export const updateFloatingWindow = ({
  timeFormatted,
  elapsedFormatted = '00:00:00',
  mode,
  isRunning,
  subjectName,
  onToggleTimer,
  onSkip
}) => {
  if (pipWindow && pipWindow.document) {
    const container = pipWindow.document.getElementById('pip-content');
    if (!container) return;

    const modeLabels = {
      pomodoro: '🎯 Focus Session',
      shortBreak: '☕ Short Break',
      longBreak: '🌴 Long Break'
    };

    container.innerHTML = `
      <div class="badge">${modeLabels[mode] || 'Focus'}</div>
      <div class="timers-row">
        <div class="timer-box">
          <div class="timer-label">Remaining</div>
          <div class="time-value">${timeFormatted}</div>
        </div>
        <div class="timer-box">
          <div class="timer-label">Total Elapsed</div>
          <div class="time-value elapsed">${elapsedFormatted}</div>
        </div>
      </div>
      <div class="subject">📚 ${subjectName || 'Study Session'}</div>
      <div class="controls">
        <button id="pip-toggle">${isRunning ? 'Pause' : 'Start'}</button>
        <button id="pip-skip" class="secondary">Skip</button>
      </div>
    `;

    const toggleBtn = pipWindow.document.getElementById('pip-toggle');
    const skipBtn = pipWindow.document.getElementById('pip-skip');

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        if (onToggleTimer) onToggleTimer();
      };
    }
    if (skipBtn) {
      skipBtn.onclick = () => {
        if (onSkip) onSkip();
      };
    }
    return;
  }

  // Update Canvas PiP if active
  if (canvasCtx && document.pictureInPictureElement) {
    drawPipCanvas(timeFormatted, elapsedFormatted, mode, subjectName);
  }
};

/**
 * Canvas-based Picture-in-Picture fallback
 */
const drawPipCanvas = (timeFormatted, elapsedFormatted = '00:00:00', mode, subjectName) => {
  if (!canvasCtx) return;
  canvasCtx.fillStyle = '#090d16';
  canvasCtx.fillRect(0, 0, 360, 240);

  // Mode badge
  canvasCtx.fillStyle = mode === 'pomodoro' ? '#6366f1' : '#10b981';
  canvasCtx.font = 'bold 14px sans-serif';
  canvasCtx.textAlign = 'center';
  canvasCtx.fillText(mode === 'pomodoro' ? '🎯 FOCUS TIME' : '☕ BREAK TIME', 180, 36);

  // Left Timer: Remaining
  canvasCtx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  canvasCtx.beginPath();
  canvasCtx.roundRect(16, 52, 156, 110, 12);
  canvasCtx.fill();

  canvasCtx.fillStyle = '#94a3b8';
  canvasCtx.font = 'bold 11px sans-serif';
  canvasCtx.fillText('REMAINING', 94, 76);

  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.font = 'bold 32px monospace';
  canvasCtx.fillText(timeFormatted, 94, 124);

  // Right Timer: Elapsed
  canvasCtx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  canvasCtx.beginPath();
  canvasCtx.roundRect(188, 52, 156, 110, 12);
  canvasCtx.fill();

  canvasCtx.fillStyle = '#94a3b8';
  canvasCtx.font = 'bold 11px sans-serif';
  canvasCtx.fillText('TOTAL ELAPSED', 266, 76);

  canvasCtx.fillStyle = '#38bdf8';
  canvasCtx.font = 'bold 24px monospace';
  canvasCtx.fillText(elapsedFormatted, 266, 124);

  // Subject
  canvasCtx.fillStyle = '#94a3b8';
  canvasCtx.font = '13px sans-serif';
  canvasCtx.fillText(subjectName || 'FocusFlow Study Hub', 180, 195);
};

const openCanvasPip = async ({ timeFormatted, elapsedFormatted = '00:00:00', mode, subjectName }) => {
  try {
    if (!canvasPip) {
      canvasPip = document.createElement('canvas');
      canvasPip.width = 360;
      canvasPip.height = 240;
      canvasCtx = canvasPip.getContext('2d');
    }

    drawPipCanvas(timeFormatted, elapsedFormatted, mode, subjectName);

    if (!pipVideoElement) {
      pipVideoElement = document.createElement('video');
      pipVideoElement.muted = true;
      pipVideoElement.autoplay = true;
      pipVideoElement.style.display = 'none';
      document.body.appendChild(pipVideoElement);

      canvasStream = canvasPip.captureStream(10);
      pipVideoElement.srcObject = canvasStream;
      await pipVideoElement.play();
    }

    if (!document.pictureInPictureElement) {
      await pipVideoElement.requestPictureInPicture();
    }
  } catch (e) {
    console.warn('Canvas PiP request failed', e);
  }
};
