"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export interface BookingPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_active: boolean;
  brand_color: string;
  slot_duration: number;
  buffer_minutes: number;
  min_notice_hours: number;
  max_days_ahead: number;
  qualification_fields: QualificationField[];
  timezone: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QualificationField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "textarea";
  required: boolean;
  options?: string[]; // pour type "select"
}

export interface BookingAvailability {
  id: string;
  booking_page_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface BookingException {
  id: string;
  booking_page_id: string;
  exception_date: string;
  type: string;
  reason: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_page_id: string;
  prospect_name: string;
  prospect_email: string | null;
  prospect_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  qualification_answers: Record<string, string>;
  google_event_id: string | null;
  meet_link: string | null;
  created_at: string;
  updated_at: string;
  booking_page?: BookingPage | null;
}

export interface BookingKPIs {
  views: number;
  contacts: number;
  bookings: number;
  conversionRate: number;
}

// ─── Admin: Liste des pages de booking ──────────────────────

export function useBookingPages() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["booking-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_pages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingPage[];
    },
  });
}

// ─── Public: Page par slug ──────────────────────────────────

export function useBookingPageBySlug(slug: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["booking-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_pages")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data as BookingPage;
    },
    enabled: !!slug,
  });
}

// ─── Admin: Creer une page ──────────────────────────────────

export function useCreateBookingPage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      page: Partial<BookingPage> & { slug: string; title: string },
    ) => {
      const { data, error } = await supabase
        .from("booking_pages")
        .insert(page as never)
        .select()
        .single();
      if (error) throw error;
      return data as BookingPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-pages"] });
      toast.success("Page de booking creee");
    },
    onError: (err: Error) => {
      if (err.message?.includes("duplicate")) {
        toast.error("Ce slug est deja utilise");
      } else {
        toast.error("Erreur lors de la creation");
      }
    },
  });
}

// ─── Admin: Mettre a jour une page ──────────────────────────

export function useUpdateBookingPage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<BookingPage> & { id: string }) => {
      const { data, error } = await supabase
        .from("booking_pages")
        .update({ ...updates, updated_at: new Date().toISOString() } as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as BookingPage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["booking-pages"] });
      queryClient.invalidateQueries({ queryKey: ["booking-page", data.slug] });
      toast.success("Page mise a jour");
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });
}

// ─── Admin: Supprimer une page ──────────────────────────────

export function useDeleteBookingPage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("booking_pages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-pages"] });
      toast.success("Page supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

// ─── Disponibilites hebdo ───────────────────────────────────

export function useBookingAvailability(pageId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["booking-availability", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_availability")
        .select("*")
        .eq("booking_page_id", pageId!)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data as BookingAvailability[];
    },
    enabled: !!pageId,
  });
}

export function useUpsertAvailability() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      slots: Omit<BookingAvailability, "id" | "created_at">[],
    ) => {
      // Supprimer les anciens pour cette page, puis inserer les nouveaux
      if (slots.length === 0) return;
      const pageId = slots[0].booking_page_id;

      const { error: delError } = await supabase
        .from("booking_availability")
        .delete()
        .eq("booking_page_id", pageId);
      if (delError) throw delError;

      const { error } = await supabase
        .from("booking_availability")
        .insert(slots as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-availability"] });
      toast.success("Disponibilites mises a jour");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}

// ─── Exceptions (jours bloques) ─────────────────────────────

export function useBookingExceptions(pageId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["booking-exceptions", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_exceptions")
        .select("*")
        .eq("booking_page_id", pageId!)
        .order("exception_date");
      if (error) throw error;
      return data as BookingException[];
    },
    enabled: !!pageId,
  });
}

export function useAddBookingException() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exc: {
      booking_page_id: string;
      exception_date: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("booking_exceptions")
        .insert({ ...exc, type: "blocked" } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-exceptions"] });
      toast.success("Exception ajoutee");
    },
    onError: () => toast.error("Erreur"),
  });
}

export function useRemoveBookingException() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("booking_exceptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-exceptions"] });
      toast.success("Exception supprimee");
    },
  });
}

// ─── Public: Creneaux disponibles pour une date ─────────────

