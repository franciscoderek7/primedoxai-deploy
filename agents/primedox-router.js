/*
 * PrimeDox AI — Client-Side Intent Router
 * Used by: zprimedoxaihq chatbot, chat widget fallback, HQ AI Router
 *
 * Usage:
 *   const result = PrimeDoxRouter.route("I need a VPN");
 *   // { agentId: 'sentinel', confidence: 0.92, revenue: [...] }
 */
(function(global) {

  const ROUTING_RULES = [
    // Security — OmniaGuard
    { patterns: ['vpn','privacy','encrypt','anonymous','hide my ip','internet security','password manager','vault','2fa','authenticator','biometric','virus','malware','ransomware','phish','hack my','protect my device','cyber','antivirus','scan','security audit','ssl','data broker','identity theft','dark web','breach notification'], agentId: 'sentinel', company: 'OmniaGuard' },

    // Counter-surveillance — VIGILAX
    { patterns: ['surveillance','stalker','spy','being watched','track me','corporate espionage','counter intel','opsec','operational security','monitor me','someone is tracking'], agentId: 'warden', company: 'VIGILAX' },

    // Cannabis law
    { patterns: ['cannabis','weed','marijuana','thc','cbd','dispensary','licensed producer','charged with','criminal charge','possession','trafficking','cdsa','section 5','cultivation at home','medical cannabis','health canada license'], agentId: 'counsel', company: 'BENO-X' },

    // Constitutional/Charter law
    { patterns: ['charter','constitutional','section 7','section 8','section 9','section 10','section 12','section 15','arbitrary detention','search and seizure','right to counsel','cruel and unusual','equality rights','remedy','24(1)','24(2)','stay of proceedings'], agentId: 'defender', company: 'BENO-X/CCLDR' },

    // Legal documents
    { patterns: ['document','affidavit','statement of claim','motion','filing','court form','template','demand letter','cpl','certificate of pending litigation','disclosure','factum'], agentId: 'archivist', company: 'CCLDR' },

    // Pets
    { patterns: ['pet','dog','cat','bird','fish','rabbit','hamster','paw','vet','gps collar','feeder','pet cam','pet health','animal'], agentId: 'vetbot', company: 'TechPetCage' },

    // Auto finance
    { patterns: ['car','auto','vehicle','truck','suv','financing','dealer','lease','buy a car','trade in','fleet','obd','diagnostic','ev rebate','electric vehicle','iZEV'], agentId: 'torque', company: 'Vault Velocity Auto' },

    // Scheduling/productivity
    { patterns: ['schedule','calendar','meeting','book a time','time management','productivity','appointment','availability','booking'], agentId: 'chronos', company: 'Kiaros' },

    // Investment
    { patterns: ['invest','investment','partner','fund','equity','deal','capital','opportunity','franchise','boardroom','shareholder','portfolio'], agentId: 'phoenix', company: 'Francisco Phoenix' },

    // Cleaning/workforce
    { patterns: ['clean','cleaning','janitor','sweep','mop','workforce','gig','worker','dispatch','cleanswarm'], agentId: 'swarm', company: 'CleanSwarm' },

    // Packaging/logistics
    { patterns: ['package','packaging','supply chain','logistics','shipping','warehouse','box','storage','packing','crate'], agentId: 'crate', company: 'TechPackCage' },

    // Mortgage/real estate
    { patterns: ['mortgage','rate','lender','home loan','refinance','heloc','amortization','house','property','real estate','condo','freehold'], agentId: 'ratehawk', company: 'Francisco Mortgage / Francisco Realty' },

    // Employment
    { patterns: ['fired','terminated','wrongful dismissal','severance','employment','workplace','hr','human resources','constructive dismissal'], agentId: 'gavel', company: 'Francisco Employment Law' },

    // Data privacy
    { patterns: ['privacy','pipeda','gdpr','data breach','personal information','consent','cookie','privacy policy','data protection'], agentId: 'cipher', company: 'Francisco Data Privacy' },

    // Immigration
    { patterns: ['immigration','visa','permanent resident','pr card','express entry','work permit','study permit','citizenship','ircc'], agentId: 'visapath', company: 'Francisco Immigration' },
  ];

  const REVENUE_QUICK = {
    sentinel:   [{ label: '🛡️ OmniaGuard Starter — $99/year',       url: 'https://omniaguard.com/pricing.html', primary: true  }, { label: '🔍 Free Security Scan', url: 'https://omniaguard.com/free-scan.html', primary: false }],
    warden:     [{ label: '🔐 VIGILAX Scout — $299/year',            url: 'https://vigilax.com/pricing.html',    primary: true  }, { label: '💬 Custom Quote', url: 'mailto:omniaguard1@gmail.com?subject=VIGILAX+Inquiry', primary: false }],
    counsel:    [{ label: '🚨 BENO-X Session — $500',               url: 'https://paypal.me/franciscoderek7/500', primary: true }, { label: '📄 Defense Document — $49', url: 'https://paypal.me/franciscoderek7/49', primary: false }],
    defender:   [{ label: '⚖️ BENO-X Session — $500',               url: 'https://paypal.me/franciscoderek7/500', primary: true }, { label: '📄 Document — $49', url: 'https://paypal.me/franciscoderek7/49', primary: false }],
    archivist:  [{ label: '📄 Generate Document — $49',             url: 'https://paypal.me/franciscoderek7/49',  primary: true }, { label: '📦 3-Doc Bundle — $99', url: 'https://paypal.me/franciscoderek7/99', primary: false }],
    vetbot:     [{ label: '📍 GPS Pet Tracker — $49',               url: 'https://paypal.me/franciscoderek7/49',  primary: true }, { label: '❤️ Health Monitor — $99', url: 'https://paypal.me/franciscoderek7/99', primary: false }],
    torque:     [{ label: '🔧 Vehicle Diagnostic — $99',            url: 'https://paypal.me/franciscoderek7/99',  primary: true }, { label: '💬 Finance Consult — $500', url: 'https://paypal.me/franciscoderek7/500', primary: false }],
    chronos:    [{ label: '⏱️ Kiaros Professional — $79/month',     url: 'https://kiaros.ai',                     primary: true }, { label: '🆓 Start Free Trial', url: 'https://kiaros.ai', primary: false }],
    phoenix:    [{ label: '💎 Boardroom Session — $500',            url: 'https://paypal.me/franciscoderek7/500', primary: true }, { label: '🏢 Francisco Holdings', url: 'https://franciscoholdingsinc.com', primary: false }],
    swarm:      [{ label: '🧹 CleanSwarm Business — $299/year',     url: 'https://paypal.me/franciscoderek7/299', primary: true }, { label: '💬 Book Demo', url: 'https://cleanswarm.ca', primary: false }],
    crate:      [{ label: '📦 Packaging Consult — $500',            url: 'https://paypal.me/franciscoderek7/500', primary: true }, { label: '💬 Request Quote', url: 'mailto:franciscoderek7@gmail.com?subject=TechPackCage+Quote', primary: false }],
    ratehawk:   [{ label: '🏠 Mortgage Strategy — $500',            url: 'https://paypal.me/franciscoderek7/500', primary: true }, { label: '💬 Free Rate Check', url: 'mailto:franciscoderek7@gmail.com?subject=Rate+Check', primary: false }],
    gavel:      [{ label: '⚖️ Employment Rights Review — $149',     url: 'https://paypal.me/franciscoderek7/149', primary: true }, { label: '📄 Wrongful Dismissal Brief — $299', url: 'https://paypal.me/franciscoderek7/299', primary: false }],
    cipher:     [{ label: '🔐 Privacy Audit — $499',                url: 'https://paypal.me/franciscoderek7/499', primary: true }, { label: '📋 Privacy Policy — $99', url: 'https://paypal.me/franciscoderek7/99', primary: false }],
    visapath:   [{ label: '✈️ Immigration Strategy — $499',         url: 'https://paypal.me/franciscoderek7/499', primary: true }, { label: '💬 Free Assessment', url: 'mailto:franciscoderek7@gmail.com?subject=Immigration+Assessment', primary: false }],
    primedox:   [{ label: '🤖 AI Access — $99/year',                url: 'https://paypal.me/franciscoderek7/99',  primary: true }, { label: '🏢 Francisco Holdings', url: 'https://franciscoholdingsinc.com', primary: false }],
  };

  const AGENT_NAMES = {
    sentinel: 'Sentinel (OmniaGuard)', warden: 'Warden (VIGILAX)', counsel: 'Counsel (BENO-X)',
    defender: 'Defender', archivist: 'Archivist (CCLDR)', vetbot: 'VetBot (TechPetCage)',
    torque: 'Torque (Vault Velocity)', chronos: 'Chronos (Kiaros)', phoenix: 'Phoenix',
    swarm: 'Swarm (CleanSwarm)', crate: 'Crate (TechPackCage)', ratehawk: 'RateHawk',
    gavel: 'Gavel', cipher: 'Cipher', visapath: 'VisaPath', primedox: 'PrimeDox',
  };

  const AGENT_RESPONSES = {
    sentinel:  "Sentinel activated. I've analyzed your security concern. OmniaGuard provides 14 layers of real-time AI protection — including military-grade VPN, encrypted vault, and AI antivirus.",
    warden:    "Warden online. VIGILAX counter-surveillance protocols initiated. I can assess your exposure and deploy appropriate counter-measures. What threat are you managing?",
    counsel:   "Counsel standing by. The BENO-X constitutional education framework has helped hundreds of Canadians understand their Charter rights. Note: Educational only — not legal advice.",
    defender:  "Defender ready. Your constitutional rights are shields — but only if you know how to use them. Let me walk you through the relevant Charter protections. Educational only.",
    archivist: "Archivist ready. Court document template initiated. Fill in your details, download your template. Important: Review with a licensed lawyer before filing.",
    vetbot:    "VetBot activated. Analyzing your pet situation. TechPetCage has smart solutions — GPS trackers, health monitors, smart feeders, and cameras for every breed and size.",
    torque:    "Torque online. Vehicle analysis ready. I can help with auto financing strategy, diagnostic code interpretation, and fleet optimization. What's your vehicle question?",
    chronos:   "Chronos activated. Time optimization analysis ready. Kiaros AI identifies where your time is actually going — then protects it. What scheduling challenge are you facing?",
    phoenix:   "Phoenix here. Dynasty-level strategy is different from business strategy. I work with clients building generational wealth, not just quarterly revenue. State your vision.",
    swarm:     "Swarm online. CleanSwarm automation initiated. I help cleaning businesses run leaner, dispatch faster, and track quality in real time. What's your operational challenge?",
    crate:     "Crate active. Packaging optimization analysis ready. The right packaging strategy can reduce costs 15-25% while improving customer experience. What's your situation?",
    ratehawk:  "RateHawk engaged. Canadian mortgage market analysis ready. Educational guidance only — not regulated advice. What's your mortgage situation?",
    gavel:     "Gavel online. Employment rights analysis ready. Whether it's wrongful dismissal, constructive dismissal, or severance negotiation — know your rights first. Educational only.",
    cipher:    "Cipher active. Privacy compliance analysis ready. Canadian privacy law (PIPEDA, Quebec Law 25) imposes real obligations on businesses. What's your data privacy situation?",
    visapath:  "VisaPath ready. Canadian immigration pathway analysis initiated. Educational guidance only — consult a licensed RCIC for applications. What's your immigration situation?",
    primedox:  "PrimeDox here. I'm the central concierge for Francisco Holdings Inc. — 45 specialist agents across security, legal, AI, business, and specialized sectors. What do you need?",
  };

  global.PrimeDoxRouter = {
    route: function(query) {
      if (!query) return { agentId: 'primedox', confidence: 0.5, revenue: REVENUE_QUICK['primedox'] };
      const q = query.toLowerCase();
      for (const rule of ROUTING_RULES) {
        const matches = rule.patterns.filter(p => q.includes(p));
        if (matches.length > 0) {
          const confidence = Math.min(0.6 + matches.length * 0.1, 0.98);
          return {
            agentId: rule.agentId,
            agentName: AGENT_NAMES[rule.agentId] || rule.agentId,
            company: rule.company,
            confidence: confidence,
            response: AGENT_RESPONSES[rule.agentId] || '',
            revenue: REVENUE_QUICK[rule.agentId] || REVENUE_QUICK['primedox'],
            matchedKeywords: matches,
          };
        }
      }
      return {
        agentId: 'primedox',
        agentName: 'PrimeDox',
        company: 'Francisco Holdings Inc.',
        confidence: 0.4,
        response: AGENT_RESPONSES['primedox'],
        revenue: REVENUE_QUICK['primedox'],
        matchedKeywords: [],
      };
    },

    getAgentName: function(id) { return AGENT_NAMES[id] || id; },
    getRevenue: function(id) { return REVENUE_QUICK[id] || REVENUE_QUICK['primedox']; },
    getResponse: function(id) { return AGENT_RESPONSES[id] || AGENT_RESPONSES['primedox']; },
  };

})(window);
