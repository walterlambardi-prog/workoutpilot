import React, { useEffect, useRef, useState } from "react";

// Serve model + WASM locally (copied into public/) to avoid CORS/404 issues in Expo web dev server.
const POSE_MODEL_URL = "/models/pose_landmarker_full.task";
const WASM_BASE_URL = "/mediapipe";

type Status = "idle" | "loading" | "ready" | "running" | "error";

export default function ExercisesWebScreen() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    "Permite la cámara y presiona " + '"Iniciar webcam".',
  );
  const [stats, setStats] = useState<{
    poseCount?: number;
  } | null>(null);
  const poseRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        setStatus("loading");
        const vision = await import("@mediapipe/tasks-vision");
        const { FilesetResolver, PoseLandmarker } = vision;
        const resolver = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
        const poseLandmarker = await PoseLandmarker.createFromOptions(
          resolver,
          {
            baseOptions: {
              modelAssetPath: POSE_MODEL_URL,
            },
            runningMode: "VIDEO",
            numPoses: 1,
          },
        );
        if (cancelled) {
          poseLandmarker.close?.();
          return;
        }
        poseRef.current = poseLandmarker;
        setStatus("ready");
        setMessage('Modelo cargado. Presiona "Iniciar webcam".');
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.message ?? "Error al cargar el modelo");
      }
    }

    loadModel();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current ?? 0);
      poseRef.current?.close?.();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current ?? 0);
    rafRef.current = undefined;
    streamRef.current?.getTracks()?.forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("ready");
    setMessage("Webcam detenida.");
  };

  const processFrame = () => {
    const video = videoRef.current;
    const poseLandmarker = poseRef.current;
    const canvas = canvasRef.current;
    if (!video) return;
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();

    if (poseLandmarker && canvas) {
      const { videoWidth, videoHeight } = video;
      if (!videoWidth || !videoHeight) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw landmarks over the video feed to visualize the pose.
      const result = poseLandmarker.detectForVideo(video, now);
      const landmarks = result?.landmarks?.[0];
      if (landmarks) {
        // Simple skeleton connections (subset for clarity)
        const pairs: [number, number][] = [
          [11, 13],
          [13, 15], // Left arm
          [12, 14],
          [14, 16], // Right arm
          [11, 12], // Shoulders
          [11, 23],
          [12, 24], // Torso
          [23, 24],
          [23, 25],
          [25, 27], // Left leg
          [24, 26],
          [26, 28], // Right leg
        ];

        const project = (lm: any) => ({
          x: lm.x * canvas.width,
          y: lm.y * canvas.height,
        });

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.fillStyle = "#f472b6";

        pairs.forEach(([a, b]) => {
          const p1 = project(landmarks[a]);
          const p2 = project(landmarks[b]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        landmarks.forEach((lm: any) => {
          const { x, y } = project(lm);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        setStats({ poseCount: 1 });
        setMessage("Landmarks en vivo");
      } else {
        setStats({ poseCount: 0 });
        setMessage("Sin pose detectada");
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  };

  const startCamera = async () => {
    if (!poseRef.current) {
      setMessage("Modelo aún no listo");
      return;
    }

    try {
      setStatus("running");
      setMessage("Solicitando acceso a la webcam...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setMessage("Procesando...");
      rafRef.current = requestAnimationFrame(processFrame);
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message ?? "No se pudo iniciar la webcam");
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Exercises (web)</h1>
          <p style={styles.subtitle}>
            Demo rápida con @mediapipe/tasks-vision (ImageSegmenter).
          </p>
        </header>

        <div style={styles.row}>
          <div style={styles.actions}>
            <button
              onClick={startCamera}
              disabled={status !== "ready"}
              style={styles.button}
            >
              {status === "loading"
                ? "Cargando modelo..."
                : status === "running"
                  ? "Procesando..."
                  : "Iniciar webcam"}
            </button>
            <button
              onClick={stopCamera}
              disabled={status !== "running"}
              style={styles.secondaryButton}
            >
              Detener
            </button>
            <div style={styles.status}>
              <strong>Status:</strong> {status}
            </div>
            <div style={styles.message}>{message}</div>
            {stats && (
              <div style={styles.statsBox}>
                {typeof stats.poseCount === "number" && (
                  <div>
                    <strong>Poses:</strong> {stats.poseCount}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.overlayColumn}>
            <div style={styles.overlayLabel}>Webcam</div>
            <div style={styles.videoShell}>
              <video ref={videoRef} style={styles.video} playsInline muted />
              <canvas ref={canvasRef} style={styles.canvas} />
            </div>
          </div>
        </div>

        <footer style={styles.footer}>
          <ul>
            <li>Modelo y WASM se sirven desde /public.</li>
            <li>Pose usa PoseLandmarker y dibuja 33 joints sobre el canvas.</li>
            <li>RequestAnimationFrame mantiene la detección en vivo.</li>
          </ul>
        </footer>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "32px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    minHeight: "100vh",
    color: "#e2e8f0",
    overflowY: "auto",
  },
  card: {
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#0b1220",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    border: "1px solid #1f2937",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#f8fafc",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#cbd5e1",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "16px",
    alignItems: "start",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    padding: "16px",
  },
  button: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#38bdf8",
    color: "#0b1220",
    fontWeight: 700,
    fontSize: "16px",
  },
  secondaryButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #334155",
    cursor: "pointer",
    background: "transparent",
    color: "#e2e8f0",
    fontWeight: 600,
    fontSize: "15px",
  },
  status: {
    fontSize: "14px",
    color: "#cbd5e1",
  },
  message: {
    fontSize: "14px",
    color: "#e2e8f0",
    minHeight: "20px",
  },
  footer: {
    marginTop: "12px",
    color: "#94a3b8",
  },
  overlayColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  overlayLabel: {
    color: "#cbd5e1",
    fontSize: "14px",
  },
  videoShell: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #1f2937",
    background: "#0f172a",
    minHeight: "320px",
  },
  video: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
    zIndex: 1,
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 2,
  },
  statsBox: {
    display: "flex",
    gap: "12px",
    fontSize: "14px",
    color: "#cbd5e1",
  },
};
