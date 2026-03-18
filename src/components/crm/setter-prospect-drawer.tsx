"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Target,
  AlertCircle,
  CalendarClock,
  DollarSign,
  StickyNote,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { SetterLead, PipelineColumn } from "@/types/setter-crm";
import {
  useUpdateSetterLead,
  useDeleteSetterLead,
} from "@/hooks/use-setter-crm";

interface SetterProspectDrawerProps {
  open: boolean;
  onClose: () => void;
  lead: SetterLead | null;
  columns: PipelineColumn[];
}

export function SetterProspectDrawer({
  open,
  onClose,
  lead,
  columns,
}: SetterProspectDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const updateLead = useUpdateSetterLead();
  const deleteLead = useDeleteSetterLead();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [objective, setObjective] = useState("");
  const [pain, setPain] = useState("");
  const [relanceDate, setRelanceDate] = useState("");
  const [contractedRevenue, setContractedRevenue] = useState(0);
  const [collectedRevenue, setCollectedRevenue] = useState(0);
  const [notes, setNotes] = useState("");
  const [columnId, setColumnId] = useState("");

  // Sync form with lead
  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setPhone(lead.phone ?? "");
      setEmail(lead.email ?? "");
      setInstagram(lead.instagram_handle ?? "");
      setLinkedin(lead.linkedin_handle ?? "");
      setObjective(lead.objectif ?? "");
      setPain(lead.douleur ?? "");
      setRelanceDate(lead.date_relance ?? "");
      setContractedRevenue(lead.ca_contracte ?? 0);
      setCollectedRevenue(lead.ca_collecte ?? 0);
      setNotes(lead.notes ?? "");
      setColumnId(lead.column_id);
    }
  }, [lead]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  function handleSave() {
    if (!lead) return;
    if (!name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    updateLead.mutate(
      {
        id: lead.id,
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        instagram_handle: instagram || null,
        linkedin_handle: linkedin || null,
        objectif: objective || null,
        douleur: pain || null,
        date_relance: relanceDate || null,
        ca_contracte: contractedRevenue,
        ca_collecte: collectedRevenue,
        notes: notes || null,
        column_id: columnId,
      },
      {
        onSuccess: () => {
          toast.success("Prospect mis a jour");
          onClose();
        },
      },
    );
  }

  function handleDelete() {
    if (!lead) return;
    deleteLead.mutate(lead.id, {
      onSuccess: () => {
        toast.success("Prospect supprime");
        onClose();
      },
    });
  }

  if (!open || !lead) return null;

  const columnOptions = columns.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border shadow-2xl",
          "animate-in slide-in-from-right duration-300",
          "flex flex-col",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            Fiche prospect
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLead.isPending}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              {deleteLead.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Colonne */}
          <Select
            label="Colonne"
            options={columnOptions}
            value={columnId}
            onChange={setColumnId}
          />

          {/* Nom */}
          <Input
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            placeholder="Nom du prospect"
          />

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telephone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              placeholder="+33..."
            />
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              placeholder="email@..."
              type="email"
            />
          </div>

          {/* Reseaux */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              icon={<Instagram className="w-4 h-4" />}
              placeholder="@handle"
            />
            <Input
              label="LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              icon={<Linkedin className="w-4 h-4" />}
              placeholder="URL LinkedIn"
            />
          </div>

          {/* Objectif & Douleur */}
          <Input
            label="Objectif"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            icon={<Target className="w-4 h-4" />}
            placeholder="Objectif du prospect"
          />
          <Input
            label="Douleur / Problematique"
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            icon={<AlertCircle className="w-4 h-4" />}
            placeholder="Point de douleur principal"
          />

          {/* Date relance */}
          <Input
            label="Date de relance"
            type="date"
            value={relanceDate}
            onChange={(e) => setRelanceDate(e.target.value)}
            icon={<CalendarClock className="w-4 h-4" />}
          />

          {/* Revenue */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="CA contracte (EUR)"
              type="number"
              value={String(contractedRevenue)}
              onChange={(e) =>
                setContractedRevenue(Number(e.target.value) || 0)
              }
              icon={<DollarSign className="w-4 h-4" />}
              min={0}
            />
            <Input
              label="CA collecte (EUR)"
              type="number"
              value={String(collectedRevenue)}
              onChange={(e) => setCollectedRevenue(Number(e.target.value) || 0)}
              icon={<DollarSign className="w-4 h-4" />}
              min={0}
            />
          </div>

          {/* Notes */}
          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes sur le prospect..."
            autoGrow
          />

          {/* Meta */}
          <div className="text-xs text-muted-foreground space-y-0.5 pt-2 border-t border-border">
            <p>
              Cree le{" "}
              {format(new Date(lead.created_at), "d MMMM yyyy 'a' HH:mm", {
                locale: fr,
              })}
            </p>
            {lead.updated_at && (
              <p>
                Modifie le{" "}
                {format(new Date(lead.updated_at), "d MMMM yyyy 'a' HH:mm", {
                  locale: fr,
                })}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-5 py-4 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} loading={updateLead.isPending}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
