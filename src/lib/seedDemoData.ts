import { supabase } from './supabase'

const STORAGE_KEY = 'demo_data_ids'

interface DemoDataIds {
  profileIds: string[]
  clientIds: string[]
  leadIds: string[]
  callCalendarIds: string[]
  closerCallIds: string[]
  financialEntryIds: string[]
  paymentScheduleIds: string[]
  socialContentIds: string[]
  setterActivityIds: string[]
  interviewIds: string[]
  blockageIds: string[]
  instagramAccountIds: string[]
  instagramPostStatIds: string[]
  notificationIds: string[]
  clientAssignmentIds: string[]
}

function getStoredIds(): DemoDataIds | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DemoDataIds
  } catch {
    return null
  }
}

function storeIds(ids: DemoDataIds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function isDemoDataSeeded(): boolean {
  return getStoredIds() !== null
}

// Helper: date string YYYY-MM-DD offset from today
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function monthsAgo(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().split('T')[0]
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function isoTimestamp(daysOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysOffset)
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60))
  return d.toISOString()
}

// ============================================
// SEED
// ============================================
export async function seedDemoData(adminUserId: string): Promise<string> {
  const ids: DemoDataIds = {
    profileIds: [],
    clientIds: [],
    leadIds: [],
    callCalendarIds: [],
    closerCallIds: [],
    financialEntryIds: [],
    paymentScheduleIds: [],
    socialContentIds: [],
    setterActivityIds: [],
    interviewIds: [],
    blockageIds: [],
    instagramAccountIds: [],
    instagramPostStatIds: [],
    notificationIds: [],
    clientAssignmentIds: [],
  }

  try {
    // ── 1. Create demo profiles via RPC ──
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_demo_profiles',
      { admin_id: adminUserId }
    )
    if (rpcError) throw new Error(`RPC create_demo_profiles: ${rpcError.message}`)

    const profileIds = (rpcResult as any).profile_ids as string[]
    ids.profileIds = profileIds

    const karimId = profileIds[0]   // closer
    const sarahId = profileIds[1]   // setter
    const lucasId = profileIds[2]   // setter
    const emmaId = profileIds[3]    // coach
    const thomasId = profileIds[4]  // monteur

    // ── 2. Clients (8) ──
    const clientsToInsert = [
      { name: 'FitCoach Pro', email: 'contact@fitcoachpro.fr', phone: '06 12 34 56 78', status: 'actif', notes: 'Programme fitness haut de gamme', created_by: adminUserId },
      { name: 'Digital Academy', email: 'hello@digitalacademy.io', phone: '06 23 45 67 89', status: 'actif', notes: 'Formation marketing digital', created_by: adminUserId },
      { name: 'Invest Mastery', email: 'team@investmastery.fr', phone: '06 34 56 78 90', status: 'actif', notes: 'Coaching investissement immobilier', created_by: adminUserId },
      { name: 'MindSet Lab', email: 'info@mindsetlab.com', phone: '06 45 67 89 01', status: 'actif', notes: 'Développement personnel et mindset', created_by: adminUserId },
      { name: 'E-Com Empire', email: 'support@ecomempire.fr', phone: '06 56 78 90 12', status: 'actif', notes: 'Formation e-commerce Shopify', created_by: adminUserId },
      { name: 'Scale Agency', email: 'bonjour@scaleagency.fr', phone: '06 67 89 01 23', status: 'actif', notes: 'Agence SMMA', created_by: karimId },
      { name: 'Crypto Mentor', email: 'contact@cryptomentor.io', phone: '06 78 90 12 34', status: 'inactif', notes: 'Formation crypto-monnaies — en pause', created_by: adminUserId },
      { name: 'Wellness Studio', email: 'hello@wellnessstudio.fr', phone: '06 89 01 23 45', status: 'archivé', notes: 'Ancien client — bien-être', created_by: adminUserId },
    ]
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .insert(clientsToInsert)
      .select('id')
    if (clientsError) throw new Error(`Clients: ${clientsError.message}`)
    ids.clientIds = clientsData.map((c) => c.id)

    const [fitcoachId, digitalId, investId, mindsetId, ecomId, scaleId, cryptoId, wellnessId] = ids.clientIds

    // ── 3. Client assignments ──
    const assignmentsToInsert = [
      { client_id: fitcoachId, user_id: adminUserId, role: 'admin' as const },
      { client_id: fitcoachId, user_id: karimId, role: 'closer' as const },
      { client_id: fitcoachId, user_id: sarahId, role: 'setter' as const },
      { client_id: digitalId, user_id: adminUserId, role: 'admin' as const },
      { client_id: digitalId, user_id: lucasId, role: 'setter' as const },
      { client_id: investId, user_id: karimId, role: 'closer' as const },
      { client_id: investId, user_id: sarahId, role: 'setter' as const },
      { client_id: mindsetId, user_id: adminUserId, role: 'admin' as const },
      { client_id: mindsetId, user_id: emmaId, role: 'coach' as const },
      { client_id: ecomId, user_id: lucasId, role: 'setter' as const },
      { client_id: ecomId, user_id: karimId, role: 'closer' as const },
      { client_id: scaleId, user_id: thomasId, role: 'monteur' as const },
      { client_id: scaleId, user_id: sarahId, role: 'setter' as const },
      { client_id: cryptoId, user_id: adminUserId, role: 'admin' as const },
      { client_id: wellnessId, user_id: adminUserId, role: 'admin' as const },
    ]
    const { data: assignData, error: assignError } = await supabase
      .from('client_assignments')
      .insert(assignmentsToInsert)
      .select('id')
    if (assignError) throw new Error(`Assignments: ${assignError.message}`)
    ids.clientAssignmentIds = assignData.map((a) => a.id)

    // ── 4. Leads (30) ──
    const sources = ['instagram', 'linkedin', 'tiktok', 'referral', 'ads', 'autre'] as const
    const leadStatuses = ['à_relancer', 'booké', 'no_show', 'pas_intéressé', 'en_cours'] as const
    const clientStatuses = ['contacté', 'qualifié', 'proposé', 'closé', 'perdu'] as const
    const setters = [sarahId, lucasId, adminUserId]
    const clientPool = [fitcoachId, digitalId, investId, mindsetId, ecomId, scaleId]

    const leadNames = [
      'Antoine Girard', 'Camille Roux', 'Hugo Martin', 'Léa Bernard',
      'Maxime Petit', 'Julie Moreau', 'Nathan Thomas', 'Manon Richard',
      'Théo Garcia', 'Clara Durand', 'Louis Robert', 'Chloé Simon',
      'Arthur Laurent', 'Emma Michel', 'Lucas Lefebvre', 'Sarah Leroy',
      'Raphaël Roux', 'Zoé Morel', 'Gabriel Fournier', 'Inès Giraud',
      'Adam Bonnet', 'Jade Dupuis', 'Liam Lambert', 'Rose Fontaine',
      'Noah Rousseau', 'Alice Blanchard', 'Ethan Guérin', 'Lola Chevalier',
      'Tom Muller', 'Anna Perrin',
    ]

    // Distribute leads across 8 weeks for the chart
    // Week distribution: [2, 3, 5, 4, 6, 3, 5, 2] = 30 total
    const weekDistribution = [2, 3, 5, 4, 6, 3, 5, 2]
    const leadsToInsert: Array<Record<string, unknown>> = []
    let leadIdx = 0

    for (let weekOffset = 7; weekOffset >= 0; weekOffset--) {
      const count = weekDistribution[7 - weekOffset]
      for (let j = 0; j < count; j++) {
        const dayInWeek = Math.floor(Math.random() * 5) // Mon-Fri
        const daysBack = weekOffset * 7 + dayInWeek
        const statusIdx = leadIdx % 5
        const clientStatusIdx = leadIdx % 5
        const isBoosted = leadStatuses[statusIdx] === 'booké'

        leadsToInsert.push({
          name: leadNames[leadIdx],
          email: `${leadNames[leadIdx].toLowerCase().replace(' ', '.')}@email.com`,
          phone: `06 ${String(10 + leadIdx).padStart(2, '0')} ${String(20 + leadIdx).padStart(2, '0')} ${String(30 + leadIdx).padStart(2, '0')} ${String(40 + leadIdx).padStart(2, '0')}`,
          client_id: clientPool[leadIdx % clientPool.length],
          assigned_to: setters[leadIdx % setters.length],
          source: sources[leadIdx % sources.length],
          status: leadStatuses[statusIdx],
          client_status: clientStatuses[clientStatusIdx],
          ca_contracté: isBoosted ? (1500 + leadIdx * 200) : 0,
          ca_collecté: isBoosted ? (1000 + leadIdx * 100) : 0,
          commission_setter: isBoosted ? 150 : 0,
          commission_closer: isBoosted ? 300 : 0,
          notes: `Lead ${leadNames[leadIdx]} — source ${sources[leadIdx % sources.length]}`,
          created_at: new Date(new Date().getTime() - daysBack * 86400000).toISOString(),
        })
        leadIdx++
      }
    }

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select('id')
    if (leadsError) throw new Error(`Leads: ${leadsError.message}`)
    ids.leadIds = leadsData.map((l) => l.id)

    // ── 5. Call calendar (25) ──
    const callTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']
    const callTypes = ['manuel', 'iclosed', 'calendly', 'autre'] as const
    const callStatuses = ['réalisé', 'réalisé', 'réalisé', 'réalisé', 'réalisé', // 10 réalisés
      'réalisé', 'réalisé', 'réalisé', 'réalisé', 'réalisé',
      'no_show', 'no_show', 'no_show', 'no_show', 'no_show',               // 5 no_show
      'annulé', 'annulé',                                                     // 2 annulés
      'planifié', 'planifié', 'planifié', 'planifié',                        // 8 planifiés (futurs)
      'planifié', 'planifié', 'planifié', 'planifié',
    ] as const

    const callsToInsert = Array.from({ length: 25 }, (_, i) => {
      const isFuture = i >= 17
      const date = isFuture ? daysFromNow(1 + i - 17) : daysAgo(1 + Math.floor(i * 1.5))
      return {
        client_id: clientPool[i % clientPool.length],
        lead_id: ids.leadIds[i % ids.leadIds.length],
        assigned_to: i % 3 === 0 ? karimId : i % 3 === 1 ? sarahId : adminUserId,
        date,
        time: callTimes[i % callTimes.length],
        type: callTypes[i % callTypes.length],
        status: callStatuses[i],
        link: i % 4 === 1 ? 'https://meet.google.com/demo-call' : null,
        notes: `Call ${i + 1} — ${callStatuses[i]}`,
      }
    })

    const { data: callsData, error: callsError } = await supabase
      .from('call_calendar')
      .insert(callsToInsert)
      .select('id')
    if (callsError) throw new Error(`Call calendar: ${callsError.message}`)
    ids.callCalendarIds = callsData.map((c) => c.id)

    // ── 6. Closer calls (20) — Revenue chart data ──
    // Target monthly revenues: Sept:3500, Oct:7000, Nov:5500, Dec:9000, Jan:12500, Feb:8000
    const closerCallsData = [
      // September (5 months ago) — 3500€
      { date: monthsAgo(5), revenue: 2000, status: 'closé' as const },
      { date: monthsAgo(5), revenue: 1500, status: 'closé' as const },
      { date: monthsAgo(5), revenue: 0, status: 'non_closé' as const },
      // October (4 months ago) — 7000€
      { date: monthsAgo(4), revenue: 3500, status: 'closé' as const },
      { date: monthsAgo(4), revenue: 2500, status: 'closé' as const },
      { date: monthsAgo(4), revenue: 1000, status: 'closé' as const },
      { date: monthsAgo(4), revenue: 0, status: 'non_closé' as const },
      // November (3 months ago) — 5500€
      { date: monthsAgo(3), revenue: 3000, status: 'closé' as const },
      { date: monthsAgo(3), revenue: 2500, status: 'closé' as const },
      { date: monthsAgo(3), revenue: 0, status: 'non_closé' as const },
      // December (2 months ago) — 9000€
      { date: monthsAgo(2), revenue: 4000, status: 'closé' as const },
      { date: monthsAgo(2), revenue: 3000, status: 'closé' as const },
      { date: monthsAgo(2), revenue: 2000, status: 'closé' as const },
      { date: monthsAgo(2), revenue: 0, status: 'non_closé' as const },
      // January (1 month ago) — 12500€
      { date: monthsAgo(1), revenue: 5000, status: 'closé' as const },
      { date: monthsAgo(1), revenue: 4500, status: 'closé' as const },
      { date: monthsAgo(1), revenue: 3000, status: 'closé' as const },
      { date: monthsAgo(1), revenue: 0, status: 'non_closé' as const },
      // February (current month) — 8000€
      { date: daysAgo(5), revenue: 5000, status: 'closé' as const },
      { date: daysAgo(2), revenue: 3000, status: 'closé' as const },
    ]

    const closerCallsToInsert = closerCallsData.map((cc, i) => ({
      client_id: clientPool[i % clientPool.length],
      lead_id: ids.leadIds[i % ids.leadIds.length],
      closer_id: karimId,
      date: cc.date,
      status: cc.status,
      revenue: cc.revenue,
      nombre_paiements: cc.status === 'closé' ? (cc.revenue > 3000 ? 3 : 1) : 1,
      link: 'https://meet.google.com/closer-demo',
      debrief: cc.status === 'closé' ? 'Client convaincu, bonne énergie' : 'Pas de suite pour le moment',
      notes: `Closer call #${i + 1}`,
    }))

    const { data: closerData, error: closerError } = await supabase
      .from('closer_calls')
      .insert(closerCallsToInsert)
      .select('id')
    if (closerError) throw new Error(`Closer calls: ${closerError.message}`)
    ids.closerCallIds = closerData.map((c) => c.id)

    // ── 7. Setter activities (14 days × 2 setters × ~3 clients) ──
    const setterActivitiesToInsert: Array<Record<string, unknown>> = []

    for (let day = 0; day < 14; day++) {
      const date = daysAgo(day)
      const dayOfWeek = new Date(date).getDay() // 0=Sun, 6=Sat

      for (const setterId of [sarahId, lucasId, adminUserId]) {
        // Skip Sundays, low volume Saturday
        if (dayOfWeek === 0) continue

        const clientsForSetter = setterId === sarahId
          ? [fitcoachId, investId, scaleId]
          : setterId === lucasId
            ? [digitalId, ecomId, mindsetId]
            : [fitcoachId, digitalId, investId]

        for (const cId of clientsForSetter) {
          const baseMessages = dayOfWeek === 6
            ? 7 + Math.floor(Math.random() * 5)   // Saturday: 7-12
            : 28 + Math.floor(Math.random() * 15)  // Weekday: 28-42

          setterActivitiesToInsert.push({
            user_id: setterId,
            client_id: cId,
            date,
            messages_sent: baseMessages,
            notes: null,
          })
        }
      }
    }

    const { data: setterData, error: setterError } = await supabase
      .from('setter_activities')
      .insert(setterActivitiesToInsert)
      .select('id')
    if (setterError) throw new Error(`Setter activities: ${setterError.message}`)
    ids.setterActivityIds = setterData.map((s) => s.id)

    // ── 8. Financial entries (15) ──
    const financialEntries = [
      // CA entries
      { type: 'ca', label: 'Paiement FitCoach Pro — Janvier', amount: 5000, client_id: fitcoachId, is_paid: true, date: monthsAgo(1) },
      { type: 'ca', label: 'Paiement Digital Academy — Janvier', amount: 3500, client_id: digitalId, is_paid: true, date: monthsAgo(1) },
      { type: 'ca', label: 'Paiement Invest Mastery — Février', amount: 4500, client_id: investId, is_paid: true, date: daysAgo(10) },
      { type: 'ca', label: 'Paiement E-Com Empire — Février', amount: 3000, client_id: ecomId, is_paid: false, date: daysAgo(3) },
      // Récurrent
      { type: 'récurrent', label: 'Abonnement Off-Market', amount: 97, client_id: null, is_paid: true, date: daysAgo(1), recurrence: 'mensuel' },
      { type: 'récurrent', label: 'Hébergement serveurs', amount: 49, client_id: null, is_paid: true, date: daysAgo(1), recurrence: 'mensuel' },
      { type: 'récurrent', label: 'Suite Adobe Creative', amount: 59.99, client_id: null, is_paid: true, date: monthsAgo(1), recurrence: 'mensuel' },
      // Charges
      { type: 'charge', label: 'Pub Facebook Ads — Jan', amount: 1200, client_id: fitcoachId, is_paid: true, date: monthsAgo(1) },
      { type: 'charge', label: 'Pub Google Ads — Jan', amount: 800, client_id: digitalId, is_paid: true, date: monthsAgo(1) },
      { type: 'charge', label: 'Pub Facebook Ads — Fév', amount: 1500, client_id: investId, is_paid: false, date: daysAgo(5) },
      { type: 'charge', label: 'Licence Zoom Pro', amount: 165, client_id: null, is_paid: true, date: monthsAgo(2) },
      // Prestataires
      { type: 'prestataire', label: 'Montage vidéo — Thomas', amount: 600, client_id: scaleId, is_paid: true, date: monthsAgo(1), prestataire: 'Thomas Moreau' },
      { type: 'prestataire', label: 'Graphisme — freelance', amount: 350, client_id: fitcoachId, is_paid: true, date: monthsAgo(2), prestataire: 'Marie Design' },
      { type: 'prestataire', label: 'Copywriting — freelance', amount: 450, client_id: digitalId, is_paid: false, date: daysAgo(7), prestataire: 'Paul Writer' },
      { type: 'prestataire', label: 'Dev landing page', amount: 800, client_id: ecomId, is_paid: true, date: monthsAgo(3), prestataire: 'DevStudio' },
    ]

    const { data: finData, error: finError } = await supabase
      .from('financial_entries')
      .insert(financialEntries)
      .select('id')
    if (finError) throw new Error(`Financial entries: ${finError.message}`)
    ids.financialEntryIds = finData.map((f) => f.id)

    // ── 9. Payment schedules ──
    const paymentSchedules = [
      // FitCoach Pro — 3 payments of 5000/3
      { financial_entry_id: finData[0].id, client_id: fitcoachId, amount: 1667, due_date: monthsAgo(1), is_paid: true, paid_at: new Date(new Date().getTime() - 30 * 86400000).toISOString() },
      { financial_entry_id: finData[0].id, client_id: fitcoachId, amount: 1667, due_date: daysAgo(5), is_paid: true, paid_at: new Date(new Date().getTime() - 5 * 86400000).toISOString() },
      { financial_entry_id: finData[0].id, client_id: fitcoachId, amount: 1666, due_date: daysFromNow(25), is_paid: false },
      // Invest Mastery — 2 payments
      { financial_entry_id: finData[2].id, client_id: investId, amount: 2250, due_date: daysAgo(10), is_paid: true, paid_at: new Date(new Date().getTime() - 10 * 86400000).toISOString() },
      { financial_entry_id: finData[2].id, client_id: investId, amount: 2250, due_date: daysFromNow(20), is_paid: false },
      // E-Com Empire — 3 payments
      { financial_entry_id: finData[3].id, client_id: ecomId, amount: 1000, due_date: daysAgo(3), is_paid: false },
      { financial_entry_id: finData[3].id, client_id: ecomId, amount: 1000, due_date: daysFromNow(27), is_paid: false },
      { financial_entry_id: finData[3].id, client_id: ecomId, amount: 1000, due_date: daysFromNow(57), is_paid: false },
    ]

    const { data: payData, error: payError } = await supabase
      .from('payment_schedules')
      .insert(paymentSchedules)
      .select('id')
    if (payError) throw new Error(`Payment schedules: ${payError.message}`)
    ids.paymentScheduleIds = payData.map((p) => p.id)

    // ── 10. Social content (20) ──
    const socialStatuses = ['publié', 'en_cours', 'à_tourner', 'idée', 'reporté'] as const
    const formats = ['réel', 'story', 'carrousel', 'post'] as const
    const videoTypes = ['réact', 'b-roll', 'vidéo_virale', 'preuve_sociale', 'facecam', 'talking_head', 'vlog'] as const

    const socialTitles = [
      'Transformation client — avant/après', 'Les 5 erreurs du débutant',
      'Q&A avec un membre', 'Coulisses du coaching', 'Témoignage client FitCoach',
      'Story recap hebdo', 'Carrousel — Les 3 piliers du mindset',
      'Réel tendance musique virale', 'B-roll bureau + setup',
      'Facecam — Mon parcours', 'Preuve sociale — résultats clients',
      'Vlog journée type', 'Post citation motivation', 'Réact commentaire hater',
      'Talking head — Conseils investissement', 'Story behind the scenes montage',
      'Carrousel — Checklist lancement', 'Réel transition avant/après',
      'Post résumé du mois', 'Story sondage audience',
    ]

    const socialToInsert = socialTitles.map((title, i) => ({
      client_id: clientPool[i % clientPool.length],
      title,
      status: socialStatuses[i % socialStatuses.length],
      format: formats[i % formats.length],
      video_type: formats[i % formats.length] === 'réel' || formats[i % formats.length] === 'story'
        ? videoTypes[i % videoTypes.length]
        : null,
      is_validated: socialStatuses[i % socialStatuses.length] === 'publié',
      text_content: i % 3 === 0 ? 'Description du contenu à rédiger...' : null,
      planned_date: i < 10 ? daysAgo(i * 2) : daysFromNow((i - 10) * 3),
      sort_order: i,
    }))

    const { data: socialData, error: socialError } = await supabase
      .from('social_content')
      .insert(socialToInsert)
      .select('id')
    if (socialError) throw new Error(`Social content: ${socialError.message}`)
    ids.socialContentIds = socialData.map((s) => s.id)

    // ── 11. Instagram accounts (2) + post stats (15) ──
    const igAccounts = [
      { client_id: fitcoachId, username: 'fitcoach_pro_official', followers: 24500, following: 890, media_count: 342, last_synced_at: new Date().toISOString() },
      { client_id: digitalId, username: 'digital_academy_fr', followers: 15200, following: 520, media_count: 187, last_synced_at: new Date().toISOString() },
    ]

    const { data: igData, error: igError } = await supabase
      .from('instagram_accounts')
      .insert(igAccounts)
      .select('id')
    if (igError) throw new Error(`Instagram accounts: ${igError.message}`)
    ids.instagramAccountIds = igData.map((a) => a.id)

    const igPosts = Array.from({ length: 15 }, (_, i) => ({
      account_id: igData[i % 2].id,
      post_url: `https://instagram.com/p/demo-post-${i + 1}`,
      likes: 200 + Math.floor(Math.random() * 800),
      comments: 10 + Math.floor(Math.random() * 50),
      shares: 5 + Math.floor(Math.random() * 30),
      saves: 15 + Math.floor(Math.random() * 60),
      reach: 2000 + Math.floor(Math.random() * 8000),
      impressions: 3000 + Math.floor(Math.random() * 12000),
      engagement_rate: Number((2 + Math.random() * 6).toFixed(2)),
      posted_at: new Date(new Date().getTime() - i * 2 * 86400000).toISOString(),
    }))

    const { data: igPostData, error: igPostError } = await supabase
      .from('instagram_post_stats')
      .insert(igPosts)
      .select('id')
    if (igPostError) throw new Error(`Instagram posts: ${igPostError.message}`)
    ids.instagramPostStatIds = igPostData.map((p) => p.id)

    // ── 12. Interviews (8) + blockages (4) ──
    const interviewsToInsert = [
      { coach_id: adminUserId, member_id: sarahId, date: isoTimestamp(2), status: 'réalisé', positive_points: 'Très bonne écoute, messages personnalisés', improvement_areas: 'Relance trop tardive sur certains leads', actions: 'Mettre un timer de 24h max pour les relances', deadline: daysFromNow(7), notes: 'Progrès notables ce mois-ci' },
      { coach_id: adminUserId, member_id: lucasId, date: isoTimestamp(5), status: 'réalisé', positive_points: 'Volume de messages en hausse', improvement_areas: 'Qualité des messages — trop de copier-coller', actions: 'Créer 5 templates personnalisables', deadline: daysFromNow(14), notes: 'Focus sur la personnalisation' },
      { coach_id: adminUserId, member_id: karimId, date: isoTimestamp(8), status: 'réalisé', positive_points: 'Excellent taux de closing (60%+)', improvement_areas: 'Debrief incomplets', actions: 'Remplir le debrief immédiatement après chaque call', deadline: daysFromNow(3), notes: 'Closeur le plus performant' },
      { coach_id: emmaId, member_id: sarahId, date: isoTimestamp(15), status: 'réalisé', positive_points: 'Bonne gestion du pipeline', improvement_areas: 'Organisation du temps', actions: 'Utiliser la technique Pomodoro', deadline: daysAgo(1), notes: 'Suivi mensuel' },
      { coach_id: adminUserId, member_id: thomasId, date: isoTimestamp(20), status: 'réalisé', positive_points: 'Montages de qualité, retours clients positifs', improvement_areas: 'Délais de livraison parfois longs', actions: 'Fixer un délai max de 48h par montage', deadline: daysAgo(5), notes: 'Bon travail global' },
      { coach_id: adminUserId, member_id: lucasId, date: isoTimestamp(30), status: 'réalisé', positive_points: 'Bonne énergie', improvement_areas: 'Suivi des leads froids', actions: 'Relancer les leads froids 1x/semaine', deadline: daysAgo(15), notes: 'Entretien mensuel' },
      { coach_id: adminUserId, member_id: sarahId, date: daysFromNow(3) + 'T14:00:00Z', status: 'planifié', positive_points: null, improvement_areas: null, actions: null, deadline: null, notes: 'Prochain entretien' },
      { coach_id: adminUserId, member_id: karimId, date: daysFromNow(5) + 'T10:00:00Z', status: 'planifié', positive_points: null, improvement_areas: null, actions: null, deadline: null, notes: 'Prochain entretien bimensuel' },
    ]

    const { data: interviewData, error: interviewError } = await supabase
      .from('interviews')
      .insert(interviewsToInsert)
      .select('id')
    if (interviewError) throw new Error(`Interviews: ${interviewError.message}`)
    ids.interviewIds = interviewData.map((i) => i.id)

    const blockagesToInsert = [
      { interview_id: interviewData[0].id, member_id: sarahId, category: 'organisation' as const, problem: 'Relances trop tardives', why_1: 'Pas de système de suivi', why_2: 'Pas de rappels automatiques', root_cause: 'Absence d\'outil de planification des relances', decided_action: 'Mettre en place un workflow de relance automatisé', result: 'En cours' },
      { interview_id: interviewData[1].id, member_id: lucasId, category: 'communication' as const, problem: 'Messages trop génériques', why_1: 'Copier-coller systématique', why_2: 'Pas de recherche sur le prospect', root_cause: 'Manque de formation sur la personnalisation', decided_action: 'Workshop personnalisation la semaine prochaine', result: null },
      { interview_id: interviewData[2].id, member_id: karimId, category: 'technique' as const, problem: 'Debriefs incomplets après les calls', why_1: 'Pas le temps entre deux calls', why_2: 'Pas de template de debrief', root_cause: 'Manque de structure post-call', decided_action: 'Créer un template de debrief rapide (2min)', result: 'Template créé et en test' },
      { interview_id: interviewData[4].id, member_id: thomasId, category: 'organisation' as const, problem: 'Délais de livraison dépassés', why_1: 'Trop de projets en parallèle', why_2: 'Pas de priorisation claire', root_cause: 'Absence de système de gestion de projets', decided_action: 'Utiliser un kanban pour suivre les montages', result: 'Kanban mis en place' },
    ]

    const { data: blockageData, error: blockageError } = await supabase
      .from('blockages')
      .insert(blockagesToInsert)
      .select('id')
    if (blockageError) throw new Error(`Blockages: ${blockageError.message}`)
    ids.blockageIds = blockageData.map((b) => b.id)

    // ── 13. Notifications (15) — user_id = admin ──
    const notificationsToInsert = [
      { user_id: adminUserId, type: 'general' as const, title: 'Bienvenue sur Off-Market', message: 'Votre espace est prêt. Explorez les fonctionnalités !', is_read: true, created_at: isoTimestamp(30) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Antoine Girard → booké', message: 'Le statut du lead a changé.', is_read: true, created_at: isoTimestamp(14) },
      { user_id: adminUserId, type: 'new_call' as const, title: 'Nouveau call planifié le ' + daysAgo(10), message: 'Un call a été ajouté au calendrier.', is_read: true, created_at: isoTimestamp(12) },
      { user_id: adminUserId, type: 'call_closed' as const, title: 'Call closé — 5 000 €', message: 'Karim a closé un call avec FitCoach Pro.', is_read: true, created_at: isoTimestamp(8) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Camille Roux → en_cours', message: 'Le statut du lead a changé.', is_read: true, created_at: isoTimestamp(7) },
      { user_id: adminUserId, type: 'general' as const, title: 'Rapport mensuel disponible', message: 'Le rapport de janvier est prêt.', is_read: true, created_at: isoTimestamp(6) },
      { user_id: adminUserId, type: 'call_closed' as const, title: 'Call closé — 3 000 €', message: 'Karim a closé un call avec Invest Mastery.', is_read: false, created_at: isoTimestamp(4) },
      { user_id: adminUserId, type: 'new_call' as const, title: 'Nouveau call planifié le ' + daysFromNow(2), message: 'Un call a été ajouté au calendrier.', is_read: false, created_at: isoTimestamp(3) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Hugo Martin → pas_intéressé', message: 'Le statut du lead a changé.', is_read: false, created_at: isoTimestamp(2) },
      { user_id: adminUserId, type: 'general' as const, title: 'Nouvel entretien planifié', message: 'Entretien avec Sarah Martin dans 3 jours.', is_read: false, created_at: isoTimestamp(1) },
      { user_id: adminUserId, type: 'call_closed' as const, title: 'Call closé — 4 500 €', message: 'Karim a closé un call avec Digital Academy.', is_read: false, created_at: isoTimestamp(1) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Léa Bernard → booké', message: 'Nouveau lead booké.', is_read: false, created_at: new Date().toISOString() },
      { user_id: adminUserId, type: 'new_call' as const, title: 'Nouveau call demain à 10h', message: 'Call avec E-Com Empire.', is_read: false, created_at: new Date().toISOString() },
      { user_id: adminUserId, type: 'general' as const, title: '3 paiements en attente', message: 'Vérifiez les échéanciers.', is_read: false, created_at: new Date().toISOString() },
      { user_id: adminUserId, type: 'general' as const, title: 'Objectif mensuel à 80%', message: 'Vous êtes proche de l\'objectif !', is_read: false, created_at: new Date().toISOString() },
    ]

    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert(notificationsToInsert)
      .select('id')
    if (notifError) throw new Error(`Notifications: ${notifError.message}`)
    ids.notificationIds = notifData.map((n) => n.id)

    // ── Store IDs ──
    storeIds(ids)

    const summary = [
      `5 profils`,
      `8 clients`,
      `30 leads`,
      `25 calls`,
      `20 closer calls`,
      `${setterData.length} activités setter`,
      `15 entrées financières`,
      `${payData.length} échéanciers`,
      `20 contenus sociaux`,
      `2 comptes IG + 15 posts`,
      `8 entretiens + 4 blocages`,
      `15 notifications`,
    ].join(', ')

    return summary
  } catch (error) {
    // On error, try to clean up what was inserted
    console.error('Seed error, attempting cleanup:', error)
    try {
      await clearDemoData()
    } catch {
      // cleanup failed, user will need to clear manually
    }
    throw error
  }
}

// ============================================
// CLEAR
// ============================================
export async function clearDemoData(): Promise<void> {
  const stored = getStoredIds()
  if (!stored) return

  // Delete in reverse FK order
  const deletions: Array<{ table: string; ids: string[] }> = [
    { table: 'blockages', ids: stored.blockageIds },
    { table: 'interviews', ids: stored.interviewIds },
    { table: 'notifications', ids: stored.notificationIds },
    { table: 'setter_activities', ids: stored.setterActivityIds },
    { table: 'instagram_post_stats', ids: stored.instagramPostStatIds },
    { table: 'instagram_accounts', ids: stored.instagramAccountIds },
    { table: 'payment_schedules', ids: stored.paymentScheduleIds },
    { table: 'financial_entries', ids: stored.financialEntryIds },
    { table: 'social_content', ids: stored.socialContentIds },
    { table: 'closer_calls', ids: stored.closerCallIds },
    { table: 'call_calendar', ids: stored.callCalendarIds },
    { table: 'leads', ids: stored.leadIds },
    { table: 'client_assignments', ids: stored.clientAssignmentIds },
    { table: 'clients', ids: stored.clientIds },
  ]

  for (const { table, ids } of deletions) {
    if (ids.length === 0) continue
    const { error } = await supabase.from(table).delete().in('id', ids)
    if (error) console.warn(`Failed to delete from ${table}:`, error.message)
  }

  // Delete demo profiles via RPC
  if (stored.profileIds.length > 0) {
    const { error } = await supabase.rpc('delete_demo_profiles', {
      profile_ids: stored.profileIds,
    })
    if (error) console.warn('Failed to delete demo profiles:', error.message)
  }

  localStorage.removeItem(STORAGE_KEY)
}
