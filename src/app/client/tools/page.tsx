"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Calculator,
  Euro,
  Clock,
  Target,
  TrendingUp,
  Info,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Briefcase,
  PiggyBank,
  CalendarDays,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────

interface PricingInputs {
  monthlyCharges: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  profitMargin: number;
  targetMonthlyRevenue: number;
  avgProjectHours: number;
}

interface PricingResult {
  hourlyRate: number;
  dailyRate: number;
  projectRate: number;
  monthlyHours: number;
  effectiveMonths: number;
  breakEvenHourly: number;
}

// ─── Constants ─────────────────────────────────────────────────

const DEFAULT_INPUTS: PricingInputs = {
  monthlyCharges: 800,
  hoursPerWeek: 35,
  weeksPerYear: 45,
  profitMargin: 30,
  targetMonthlyRevenue: 10000,
  avgProjectHours: 20,
};

const CHARGE_PRESETS = [
  { label: "Micro-entrepreneur", value: 500 },
  { label: "EURL / SASU", value: 1500 },
  { label: "Avec local", value: 2500 },
];

// ─── Calculator Logic ──────────────────────────────────────────

function calculatePricing(inputs: PricingInputs): PricingResult {
  const effectiveMonths = inputs.weeksPerYear / (52 / 12);
  const monthlyHours = (inputs.hoursPerWeek * inputs.weeksPerYear) / 12;
  const billableHours = monthlyHours * 0.7; // 70% billable

  // Break-even: just cover charges
  const breakEvenHourly = inputs.monthlyCharges / billableHours;

  // Target rate: cover charges + profit margin + reach target revenue
  const totalMonthlyNeeded =
    inputs.monthlyCharges + inputs.targetMonthlyRevenue * (1 + inputs.profitMargin / 100) - inputs.targetMonthlyRevenue;
  const hourlyFromTarget = inputs.targetMonthlyRevenue / billableHours;
  const hourlyWithMargin = hourlyFromTarget * (1 + inputs.profitMargin / 100);

  // Final hourly = max of break-even and target-based
  const hourlyRate = Math.max(breakEvenHourly, hourlyWithMargin);
  const dailyRate = hourlyRate * 7; // standard 7h day
  const projectRate = hourlyRate * inputs.avgProjectHours;

  return {
    hourlyRate: Math.ceil(hourlyRate),
    dailyRate: Math.ceil(dailyRate / 10) * 10, // round to nearest 10
    projectRate: Math.ceil(projectRate / 50) * 50, // round to nearest 50
    monthlyHours: Math.round(billableHours),
    effectiveMonths: Math.round(effectiveMonths * 10) / 10,
    breakEvenHourly: Math.ceil(breakEvenHourly),
  };
}

