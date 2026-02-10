import { supabase } from './supabase'

const STORAGE_KEY = 'demo_data_ids'

interface DemoDataIds {
  profileIds: string[]
  clientIds: string[]
  leadIds: string[]
  callCalendarIds: string[]
  financialEntryIds: string[]
  paymentScheduleIds: string[]
  setterActivityIds: string[]
  notificationIds: string[]
  clientAssignmentIds: string[]
  channelIds: string[]
  messageIds: string[]
  formationIds: string[]
  moduleIds: string[]
  itemIds: string[]
  completionIds: string[]
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

function isoTimestampHoursAgo(hours: number): string {
  const d = new Date()
  d.setTime(d.getTime() - hours * 3600000)
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
    financialEntryIds: [],
    paymentScheduleIds: [],
    setterActivityIds: [],
    notificationIds: [],
    clientAssignmentIds: [],
    channelIds: [],
    messageIds: [],
    formationIds: [],
    moduleIds: [],
    itemIds: [],
    completionIds: [],
  }

  try {
    // ── 1. Create demo profiles via RPC (2 setters + 3 eleves) ──
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_demo_profiles',
      { admin_id: adminUserId }
    )
    if (rpcError) throw new Error(`RPC create_demo_profiles: ${rpcError.message}`)

    const profileMap = rpcResult as Record<string, string>
    const sarahId = profileMap.setter1
    const lucasId = profileMap.setter2
    const karimId = profileMap.eleve1
    const emmaId = profileMap.eleve2
    const thomasId = profileMap.eleve3

    ids.profileIds = [sarahId, lucasId, karimId, emmaId, thomasId]

    // Update last_seen_at for demo presence
    await supabase.from('profiles').update({ last_seen_at: isoTimestampHoursAgo(2) }).eq('id', karimId)
    await supabase.from('profiles').update({ last_seen_at: isoTimestampHoursAgo(48) }).eq('id', emmaId)
    await supabase.from('profiles').update({ last_seen_at: isoTimestampHoursAgo(120) }).eq('id', thomasId)
    await supabase.from('profiles').update({ last_seen_at: isoTimestampHoursAgo(1) }).eq('id', sarahId)
    await supabase.from('profiles').update({ last_seen_at: isoTimestampHoursAgo(6) }).eq('id', lucasId)

