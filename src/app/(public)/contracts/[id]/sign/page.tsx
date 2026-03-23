"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Download,
  Loader2,
  AlertTriangle,
  PenLine,
  RotateCcw,
  Type,
  Paintbrush,
} from "lucide-react";
import type { Contract } from "@/types/billing";

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SignatureMode = "draw" | "type";

export default function PublicContractSignPage() {
  const params = useParams();
  const id = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  // Signature state
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [typedName, setTypedName] = useState("");

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Load contract via public API (no auth required)
  useEffect(() => {
    async function loadContract() {
      try {
        const res = await fetch(`/api/contracts/${id}/public`);
        if (!res.ok) {
          setError("Contrat introuvable ou lien invalide.");
          return;
        }
        const data = await res.json();
        setContract(data as Contract);

        if (data.status === "signed") {
          setSigned(true);
          setSignedAt(data.signed_at);
        }
      } catch {
        setError("Erreur lors du chargement du contrat.");
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [id]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#1a1a1a";
    }
  }, [signatureMode]);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
  };

  // Generate typed signature as canvas data URL
  const generateTypedSignature = (): string | null => {
    if (!typedName.trim()) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 150);
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "italic 36px 'Georgia', 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName.trim(), 200, 75);

    return canvas.toDataURL("image/png");
  };

  const getSignatureImage = (): string | null => {
    if (signatureMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return null;
      return canvas.toDataURL("image/png");
    }
    return generateTypedSignature();
  };

  const canSign =
    contract?.status === "sent" &&
    ((signatureMode === "draw" && hasDrawn) ||
      (signatureMode === "type" && typedName.trim().length > 0));

  const handleSign = async () => {
    if (!canSign || signing) return;

    const signatureImage = getSignatureImage();
    if (!signatureImage) return;

    setSigning(true);
    try {
      const res = await fetch(`/api/contracts/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature_image: signatureImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la signature.");
        return;
      }

      // Refresh contract to get the stored signature_image
      const refreshRes = await fetch(`/api/contracts/${id}/public`);
      if (refreshRes.ok) {
        const refreshed = await refreshRes.json();
        setContract(refreshed as Contract);
      }
      setSigned(true);
      setSignedAt(data.signed_at);
    } catch {
      setError("Erreur de connexion. Veuillez reessayer.");
    } finally {
      setSigning(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#AF0000] animate-spin mx-auto mb-3" />
          <p className="text-sm text-white/60">Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !contract) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">
            Contrat introuvable
          </h1>
          <p className="text-sm text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) return null;

  // Signed success state
  if (signed) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Contrat signe !
            </h1>
            <p className="text-sm text-white/60">
              Merci, votre signature a bien ete enregistree
              {signedAt ? ` le ${formatDate(signedAt)}` : ""}.
            </p>
          </div>

          {/* Contract summary */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-1">
              {contract.title}
            </h2>
            <p className="text-sm text-white/60 mb-4">
              {contract.client?.full_name}
            </p>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-4 text-sm text-white/60 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {contract.content}
            </div>
          </div>

          {/* Signature image */}
          {contract.signature_image && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 mb-6">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
                Signature
              </h3>
              <div className="bg-white rounded-xl p-4 flex items-center justify-center">
                <img
                  src={contract.signature_image}
                  alt="Signature"
                  className="max-h-32 object-contain"
                />
              </div>
              {signedAt && (
                <p className="text-xs text-white/40 text-center mt-2">
                  Signé le {formatDate(signedAt)}
                </p>
              )}
            </div>
          )}

          {/* Download button */}
          <div className="text-center">
            <a
              href={`/api/contracts/${contract.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 bg-[#AF0000] text-white rounded-lg text-sm font-medium hover:bg-[#8B0000] transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger le PDF
            </a>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/40 text-center mt-8">
            Off-Market — Plateforme de Coaching & Gestion Business
          </p>
        </div>
      </div>
    );
  }

  // Already cancelled
  if (contract.status === "cancelled") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">
            Contrat annule
          </h1>
          <p className="text-sm text-white/60">
            Ce contrat a ete annule et ne peut plus etre signe.
          </p>
        </div>
      </div>
    );
  }

  // Draft state (not yet sent)
  if (contract.status === "draft") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">
            Contrat en preparation
          </h1>
          <p className="text-sm text-white/60">
            Ce contrat n&apos;a pas encore ete envoye pour signature. Veuillez
            patienter.
          </p>
        </div>
      </div>
    );
  }

  // Main signing page (status === "sent")
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#AF0000]/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-[#AF0000]" />
          </div>
          <h1 className="text-xl font-semibold text-white">
            {contract.title}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Prepare pour {contract.client?.full_name ?? "vous"} le{" "}
            {formatDate(contract.created_at)}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Contract content */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 md:p-8 mb-6">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Contenu du contrat
          </h2>
          <div className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
            {contract.content}
          </div>
        </div>

        {/* Expiry notice */}
        {contract.end_date && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 text-center">
            <p className="text-xs text-amber-400">
              Ce contrat expire le {formatDate(contract.end_date)}. Veuillez
              le signer avant cette date.
            </p>
          </div>
        )}

        {/* Signature section */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-4 h-4 text-white/60" />
            <h2 className="text-sm font-medium text-white">
              Signature electronique
            </h2>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-white/[0.04] border border-white/[0.08] rounded-lg">
            <button
              onClick={() => setSignatureMode("draw")}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium transition-colors ${
                signatureMode === "draw"
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Dessiner
            </button>
            <button
              onClick={() => setSignatureMode("type")}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium transition-colors ${
                signatureMode === "type"
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Taper
            </button>
          </div>

          {/* Draw mode */}
          {signatureMode === "draw" && (
            <div className="space-y-3">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 bg-white border-2 border-dashed border-white/[0.08] rounded-xl cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-sm text-gray-400">
                      Dessinez votre signature ici
                    </p>
                  </div>
                )}
                <button
                  onClick={clearCanvas}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 hover:bg-gray-100 transition-colors"
                  title="Effacer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          )}

          {/* Type mode */}
          {signatureMode === "type" && (
            <div className="space-y-3">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Tapez votre nom complet"
                className="w-full h-12 px-4 bg-white/[0.04] border-2 border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#AF0000] transition-colors"
              />
              {typedName.trim() && (
                <div className="h-24 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center">
                  <p
                    className="text-3xl text-white"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontStyle: "italic",
                    }}
                  >
                    {typedName.trim()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Legal text */}
          <p className="text-xs text-white/40 text-center mt-4">
            En signant, vous acceptez les termes du contrat ci-dessus. Votre
            adresse IP et navigateur seront enregistres comme preuve.
          </p>
        </div>

        {/* Sign button */}
        <button
          onClick={handleSign}
          disabled={!canSign || signing}
          className="w-full h-12 bg-[#AF0000] text-white rounded-xl text-sm font-semibold hover:bg-[#8B0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {signing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signature en cours...
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" />
              Signer le contrat
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-white/40 text-center mt-6">
          Off-Market — Plateforme de Coaching & Gestion Business
        </p>
      </div>
    </div>
  );
}
