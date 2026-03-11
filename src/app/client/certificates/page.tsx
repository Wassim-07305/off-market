"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useCertificates } from "@/hooks/use-certificates";
import { CertificateCard } from "@/components/school/certificate-card";
import { Award } from "lucide-react";

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useCertificates();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Mes certificats
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Formations completees et certifications obtenues
            </p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-surface rounded-2xl animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          ))}
        </div>
      ) : !certificates || certificates.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-12 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun certificat pour le moment. Completez une formation pour
            obtenir votre premier certificat !
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