// ─── Components ────────────────────────────────────────────────

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: typeof Euro;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Icon className="w-4 h-4 text-zinc-500" />
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            className="w-20 text-right bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/40"
          />
          <span className="text-xs text-zinc-500 w-8">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-red-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      {hint && (
        <p className="text-[11px] text-zinc-600 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  subtitle,
  highlighted,
}: {
  label: string;
  value: string;
  subtitle?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-center transition-all",
        highlighted
          ? "bg-red-500/10 border-red-500/30"
          : "bg-zinc-900/60 border-zinc-800/60"
      )}
    >
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p
        className={cn(
          "text-2xl font-bold",
          highlighted ? "text-red-400" : "text-white"
        )}
      >
        {value}
      </p>
      {subtitle && <p className="text-[11px] text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function PricingCalculatorPage() {
  const [inputs, setInputs] = useState<PricingInputs>(DEFAULT_INPUTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const result = useMemo(() => calculatePricing(inputs), [inputs]);

  const updateInput = <K extends keyof PricingInputs>(
    key: K,
    value: PricingInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setInputs(DEFAULT_INPUTS);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-red-400" />
          </div>
          Calculateur de tarif
        </h1>
        <p className="text-zinc-400 mt-2">
          Determine ton tarif optimal en fonction de tes charges, tes objectifs
          et ton temps disponible.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Inputs (3 cols) */}
        <motion.div
          className="lg:col-span-3 space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Charges presets */}
          <motion.div
            variants={staggerItem}
            className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-zinc-500" />
              Charges mensuelles
            </h2>
            <div className="flex gap-2 flex-wrap">
              {CHARGE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateInput("monthlyCharges", preset.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    inputs.monthlyCharges === preset.value
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : "bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  {preset.label} — {preset.value}\u20AC
                </button>
              ))}
            </div>
            <SliderInput
              label="Charges fixes"
              value={inputs.monthlyCharges}
              onChange={(v) => updateInput("monthlyCharges", v)}
              min={0}
              max={5000}
              step={50}
              unit="\u20AC"
              icon={Euro}
              hint="Loyer, assurances, logiciels, comptable, URSSAF, etc."
            />
          </motion.div>

          {/* Time */}
          <motion.div
            variants={staggerItem}
            className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              Temps de travail
            </h2>
            <SliderInput
              label="Heures par semaine"
              value={inputs.hoursPerWeek}
              onChange={(v) => updateInput("hoursPerWeek", v)}
              min={10}
              max={60}
              step={1}
              unit="h"
              icon={Clock}
            />
            <SliderInput
              label="Semaines travaillees par an"
              value={inputs.weeksPerYear}
              onChange={(v) => updateInput("weeksPerYear", v)}
              min={30}
              max={52}
              step={1}
              unit="sem"
              icon={CalendarDays}
              hint="En general 45-47 semaines (5-7 semaines de vacances)"
            />
          </motion.div>

          {/* Objectives */}
          <motion.div
            variants={staggerItem}
            className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-zinc-500" />
              Objectifs
            </h2>
            <SliderInput
              label="Objectif de CA mensuel"
              value={inputs.targetMonthlyRevenue}
              onChange={(v) => updateInput("targetMonthlyRevenue", v)}
              min={1000}
              max={30000}
              step={500}
              unit="\u20AC"
              icon={TrendingUp}
            />
            <SliderInput
              label="Marge beneficiaire souhaitee"
              value={inputs.profitMargin}
              onChange={(v) => updateInput("profitMargin", v)}
              min={0}
              max={60}
              step={5}
              unit="%"
              icon={Briefcase}
              hint="La marge au-dela de ton objectif de CA (securite, epargne, investissement)"
            />
          </motion.div>

          {/* Advanced */}
          <motion.div variants={staggerItem}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Parametres avances
            </button>
            {showAdvanced && (
              <div className="mt-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
                <SliderInput
                  label="Heures moyennes par projet"
                  value={inputs.avgProjectHours}
                  onChange={(v) => updateInput("avgProjectHours", v)}
                  min={1}
                  max={100}
                  step={1}
                  unit="h"
                  icon={Briefcase}
                  hint="Pour calculer ton tarif par projet/mission"
                />
              </div>
            )}
          </motion.div>

          {/* Reset */}
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reinitialiser les valeurs
          </button>
        </motion.div>

        {/* Right: Results (2 cols) */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-8">
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300">
              Tarifs recommandes
            </h2>

            <ResultCard
              label="Taux horaire"
              value={formatCurrency(result.hourlyRate)}
              subtitle="Par heure facturee"
              highlighted
            />

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Taux journalier (TJM)"
                value={formatCurrency(result.dailyRate)}
                subtitle="Base 7h/jour"
              />
              <ResultCard
                label="Par projet"
                value={formatCurrency(result.projectRate)}
                subtitle={`Base ${inputs.avgProjectHours}h`}
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Detail</h2>
            <div className="space-y-2.5">
              {[
                {
                  label: "Heures facturables / mois",
                  value: `${result.monthlyHours}h`,
                  hint: "70% du temps total (30% admin, prospection, etc.)",
                },
                {
                  label: "Mois effectifs / an",
                  value: `${result.effectiveMonths}`,
                  hint: `${inputs.weeksPerYear} semaines travaillees`,
                },
                {
                  label: "Seuil de rentabilite",
                  value: `${formatCurrency(result.breakEvenHourly)}/h`,
                  hint: "Minimum pour couvrir tes charges",
                },
                {
                  label: "CA mensuel vise",
                  value: formatCurrency(inputs.targetMonthlyRevenue),
                  hint: `+ ${inputs.profitMargin}% de marge`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="text-xs text-zinc-400">{item.label}</p>
                    {item.hint && (
                      <p className="text-[10px] text-zinc-600">{item.hint}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white whitespace-nowrap">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              <strong>Conseil :</strong> Ces tarifs sont des minimums
              recommandes. N&apos;hesite pas a facturer au-dessus si ta valeur
              percue le justifie. Le prix doit refleter la transformation que tu
              apportes a ton client, pas juste ton temps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