export function useAvailableSlots(
  pageId: string | undefined,
  date: string | undefined,
) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["available-slots", pageId, date],
    queryFn: async () => {
      // 1. Recuperer la page pour les parametres
      const { data: page, error: pageErr } = await supabase
        .from("booking_pages")
        .select("*")
        .eq("id", pageId!)
        .single();
      if (pageErr) throw pageErr;

      const bookingPage = page as BookingPage;
      const selectedDate = new Date(date!);
      const dayOfWeek = selectedDate.getDay();

      // 2. Recuperer les dispos pour ce jour
      const { data: avail, error: availErr } = await supabase
        .from("booking_availability")
        .select("*")
        .eq("booking_page_id", pageId!)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true);
      if (availErr) throw availErr;

      // 3. Verifier si ce jour est bloque
      const { data: exceptions } = await supabase
        .from("booking_exceptions")
        .select("*")
        .eq("booking_page_id", pageId!)
        .eq("exception_date", date!);

      if (exceptions && exceptions.length > 0) return [];

      // 4. Recuperer les bookings existants pour cette date
      const { data: existing } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("booking_page_id", pageId!)
        .eq("date", date!)
        .in("status", ["confirmed", "pending"]);

      const takenSlots = new Set(
        (existing ?? []).map((b: { start_time: string }) => b.start_time),
      );

      // 5. Generer les creneaux
      const slots: { start_time: string; end_time: string }[] = [];
      const now = new Date();
      const minNotice = new Date(
        now.getTime() + bookingPage.min_notice_hours * 60 * 60 * 1000,
      );

      for (const slot of avail as BookingAvailability[]) {
        const startParts = slot.start_time.split(":").map(Number);
        const endParts = slot.end_time.split(":").map(Number);
        const startMin = startParts[0] * 60 + startParts[1];
        const endMin = endParts[0] * 60 + endParts[1];

        for (
          let m = startMin;
          m + bookingPage.slot_duration <= endMin;
          m += bookingPage.slot_duration + bookingPage.buffer_minutes
        ) {
          const hours = Math.floor(m / 60)
            .toString()
            .padStart(2, "0");
          const mins = (m % 60).toString().padStart(2, "0");
          const timeStr = `${hours}:${mins}`;

          const endM = m + bookingPage.slot_duration;
          const endH = Math.floor(endM / 60)
            .toString()
            .padStart(2, "0");
          const endMn = (endM % 60).toString().padStart(2, "0");
          const endTimeStr = `${endH}:${endMn}`;

          // Verifier min notice
          const slotDateTime = new Date(`${date}T${timeStr}:00`);
          if (slotDateTime <= minNotice) continue;

          // Verifier si deja pris
          if (takenSlots.has(timeStr)) continue;

          slots.push({ start_time: timeStr, end_time: endTimeStr });
        }
      }

      return slots;
    },
    enabled: !!pageId && !!date,
  });
}

// ─── Public: Creer une reservation ──────────────────────────

export function useCreateBooking() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: {
      booking_page_id: string;
      prospect_name: string;
      prospect_email?: string;
      prospect_phone?: string;
      date: string;
      start_time: string;
      end_time: string;
      qualification_answers?: Record<string, string>;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...booking, status: "confirmed" } as never)
        .select()
        .single();
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: () => toast.error("Erreur lors de la reservation"),
  });
}

// ─── Public: Tracker une vue ────────────────────────────────

export function useTrackPageView() {
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (bookingPageId: string) => {
      await supabase
        .from("booking_page_views")
        .insert({ booking_page_id: bookingPageId } as never);
    },
  });
}

// ─── Admin: Liste des reservations ──────────────────────────

export function useBookings(filters?: {
  pageId?: string;
  status?: string;
  limit?: number;
}) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select("*, booking_page:booking_pages(id, title, slug)")
        .order("created_at", { ascending: false });

      if (filters?.pageId) {
        query = query.eq("booking_page_id", filters.pageId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Booking[];
    },
  });
}

// ─── Admin: KPIs ────────────────────────────────────────────

export function useBookingKPIs(
  pageId?: string,
  period?: "7d" | "30d" | "90d" | "all",
) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["booking-kpis", pageId, period],
    queryFn: async () => {
      let fromDate: string | null = null;
      if (period && period !== "all") {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
        const d = new Date();
        d.setDate(d.getDate() - days);
        fromDate = d.toISOString();
      }

      // Vues
      let viewsQuery = supabase
        .from("booking_page_views")
        .select("id", { count: "exact", head: true });
      if (pageId) viewsQuery = viewsQuery.eq("booking_page_id", pageId);
      if (fromDate) viewsQuery = viewsQuery.gte("created_at", fromDate);
      const { count: views } = await viewsQuery;

      // Bookings
      let bookingsQuery = supabase
        .from("bookings")
        .select("id, prospect_email, prospect_phone", { count: "exact" });
      if (pageId) bookingsQuery = bookingsQuery.eq("booking_page_id", pageId);
      if (fromDate) bookingsQuery = bookingsQuery.gte("created_at", fromDate);
      const { data: bookingsData, count: bookingsCount } = await bookingsQuery;

      // Contacts uniques (avec email ou telephone)
      const uniqueContacts = new Set<string>();
      (bookingsData ?? []).forEach(
        (b: {
          prospect_email: string | null;
          prospect_phone: string | null;
        }) => {
          if (b.prospect_email) uniqueContacts.add(b.prospect_email);
          else if (b.prospect_phone) uniqueContacts.add(b.prospect_phone);
        },
      );

      const totalViews = views ?? 0;
      const totalBookings = bookingsCount ?? 0;
      const conversionRate =
        totalViews > 0 ? (totalBookings / totalViews) * 100 : 0;

      return {
        views: totalViews,
        contacts: uniqueContacts.size,
        bookings: totalBookings,
        conversionRate: Math.round(conversionRate * 10) / 10,
      } as BookingKPIs;
    },
  });
}

// ─── Admin: Mettre a jour le statut d'une reservation ───────

export function useUpdateBookingStatus() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-kpis"] });
      toast.success("Statut mis a jour");
    },
    onError: () => toast.error("Erreur"),
  });
}