    // ── 2. Clients (8) ──
    const clientsToInsert = [
      { name: 'FitCoach Pro', email: 'contact@fitcoachpro.fr', phone: '06 12 34 56 78', status: 'actif', notes: 'Programme fitness haut de gamme', created_by: adminUserId },
      { name: 'Digital Academy', email: 'hello@digitalacademy.io', phone: '06 23 45 67 89', status: 'actif', notes: 'Formation marketing digital', created_by: adminUserId },
      { name: 'Invest Mastery', email: 'team@investmastery.fr', phone: '06 34 56 78 90', status: 'actif', notes: 'Coaching investissement immobilier', created_by: adminUserId },
      { name: 'MindSet Lab', email: 'info@mindsetlab.com', phone: '06 45 67 89 01', status: 'actif', notes: 'Développement personnel et mindset', created_by: adminUserId },
      { name: 'E-Com Empire', email: 'support@ecomempire.fr', phone: '06 56 78 90 12', status: 'actif', notes: 'Formation e-commerce Shopify', created_by: adminUserId },
      { name: 'Scale Agency', email: 'bonjour@scaleagency.fr', phone: '06 67 89 01 23', status: 'actif', notes: 'Agence SMMA', created_by: adminUserId },
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
      { client_id: fitcoachId, user_id: sarahId, role: 'setter' as const },
      { client_id: digitalId, user_id: adminUserId, role: 'admin' as const },
      { client_id: digitalId, user_id: lucasId, role: 'setter' as const },
      { client_id: investId, user_id: adminUserId, role: 'admin' as const },
      { client_id: investId, user_id: sarahId, role: 'setter' as const },
      { client_id: mindsetId, user_id: adminUserId, role: 'admin' as const },
      { client_id: ecomId, user_id: lucasId, role: 'setter' as const },
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
    const leadStatuses = ['premier_message', 'en_discussion', 'qualifie', 'loom_envoye', 'call_planifie', 'close', 'perdu'] as const
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

    const weekDistribution = [2, 3, 5, 4, 6, 3, 5, 2]
    const leadsToInsert: Array<Record<string, unknown>> = []
    let leadIdx = 0

    for (let weekOffset = 7; weekOffset >= 0; weekOffset--) {
      const count = weekDistribution[7 - weekOffset]
      for (let j = 0; j < count; j++) {
        const dayInWeek = Math.floor(Math.random() * 5)
        const daysBack = weekOffset * 7 + dayInWeek
        const statusIdx = leadIdx % 7
        const isClosed = leadStatuses[statusIdx] === 'close'

        leadsToInsert.push({
          name: leadNames[leadIdx],
          email: `${leadNames[leadIdx].toLowerCase().replace(' ', '.')}@email.com`,
          phone: `06 ${String(10 + leadIdx).padStart(2, '0')} ${String(20 + leadIdx).padStart(2, '0')} ${String(30 + leadIdx).padStart(2, '0')} ${String(40 + leadIdx).padStart(2, '0')}`,
          client_id: clientPool[leadIdx % clientPool.length],
          assigned_to: setters[leadIdx % setters.length],
          source: sources[leadIdx % sources.length],
          status: leadStatuses[statusIdx],
          ca_contracté: isClosed ? (1500 + leadIdx * 200) : 0,
          ca_collecté: isClosed ? (1000 + leadIdx * 100) : 0,
          commission_setter: isClosed ? 150 : 0,
          commission_closer: isClosed ? 300 : 0,
          notes: `Lead ${leadNames[leadIdx]} — source ${sources[leadIdx % sources.length]}`,
          created_at: new Date(new Date().getTime() - daysBack * 86400000).toISOString(),
        })
        leadIdx++
      }
    }

    const { data: leadsData, error: leadsError } = await supabase.from('leads').insert(leadsToInsert).select('id')
    if (leadsError) throw new Error(`Leads: ${leadsError.message}`)
    ids.leadIds = leadsData.map((l) => l.id)

    // ── 5. Call calendar (25) ──
    const callTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']
    const callTypes = ['manuel', 'iclosed', 'calendly', 'coaching', 'closing', 'autre'] as const
    const callStatuses = ['réalisé', 'réalisé', 'réalisé', 'réalisé', 'réalisé',
      'réalisé', 'réalisé', 'réalisé', 'réalisé', 'réalisé',
      'no_show', 'no_show', 'no_show', 'no_show', 'no_show',
      'annulé', 'annulé',
      'planifié', 'planifié', 'planifié', 'planifié',
      'planifié', 'planifié', 'planifié', 'planifié',
    ] as const

    const callsToInsert = Array.from({ length: 25 }, (_, i) => {
      const isFuture = i >= 17
      const date = isFuture ? daysFromNow(1 + i - 17) : daysAgo(1 + Math.floor(i * 1.5))
      return {
        client_id: clientPool[i % clientPool.length],
        lead_id: ids.leadIds[i % ids.leadIds.length],
        assigned_to: i % 3 === 0 ? sarahId : i % 3 === 1 ? lucasId : adminUserId,
        date,
        time: callTimes[i % callTimes.length],
        type: callTypes[i % callTypes.length],
        status: callStatuses[i],
        link: i % 4 === 1 ? 'https://meet.google.com/demo-call' : null,
        notes: `Call ${i + 1} — ${callStatuses[i]}`,
      }
    })

    const { data: callsData, error: callsError } = await supabase.from('call_calendar').insert(callsToInsert).select('id')
    if (callsError) throw new Error(`Call calendar: ${callsError.message}`)
    ids.callCalendarIds = callsData.map((c) => c.id)

    // ── 6. Setter activities ──
    const setterActivitiesToInsert: Array<Record<string, unknown>> = []
    for (let day = 0; day < 14; day++) {
      const date = daysAgo(day)
      const dayOfWeek = new Date(date).getDay()
      for (const setterId of [sarahId, lucasId, adminUserId]) {
        if (dayOfWeek === 0) continue
        const clientsForSetter = setterId === sarahId
          ? [fitcoachId, investId, scaleId]
          : setterId === lucasId ? [digitalId, ecomId, mindsetId] : [fitcoachId, digitalId, investId]
        for (const cId of clientsForSetter) {
          setterActivitiesToInsert.push({
            user_id: setterId, client_id: cId, date,
            messages_sent: dayOfWeek === 6 ? 7 + Math.floor(Math.random() * 5) : 28 + Math.floor(Math.random() * 15),
            notes: null,
          })
        }
      }
    }

    const { data: setterData, error: setterError } = await supabase.from('setter_activities').insert(setterActivitiesToInsert).select('id')
    if (setterError) throw new Error(`Setter activities: ${setterError.message}`)
    ids.setterActivityIds = setterData.map((s) => s.id)

    // ── 8. Financial entries (15) ──
    const financialEntries = [
      { type: 'ca', label: 'Paiement FitCoach Pro — Janvier', amount: 5000, client_id: fitcoachId, is_paid: true, date: monthsAgo(1) },
      { type: 'ca', label: 'Paiement Digital Academy — Janvier', amount: 3500, client_id: digitalId, is_paid: true, date: monthsAgo(1) },
      { type: 'ca', label: 'Paiement Invest Mastery — Février', amount: 4500, client_id: investId, is_paid: true, date: daysAgo(10) },
      { type: 'ca', label: 'Paiement E-Com Empire — Février', amount: 3000, client_id: ecomId, is_paid: false, date: daysAgo(3) },
      { type: 'récurrent', label: 'Abonnement Off-Market', amount: 97, client_id: null, is_paid: true, date: daysAgo(1), recurrence: 'mensuel' },
      { type: 'récurrent', label: 'Hébergement serveurs', amount: 49, client_id: null, is_paid: true, date: daysAgo(1), recurrence: 'mensuel' },
      { type: 'récurrent', label: 'Suite Adobe Creative', amount: 59.99, client_id: null, is_paid: true, date: monthsAgo(1), recurrence: 'mensuel' },
      { type: 'charge', label: 'Pub Facebook Ads — Jan', amount: 1200, client_id: fitcoachId, is_paid: true, date: monthsAgo(1) },
      { type: 'charge', label: 'Pub Google Ads — Jan', amount: 800, client_id: digitalId, is_paid: true, date: monthsAgo(1) },
      { type: 'charge', label: 'Pub Facebook Ads — Fév', amount: 1500, client_id: investId, is_paid: false, date: daysAgo(5) },
      { type: 'charge', label: 'Licence Zoom Pro', amount: 165, client_id: null, is_paid: true, date: monthsAgo(2) },
      { type: 'prestataire', label: 'Montage vidéo — Thomas', amount: 600, client_id: scaleId, is_paid: true, date: monthsAgo(1), prestataire: 'Thomas Moreau' },
      { type: 'prestataire', label: 'Graphisme — freelance', amount: 350, client_id: fitcoachId, is_paid: true, date: monthsAgo(2), prestataire: 'Marie Design' },
      { type: 'prestataire', label: 'Copywriting — freelance', amount: 450, client_id: digitalId, is_paid: false, date: daysAgo(7), prestataire: 'Paul Writer' },
      { type: 'prestataire', label: 'Dev landing page', amount: 800, client_id: ecomId, is_paid: true, date: monthsAgo(3), prestataire: 'DevStudio' },
    ]

    const { data: finData, error: finError } = await supabase.from('financial_entries').insert(financialEntries).select('id')
    if (finError) throw new Error(`Financial entries: ${finError.message}`)
    ids.financialEntryIds = finData.map((f) => f.id)

    // ── 9. Payment schedules ──
    const paymentSchedules = [
      { financial_entry_id: finData[0].id, client_id: fitcoachId, amount: 1667, due_date: monthsAgo(1), is_paid: true, paid_at: new Date(Date.now() - 30 * 86400000).toISOString() },
      { financial_entry_id: finData[0].id, client_id: fitcoachId, amount: 1667, due_date: daysAgo(5), is_paid: true, paid_at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { financial_entry_id: finData[0].id, client_id: fitcoachId, amount: 1666, due_date: daysFromNow(25), is_paid: false },
      { financial_entry_id: finData[2].id, client_id: investId, amount: 2250, due_date: daysAgo(10), is_paid: true, paid_at: new Date(Date.now() - 10 * 86400000).toISOString() },
      { financial_entry_id: finData[2].id, client_id: investId, amount: 2250, due_date: daysFromNow(20), is_paid: false },
      { financial_entry_id: finData[3].id, client_id: ecomId, amount: 1000, due_date: daysAgo(3), is_paid: false },
      { financial_entry_id: finData[3].id, client_id: ecomId, amount: 1000, due_date: daysFromNow(27), is_paid: false },
      { financial_entry_id: finData[3].id, client_id: ecomId, amount: 1000, due_date: daysFromNow(57), is_paid: false },
    ]

    const { data: payData, error: payError } = await supabase.from('payment_schedules').insert(paymentSchedules).select('id')
    if (payError) throw new Error(`Payment schedules: ${payError.message}`)
    ids.paymentScheduleIds = payData.map((p) => p.id)

    // ── 10. Notifications (15) ──
    const notificationsToInsert = [
      { user_id: adminUserId, type: 'general' as const, title: 'Bienvenue sur Off-Market', message: 'Votre espace est prêt.', is_read: true, created_at: isoTimestamp(30) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Antoine Girard → call planifié', message: 'Le statut du lead a changé.', is_read: true, created_at: isoTimestamp(14) },
      { user_id: adminUserId, type: 'new_call' as const, title: 'Nouveau call planifié', message: 'Un call a été ajouté au calendrier.', is_read: true, created_at: isoTimestamp(12) },
      { user_id: adminUserId, type: 'call_closed' as const, title: 'Call closé — 5 000 €', message: 'Un call a été closé.', is_read: true, created_at: isoTimestamp(8) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Camille Roux → en discussion', message: 'Le statut du lead a changé.', is_read: true, created_at: isoTimestamp(7) },
      { user_id: adminUserId, type: 'general' as const, title: 'Rapport mensuel disponible', message: 'Le rapport de janvier est prêt.', is_read: true, created_at: isoTimestamp(6) },
      { user_id: adminUserId, type: 'call_closed' as const, title: 'Call closé — 3 000 €', message: 'Un call a été closé.', is_read: false, created_at: isoTimestamp(4) },
      { user_id: adminUserId, type: 'new_call' as const, title: 'Nouveau call planifié', message: 'Un call a été ajouté.', is_read: false, created_at: isoTimestamp(3) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Hugo Martin → perdu', message: 'Le statut du lead a changé.', is_read: false, created_at: isoTimestamp(2) },
      { user_id: adminUserId, type: 'general' as const, title: 'Nouvelle action requise', message: 'Vérifiez les relances.', is_read: false, created_at: isoTimestamp(1) },
      { user_id: adminUserId, type: 'call_closed' as const, title: 'Call closé — 4 500 €', message: 'Un call a été closé.', is_read: false, created_at: isoTimestamp(1) },
      { user_id: adminUserId, type: 'lead_status' as const, title: 'Lead Léa Bernard → call planifié', message: 'Nouveau call planifié.', is_read: false, created_at: new Date().toISOString() },
      { user_id: adminUserId, type: 'new_call' as const, title: 'Nouveau call demain', message: 'Call avec E-Com Empire.', is_read: false, created_at: new Date().toISOString() },
      { user_id: adminUserId, type: 'general' as const, title: '3 paiements en attente', message: 'Vérifiez les échéanciers.', is_read: false, created_at: new Date().toISOString() },
      { user_id: adminUserId, type: 'general' as const, title: 'Objectif mensuel à 80%', message: 'Vous êtes proche de l\'objectif !', is_read: false, created_at: new Date().toISOString() },
    ]
    const { data: notifData, error: notifError } = await supabase.from('notifications').insert(notificationsToInsert).select('id')
    if (notifError) throw new Error(`Notifications: ${notifError.message}`)
    ids.notificationIds = notifData.map((n) => n.id)

    // ── 13. Messaging: Channels + Messages ──
    const { data: vipChannel, error: vipErr } = await supabase
      .from('channels').insert({ name: 'Groupe VIP', type: 'group', write_mode: 'all', created_by: adminUserId }).select('id').single()
    if (vipErr) throw new Error(`VIP channel: ${vipErr.message}`)
    ids.channelIds.push(vipChannel.id)
    await supabase.from('channel_members').insert(
      [adminUserId, sarahId, lucasId, karimId, emmaId].map((uid) => ({ channel_id: vipChannel.id, user_id: uid }))
    )

    const { data: generalChannel } = await supabase.from('channels').select('id').eq('name', 'Général').single()

    // Direct channels
    for (const dc of [
      { name: 'Admin ↔ Karim', otherId: karimId },
      { name: 'Admin ↔ Emma', otherId: emmaId },
      { name: 'Admin ↔ Thomas', otherId: thomasId },
    ]) {
      const { data: ch, error: chErr } = await supabase
        .from('channels').insert({ name: dc.name, type: 'direct', write_mode: 'all', created_by: adminUserId }).select('id').single()
      if (chErr) throw new Error(`Direct channel: ${chErr.message}`)
      ids.channelIds.push(ch.id)
      await supabase.from('channel_members').insert([
        { channel_id: ch.id, user_id: adminUserId },
        { channel_id: ch.id, user_id: dc.otherId },
      ])
    }

    // Messages in Général
    if (generalChannel) {
      const gMsgs = [
        { channel_id: generalChannel.id, sender_id: adminUserId, content: 'Bienvenue sur Off-Market ! N\'hésitez pas à poser vos questions ici.', created_at: isoTimestamp(10) },
        { channel_id: generalChannel.id, sender_id: karimId, content: 'Merci ! Ravi d\'être ici.', created_at: isoTimestamp(9) },
        { channel_id: generalChannel.id, sender_id: emmaId, content: 'Super plateforme, j\'ai hâte de commencer les formations !', created_at: isoTimestamp(8) },
        { channel_id: generalChannel.id, sender_id: sarahId, content: 'N\'hésitez pas si vous avez des questions.', created_at: isoTimestamp(7) },
        { channel_id: generalChannel.id, sender_id: lucasId, content: 'Je suis là aussi pour vous aider.', created_at: isoTimestamp(6) },
        { channel_id: generalChannel.id, sender_id: adminUserId, content: 'Rappel : les formations sont disponibles dans l\'onglet Formations.', created_at: isoTimestamp(3) },
        { channel_id: generalChannel.id, sender_id: karimId, content: 'J\'ai commencé le module 1, c\'est top !', created_at: isoTimestamp(2) },
        { channel_id: generalChannel.id, sender_id: thomasId, content: 'Pareil, le contenu est vraiment qualitatif.', created_at: isoTimestamp(1) },
      ]
      const { data: gData } = await supabase.from('messages').insert(gMsgs).select('id')
      if (gData) ids.messageIds.push(...gData.map((m) => m.id))
    }

    // Messages in VIP
    const vMsgs = [
      { channel_id: vipChannel.id, sender_id: adminUserId, content: 'Bienvenue dans le groupe VIP !', created_at: isoTimestamp(5) },
      { channel_id: vipChannel.id, sender_id: sarahId, content: 'N\'oubliez pas le call de groupe demain à 14h.', created_at: isoTimestamp(4) },
      { channel_id: vipChannel.id, sender_id: karimId, content: 'Noté, merci Sarah !', created_at: isoTimestamp(3) },
      { channel_id: vipChannel.id, sender_id: emmaId, content: 'J\'ai une question sur le closing, on en parle au call ?', created_at: isoTimestamp(2) },
      { channel_id: vipChannel.id, sender_id: adminUserId, content: 'Bien sûr Emma, on fera un point.', created_at: isoTimestamp(1) },
    ]
    const { data: vData } = await supabase.from('messages').insert(vMsgs).select('id')
    if (vData) ids.messageIds.push(...vData.map((m) => m.id))

    // Direct messages
    const directMsgs = [
      [{ s: adminUserId, c: 'Salut Karim, comment avance ta formation ?' }, { s: karimId, c: 'Ça avance bien, 80% du module 1 !' }, { s: adminUserId, c: 'Super, continue !' }],
      [{ s: adminUserId, c: 'Emma, bienvenue ! Tu as pu accéder aux formations ?' }, { s: emmaId, c: 'Oui tout est bon !' }, { s: adminUserId, c: 'Parfait.' }],
      [{ s: adminUserId, c: 'Thomas, tu en es où ?' }, { s: thomasId, c: 'J\'ai pris du retard, je m\'y remets.' }, { s: adminUserId, c: 'Pas de souci, avance à ton rythme.' }],
    ]
    for (let i = 0; i < directMsgs.length; i++) {
      const chId = ids.channelIds[i + 1]
      const msgs = directMsgs[i].map((m, j) => ({ channel_id: chId, sender_id: m.s, content: m.c, created_at: isoTimestamp(5 - j) }))
      const { data: dData } = await supabase.from('messages').insert(msgs).select('id')
      if (dData) ids.messageIds.push(...dData.map((m) => m.id))
    }

    // ── 14. Formations ──
    const { data: f1, error: f1Err } = await supabase.from('formations').insert({
      title: 'Les fondamentaux du coaching business',
      description: 'Apprenez les bases : acquisition, closing, fidélisation et scaling.',
      is_published: true, sort_order: 0, created_by: adminUserId,
    }).select('id').single()
    if (f1Err) throw new Error(`Formation 1: ${f1Err.message}`)
    ids.formationIds.push(f1.id)

    const { data: f2, error: f2Err } = await supabase.from('formations').insert({
      title: 'Masterclass closing avancé',
      description: 'Techniques avancées de closing et négociation.',
      is_published: false, sort_order: 1, created_by: adminUserId,
    }).select('id').single()
    if (f2Err) throw new Error(`Formation 2: ${f2Err.message}`)
    ids.formationIds.push(f2.id)

    // F1 modules
    const { data: f1Mods, error: f1ModErr } = await supabase.from('formation_modules').insert([
      { formation_id: f1.id, title: 'Introduction au coaching', description: 'Les bases et le mindset.', sort_order: 0 },
      { formation_id: f1.id, title: 'Acquisition de clients', description: 'Stratégies organique et payante.', sort_order: 1 },
      { formation_id: f1.id, title: 'Techniques de closing', description: 'Closer efficacement.', sort_order: 2 },
      { formation_id: f1.id, title: 'Fidélisation et scaling', description: 'Garder ses clients et grandir.', sort_order: 3 },
    ]).select('id')
    if (f1ModErr) throw new Error(`F1 modules: ${f1ModErr.message}`)
    ids.moduleIds.push(...f1Mods.map((m) => m.id))

    // F2 modules
    const { data: f2Mods, error: f2ModErr } = await supabase.from('formation_modules').insert([
      { formation_id: f2.id, title: 'Psychologie du closing', description: 'Mécanismes de décision.', sort_order: 0 },
      { formation_id: f2.id, title: 'Scripts et frameworks', description: 'Les scripts qui convertissent.', sort_order: 1 },
    ]).select('id')
    if (f2ModErr) throw new Error(`F2 modules: ${f2ModErr.message}`)
    ids.moduleIds.push(...f2Mods.map((m) => m.id))

    // F1 items (15)
    const demoVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    const { data: f1Items, error: f1ItErr } = await supabase.from('module_items').insert([
      { module_id: f1Mods[0].id, title: 'Qu\'est-ce que le coaching business ?', type: 'video', url: demoVideoUrl, duration: 12, sort_order: 0 },
      { module_id: f1Mods[0].id, title: 'Le mindset du coach', type: 'video', url: demoVideoUrl, duration: 18, sort_order: 1 },
      { module_id: f1Mods[0].id, title: 'Définir sa niche', type: 'video', url: demoVideoUrl, duration: 15, sort_order: 2 },
      { module_id: f1Mods[0].id, title: 'Guide de démarrage (PDF)', type: 'document', url: 'https://example.com/guide.pdf', sort_order: 3 },
      { module_id: f1Mods[1].id, title: 'Stratégie Instagram', type: 'video', url: demoVideoUrl, duration: 22, sort_order: 0 },
      { module_id: f1Mods[1].id, title: 'LinkedIn pour les coachs', type: 'video', url: demoVideoUrl, duration: 16, sort_order: 1 },
      { module_id: f1Mods[1].id, title: 'Facebook Ads 101', type: 'video', url: demoVideoUrl, duration: 25, sort_order: 2 },
      { module_id: f1Mods[1].id, title: 'Templates messages DM', type: 'document', url: 'https://example.com/templates.pdf', sort_order: 3 },
      { module_id: f1Mods[2].id, title: 'Le call de découverte', type: 'video', url: demoVideoUrl, duration: 20, sort_order: 0 },
      { module_id: f1Mods[2].id, title: 'Gérer les objections', type: 'video', url: demoVideoUrl, duration: 18, sort_order: 1 },
      { module_id: f1Mods[2].id, title: 'Le closing en 5 étapes', type: 'video', url: demoVideoUrl, duration: 28, sort_order: 2 },
      { module_id: f1Mods[3].id, title: 'Onboarding client', type: 'video', url: demoVideoUrl, duration: 14, sort_order: 0 },
      { module_id: f1Mods[3].id, title: 'Créer une communauté', type: 'video', url: demoVideoUrl, duration: 19, sort_order: 1 },
      { module_id: f1Mods[3].id, title: 'Scaling : de 1 à 10 clients', type: 'video', url: demoVideoUrl, duration: 24, sort_order: 2 },
      { module_id: f1Mods[3].id, title: 'Checklist scaling (PDF)', type: 'document', url: 'https://example.com/checklist.pdf', sort_order: 3 },
    ]).select('id')
    if (f1ItErr) throw new Error(`F1 items: ${f1ItErr.message}`)
    ids.itemIds.push(...f1Items.map((i) => i.id))

    // F2 items (6)
    const { data: f2Items, error: f2ItErr } = await supabase.from('module_items').insert([
      { module_id: f2Mods[0].id, title: 'Les biais cognitifs', type: 'video', url: demoVideoUrl, duration: 20, sort_order: 0 },
      { module_id: f2Mods[0].id, title: 'Créer l\'urgence', type: 'video', url: demoVideoUrl, duration: 15, sort_order: 1 },
      { module_id: f2Mods[0].id, title: 'La preuve sociale', type: 'video', url: demoVideoUrl, duration: 18, sort_order: 2 },
      { module_id: f2Mods[1].id, title: 'Script call de closing', type: 'document', url: 'https://example.com/script.pdf', sort_order: 0 },
      { module_id: f2Mods[1].id, title: 'Framework SPIN', type: 'video', url: demoVideoUrl, duration: 22, sort_order: 1 },
      { module_id: f2Mods[1].id, title: 'Exercices pratiques', type: 'document', url: 'https://example.com/exercices.pdf', sort_order: 2 },
    ]).select('id')
    if (f2ItErr) throw new Error(`F2 items: ${f2ItErr.message}`)
    ids.itemIds.push(...f2Items.map((i) => i.id))

    // ── 15. Item completions ──
    const completions = [
      ...f1Items.slice(0, 12).map((it) => ({ item_id: it.id, user_id: karimId })),   // 80%
      ...f1Items.slice(0, 6).map((it) => ({ item_id: it.id, user_id: emmaId })),     // 40%
      ...f1Items.slice(0, 2).map((it) => ({ item_id: it.id, user_id: thomasId })),   // ~13%
    ]
    const { data: compData, error: compErr } = await supabase.from('item_completions').insert(completions).select('id')
    if (compErr) throw new Error(`Completions: ${compErr.message}`)
    ids.completionIds = compData.map((c) => c.id)

    // ── Store IDs ──
    storeIds(ids)

    return [
      '5 profils (2 setters, 3 élèves)', '8 clients', '30 leads', '25 calls',
      `${setterData.length} activités setter`, '15 entrées financières', `${payData.length} échéanciers`,
      '15 notifications', '4 canaux + ~30 messages', '2 formations (15+6 items)', '20 completions',
    ].join(', ')
  } catch (error) {
    console.error('Seed error, attempting cleanup:', error)
    try { await clearDemoData() } catch { /* cleanup failed */ }
    throw error
  }
}

// ============================================
// CLEAR
// ============================================
export async function clearDemoData(): Promise<void> {
  const stored = getStoredIds()
  if (!stored) return

  const deletions: Array<{ table: string; ids: string[] }> = [
    { table: 'item_completions', ids: stored.completionIds ?? [] },
    { table: 'module_items', ids: stored.itemIds ?? [] },
    { table: 'formation_modules', ids: stored.moduleIds ?? [] },
    { table: 'formations', ids: stored.formationIds ?? [] },
    { table: 'messages', ids: stored.messageIds ?? [] },
    { table: 'notifications', ids: stored.notificationIds },
    { table: 'setter_activities', ids: stored.setterActivityIds },
    { table: 'payment_schedules', ids: stored.paymentScheduleIds },
    { table: 'financial_entries', ids: stored.financialEntryIds },
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

  // Delete channels (cascades members)
  for (const channelId of (stored.channelIds ?? [])) {
    await supabase.from('channel_members').delete().eq('channel_id', channelId)
    await supabase.from('channels').delete().eq('id', channelId)
  }

  // Delete demo profiles via RPC
  if (stored.profileIds.length > 0) {
    const { error } = await supabase.rpc('delete_demo_profiles', { profile_ids: stored.profileIds })
    if (error) console.warn('Failed to delete demo profiles:', error.message)
  }

  localStorage.removeItem(STORAGE_KEY)
}
