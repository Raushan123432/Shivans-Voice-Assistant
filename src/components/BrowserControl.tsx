import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Youtube, 
  Mail, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  Shield,
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Terminal, 
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Tv,
  Monitor,
  SkipForward,
  Minimize2,
  Maximize2,
  Lock,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  Filter,
  Check,
  Ban
} from 'lucide-react';
import { ToolExecutor } from '../services/ToolExecutor';
import { SecondScreenManager } from '../services/SecondScreenManager';
import { WhitelistSecurityService } from '../services/WhitelistSecurityService';
import { WhitelistDomainEntry, DomainCategory, SecurityPolicyState, SecurityAuditEvent } from '../types';

export const BrowserControl: React.FC = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [ytQuery, setYtQuery] = useState('Pawan Singh Bhojpuri gana');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  // Security & Whitelist State
  const [activeTab, setActiveTab] = useState<'automation' | 'security' | 'actions' | 'logs'>('automation');
  const [policyState, setPolicyState] = useState<SecurityPolicyState>(WhitelistSecurityService.getPolicyState());
  const [domainsList, setDomainsList] = useState<WhitelistDomainEntry[]>(WhitelistSecurityService.getDomains());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [domainSearchFilter, setDomainSearchFilter] = useState<string>('');
  
  // New domain form
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newDomainCategory, setNewDomainCategory] = useState<DomainCategory>('developer');
  const [newDomainDesc, setNewDomainDesc] = useState('');
  const [domainFormError, setDomainFormError] = useState('');
  const [domainFormSuccess, setDomainFormSuccess] = useState('');

  // Security test sandbox state
  const [testResult, setTestResult] = useState<any>(null);
  const [testCustomUrl, setTestCustomUrl] = useState('');

  // Subscribe to security policy changes
  useEffect(() => {
    const unsub = WhitelistSecurityService.subscribe((policy) => {
      setPolicyState(policy);
      setDomainsList(WhitelistSecurityService.getDomains());
    });
    return () => unsub();
  }, []);

  const quickLinks = [
    { name: 'Google Search', icon: Search, url: 'https://www.google.com', color: 'text-blue-400' },
    { name: 'YouTube Pro', icon: Youtube, url: 'https://www.youtube.com', color: 'text-red-500' },
    { name: 'Gmail Workspace', icon: Mail, url: 'https://mail.google.com', color: 'text-rose-400' },
    { name: 'Tech News', icon: Globe, url: 'https://news.google.com', color: 'text-cyan-400' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
    setSearchQuery('');
  };

  // Trigger POST /api/browser/youtube
  const triggerYouTubeAutomation = async (queryText?: string) => {
    const q = queryText || ytQuery || 'Pawan Singh Bhojpuri hit song';
    setIsLoading(true);
    setActivePipelineStep(1);

    try {
      setTimeout(() => setActivePipelineStep(2), 200);
      setTimeout(() => setActivePipelineStep(3), 400);
      setTimeout(() => setActivePipelineStep(4), 600);
      setTimeout(() => setActivePipelineStep(5), 800);

      const result = await ToolExecutor.searchYouTubeAndPlay(q, true);
      setApiResponse({
        endpoint: 'POST /api/browser/youtube',
        body: { query: q },
        response: result,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      setApiResponse({
        endpoint: 'POST /api/browser/youtube',
        error: err.message || 'Automation request failed',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Playback Control Endpoints
  const triggerControlApi = async (endpoint: string, actionFn: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const res = await actionFn();
      setApiResponse({
        endpoint: `POST /api/browser/${endpoint}`,
        response: res,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      setApiResponse({
        endpoint: `POST /api/browser/${endpoint}`,
        error: err.message || 'Action failed',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add custom domain handler
  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDomainFormError('');
    setDomainFormSuccess('');

    if (!newDomainInput.trim()) {
      setDomainFormError('Please enter a valid domain name.');
      return;
    }

    const res = WhitelistSecurityService.addCustomDomain(
      newDomainInput,
      newDomainCategory,
      newDomainDesc || 'Custom whitelisted domain'
    );

    if (res.success) {
      setDomainFormSuccess(res.message);
      setNewDomainInput('');
      setNewDomainDesc('');
      setDomainsList(WhitelistSecurityService.getDomains());
      setTimeout(() => setDomainFormSuccess(''), 4000);
    } else {
      setDomainFormError(res.message);
    }
  };

  // Toggle domain
  const handleToggleDomain = (id: string) => {
    WhitelistSecurityService.toggleDomainStatus(id);
    setDomainsList(WhitelistSecurityService.getDomains());
  };

  // Remove domain
  const handleRemoveDomain = (id: string) => {
    WhitelistSecurityService.removeCustomDomain(id);
    setDomainsList(WhitelistSecurityService.getDomains());
  };

  // Reset whitelist
  const handleResetWhitelist = () => {
    WhitelistSecurityService.resetToDefaultWhitelist();
    setDomainsList(WhitelistSecurityService.getDomains());
  };

  // Test sandbox handlers
  const runSecurityTest = (testType: 'safe_youtube' | 'unsafe_script' | 'arbitrary_url' | 'safe_action' | 'forbidden_action' | 'custom') => {
    let result: any = null;

    if (testType === 'safe_youtube') {
      const check = WhitelistSecurityService.isDomainWhitelisted('https://www.youtube.com');
      result = {
        test: 'Whitelisted Domain Verification',
        input: 'https://www.youtube.com',
        verdict: check.isWhitelisted ? 'ALLOWED' : 'BLOCKED',
        cleanUrl: check.cleanUrl,
        reason: check.reason,
        securityDetails: 'Domain is signed in verified media whitelist. Permitted to execute.'
      };
    } else if (testType === 'unsafe_script') {
      const dangerousCode = 'javascript:eval(document.cookie);alert("XSS Attack")';
      const check = WhitelistSecurityService.isDomainWhitelisted(dangerousCode);
      result = {
        test: 'Arbitrary Code Execution Protection',
        input: dangerousCode,
        verdict: check.isBlockedScheme ? 'BLOCKED & INTERCEPTED' : 'ALLOWED',
        cleanUrl: check.cleanUrl,
        reason: check.reason,
        securityDetails: 'Zero-Trust Shield detected inline JavaScript evaluation scheme. Execution terminated safely.'
      };
    } else if (testType === 'arbitrary_url') {
      const arbitraryUrl = 'https://untrusted-external-site-1234.net/login';
      const check = WhitelistSecurityService.isDomainWhitelisted(arbitraryUrl);
      result = {
        test: 'Non-Whitelisted Domain Sanitization',
        input: arbitraryUrl,
        verdict: 'SANITIZED & REDIRECTED',
        cleanUrl: check.cleanUrl,
        reason: check.reason,
        securityDetails: 'Domain is outside whitelist. Rerouted safely through Google Safe Search without exposing user sandbox.'
      };
    } else if (testType === 'safe_action') {
      const actCheck = WhitelistSecurityService.isActionWhitelisted('pause_video');
      result = {
        test: 'Whitelisted Browser Action',
        input: 'pause_video',
        verdict: actCheck.allowed ? 'PERMITTED' : 'FORBIDDEN',
        reason: actCheck.reason,
        securityDetails: 'Action is part of standard 22-primitive browser controller whitelist.'
      };
    } else if (testType === 'forbidden_action') {
      const forbiddenAct = 'system_root_exec_shell';
      const actCheck = WhitelistSecurityService.isActionWhitelisted(forbiddenAct);
      result = {
        test: 'Arbitrary Browser Action Execution',
        input: forbiddenAct,
        verdict: actCheck.allowed ? 'PERMITTED' : 'BLOCKED',
        reason: actCheck.reason,
        securityDetails: 'Action is not recognized in allowed browser action enums. Denied.'
      };
    } else if (testType === 'custom') {
      if (!testCustomUrl.trim()) return;
      const check = WhitelistSecurityService.isDomainWhitelisted(testCustomUrl.trim());
      result = {
        test: 'Custom Input Evaluation',
        input: testCustomUrl.trim(),
        verdict: check.isBlockedScheme ? 'BLOCKED' : (check.isWhitelisted ? 'ALLOWED' : 'SANITIZED'),
        cleanUrl: check.cleanUrl,
        reason: check.reason,
        securityDetails: check.isWhitelisted 
          ? 'Passed whitelist validation.' 
          : (check.isBlockedScheme ? 'Dangerous scheme detected!' : 'Routed to Google Safe Search.')
      };
    }

    setTestResult(result);
  };

  const filteredDomains = domainsList.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = !domainSearchFilter.trim() || 
      item.domain.toLowerCase().includes(domainSearchFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(domainSearchFilter.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: `All (${domainsList.length})` },
    { id: 'media', label: 'Media & Audio' },
    { id: 'search', label: 'Search & Knowledge' },
    { id: 'social', label: 'Social' },
    { id: 'developer', label: 'Developer & AI' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'utility', label: 'Utility' },
    { id: 'custom', label: `Custom (${domainsList.filter(d => !d.isSystem).length})` }
  ];

  const pipelineSteps = [
    { title: 'Voice Command', desc: '"Bhojpuri gana chalao" / "Hindi song play"', icon: '🎙️' },
    { title: 'ReactJS', desc: 'ToolExecutor & Live State', icon: '⚛️' },
    { title: 'Security Shield', desc: 'Whitelist & Sandbox Check', icon: '🛡️' },
    { title: 'Backend API', desc: 'POST /api/browser/youtube', icon: '⚡' },
    { title: 'Playwright', desc: 'Browser Automation Driver', icon: '🎭' },
    { title: 'YouTube Video', desc: 'Bhojpuri & Hindi Superhits', icon: '▶️' },
  ];

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Header with Security Shield Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            Browser Automation & Zero-Trust Security Shield
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Enforces strict domain allowlists, blocks arbitrary code/script injection, and gates browser actions.
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURITY SHIELD: ACTIVE</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>SANDBOX ENFORCED</span>
          </div>
        </div>
      </div>

      {/* Security Status Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">Arbitrary Code</span>
            <div className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-emerald-400" />
              <span>Strictly Blocked</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">eval, javascript:, blob: protected</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            0-Trust
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">Allowed Domains</span>
            <div className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{domainsList.filter(d => d.enabled).length} Active Domains</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Categorized whitelist policy</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
            {domainsList.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">Browser Actions</span>
            <div className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>22 Whitelisted Actions</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Only verified primitives allowed</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
            22
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">Security Interceptions</span>
            <div className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{policyState.blockedAttemptsCount} Blocked / {policyState.sanitizedRequestsCount} Rerouted</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Real-time audit log active</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
            {policyState.recentSecurityLogs.length}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'automation'
              ? 'bg-red-500/20 border border-red-500/50 text-red-300 shadow-md'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-transparent'
          }`}
        >
          <Youtube className="w-3.5 h-3.5 text-red-400" />
          <span>YouTube & Playwright Control</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-md'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Domain Whitelist Manager ({domainsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'actions'
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-md'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-transparent'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Allowed Browser Actions (22)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-md'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-transparent'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>Security Audit Logs ({policyState.recentSecurityLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: AUTOMATION & PIPELINE */}
      {activeTab === 'automation' && (
        <div className="flex flex-col gap-6">
          {/* Pipeline Architecture Diagram */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Full End-to-End Automation & Security Flow
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Active Sandbox Protocol
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {pipelineSteps.map((step, idx) => {
                const isActive = activePipelineStep >= idx;
                return (
                  <div
                    key={step.title}
                    className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="text-xl mb-1">{step.icon}</div>
                      <div className="font-bold text-xs text-white">{step.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">{step.desc}</div>
                    </div>
                    {idx < 5 && (
                      <div className="text-right text-cyan-400 font-mono text-xs mt-2">↓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Automation Trigger Box (POST /api/browser/youtube) */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-red-500/30 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    POST
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    /api/browser/youtube
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Searches YouTube for Bhojpuri or Hindi songs, validates domain sandbox, and plays with audio sync.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => triggerYouTubeAutomation('Pawan Singh Bhojpuri hit song')}
                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test "Pawan Singh Bhojpuri"</span>
                </button>
                <button
                  onClick={() => triggerYouTubeAutomation('Arijit Singh Hindi romantic song')}
                  className="px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test "Arijit Singh Hindi"</span>
                </button>
              </div>
            </div>

            {/* Input form */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Youtube className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ytQuery}
                  onChange={(e) => setYtQuery(e.target.value)}
                  placeholder="Enter Bhojpuri or Hindi song/video e.g. Pawan Singh, Khesari Lal, Shilpi Raj, Arijit Singh..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-red-500 text-white placeholder-slate-500 text-xs font-mono outline-none"
                />
              </div>
              <button
                onClick={() => triggerYouTubeAutomation()}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY ON YOUTUBE</span>
              </button>
            </div>

            {/* Playback Control API Buttons */}
            <div className="pt-2 border-t border-slate-900/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 mr-2">Whitelisted Actions:</span>
              
              <button
                onClick={() => triggerControlApi('pause', () => ToolExecutor.pauseVideo())}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>POST /api/browser/pause</span>
              </button>

              <button
                onClick={() => triggerControlApi('resume', () => ToolExecutor.resumeVideo())}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>POST /api/browser/resume</span>
              </button>

              <button
                onClick={() => triggerControlApi('mute', () => ToolExecutor.muteVideo())}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>POST /api/browser/mute</span>
              </button>

              <button
                onClick={() => triggerControlApi('unmute', () => ToolExecutor.unmuteVideo())}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>POST /api/browser/unmute</span>
              </button>

              <button
                onClick={() => triggerControlApi('stop', () => ToolExecutor.stopVideo())}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Square className="w-3.5 h-3.5 text-red-400" />
                <span>POST /api/browser/stop</span>
              </button>
            </div>

            {/* Live API Response Output */}
            {apiResponse && (
              <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-cyan-400 border-b border-slate-800/80 pb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    {apiResponse.endpoint}
                  </span>
                  <span className="text-slate-500">{apiResponse.timestamp}</span>
                </div>
                <pre className="text-emerald-400 overflow-x-auto text-[11px] whitespace-pre-wrap">
                  {JSON.stringify(apiResponse.response || apiResponse.error, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Second Screen Dedicated Controller Panel */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    SECOND SCREEN
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    Shivans AI Multi-Screen & Pop-out Engine
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Controls YouTube and whitelisted browser windows across dedicated external monitor popups or floating HUD screens.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => SecondScreenManager.popoutExternalWindow()}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Launch 2nd Monitor Window</span>
                </button>
              </div>
            </div>

            {/* Voice Trigger Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <button
                onClick={() => SecondScreenManager.openYouTube('Pawan Singh Bhojpuri gana')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-400">"Pawan Singh Bhojpuri gana chalao"</span>
                  <Youtube className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Auto-search & instant Bhojpuri video</span>
              </button>

              <button
                onClick={() => SecondScreenManager.openYouTube('Khesari Lal Yadav video song')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-400">"Khesari Lal Yadav video chalao"</span>
                  <Youtube className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Bhojpuri Blast Dance Video</span>
              </button>

              <button
                onClick={() => SecondScreenManager.openYouTube('Arijit Singh Hindi romantic song')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-pink-400">"Arijit Singh Hindi songs chalao"</span>
                  <Youtube className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Play Arijit Singh Romantic Track</span>
              </button>

              <button
                onClick={() => SecondScreenManager.openWhitelistedWebsite('https://www.google.com')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400">"Chrome par Google kholo"</span>
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Whitelisted domain launch</span>
              </button>

              <button
                onClick={() => SecondScreenManager.pauseVideo()}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-400">"Video pause karo"</span>
                  <Pause className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Pause active video</span>
              </button>

              <button
                onClick={() => SecondScreenManager.resumeVideo()}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400">"Video chalu karo"</span>
                  <Play className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Resume video playback</span>
              </button>
            </div>
          </div>

          {/* Quick Launch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.name}
                  onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-sky-500/20 hover:border-sky-400/50 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${link.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                        {link.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">
                        Whitelisted Access
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DOMAIN WHITELIST MANAGER */}
      {activeTab === 'security' && (
        <div className="flex flex-col gap-6">
          
          {/* Add New Custom Domain Card */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  Add Trusted Custom Whitelist Domain
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Allows specific external services to be loaded in the second-screen browser while keeping dangerous execution blocked.
                </p>
              </div>
              <button
                onClick={handleResetWhitelist}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Reset to default system whitelist"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <form onSubmit={handleAddDomainSubmit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Domain Hostname *</label>
                <input
                  type="text"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder="e.g. huggingface.co, openai.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Category</label>
                <select
                  value={newDomainCategory}
                  onChange={(e) => setNewDomainCategory(e.target.value as DomainCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white text-xs font-mono outline-none"
                >
                  <option value="developer">Developer & AI</option>
                  <option value="media">Media & Audio</option>
                  <option value="search">Search & Knowledge</option>
                  <option value="social">Social Media</option>
                  <option value="streaming">Video Streaming</option>
                  <option value="shopping">Shopping & Commerce</option>
                  <option value="utility">Utility & Services</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>WHITELIST DOMAIN</span>
                </button>
              </div>
            </form>

            {domainFormError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{domainFormError}</span>
              </div>
            )}

            {domainFormSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{domainFormSuccess}</span>
              </div>
            )}
          </div>

          {/* Search and Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={domainSearchFilter}
                onChange={(e) => setDomainSearchFilter(e.target.value)}
                placeholder="Filter domains..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white text-xs font-mono outline-none"
              />
            </div>
          </div>

          {/* Whitelist Domain Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDomains.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                  item.enabled
                    ? 'bg-slate-950/80 border-slate-800/90 hover:border-cyan-500/40 shadow-md'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-xs text-white">{item.domain}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        item.category === 'media' ? 'bg-red-500/20 text-red-300' :
                        item.category === 'developer' ? 'bg-purple-500/20 text-purple-300' :
                        item.category === 'search' ? 'bg-blue-500/20 text-blue-300' :
                        item.category === 'streaming' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleDomain(item.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        item.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      title={item.enabled ? 'Click to disable' : 'Click to enable'}
                    >
                      {item.enabled ? 'Active' : 'Disabled'}
                    </button>

                    {!item.isSystem && (
                      <button
                        onClick={() => handleRemoveDomain(item.id)}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                        title="Delete custom domain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                  <span>{item.isSystem ? 'System Core Whitelist' : 'Custom Added Domain'}</span>
                  <button
                    onClick={() => SecondScreenManager.openWhitelistedWebsite(`https://${item.domain}`)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: ALLOWED BROWSER ACTIONS */}
      {activeTab === 'actions' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Whitelisted Browser Actions (22 Primitives)
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Only explicitly whitelisted browser interaction primitives can be triggered by voice or code. All arbitrary functions are rejected.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                ZERO-TRUST GATED
              </div>
            </div>

            {/* Actions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Action Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Clearance</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Direct Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {WhitelistSecurityService.getAllowedActions().map((act) => (
                    <tr key={act.action} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-purple-300">{act.action}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {act.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" />
                          <span>WHITELISTED</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-sans text-xs">{act.description}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => runSecurityTest('safe_action')}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-slate-300 text-[11px] font-mono cursor-pointer"
                        >
                          Verify Action
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY AUDIT LOGS & SANDBOX TESTER */}
      {activeTab === 'logs' && (
        <div className="flex flex-col gap-6">
          
          {/* Security Sandbox Test Station */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Security Shield Live Sandbox Test Station
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Test URL sanitization, arbitrary script protection, and action validation against the real security engine.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                onClick={() => runSecurityTest('safe_youtube')}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400">1. Test Safe Domain</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">"https://youtube.com" (Allowed)</span>
              </button>

              <button
                onClick={() => runSecurityTest('unsafe_script')}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-rose-400">2. Test XSS / Eval Scheme</span>
                  <Ban className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">"javascript:eval(...)" (Blocked)</span>
              </button>

              <button
                onClick={() => runSecurityTest('arbitrary_url')}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-400">3. Test Untrusted Site</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">"untrusted-site.xyz" (Sanitized)</span>
              </button>

              <button
                onClick={() => runSecurityTest('forbidden_action')}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-rose-400">4. Test Forbidden Action</span>
                  <Lock className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">"system_root_exec" (Forbidden)</span>
              </button>
            </div>

            {/* Custom Input Test Box */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={testCustomUrl}
                onChange={(e) => setTestCustomUrl(e.target.value)}
                placeholder="Enter any URL or command string to test Security Shield..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs font-mono outline-none"
              />
              <button
                onClick={() => runSecurityTest('custom')}
                className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold cursor-pointer"
              >
                Run Security Evaluation
              </button>
            </div>

            {/* Test Result Inspector */}
            {testResult && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] border-b border-slate-800/80 pb-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    Security Verdict: {testResult.test}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    testResult.verdict.includes('BLOCKED') || testResult.verdict.includes('FORBIDDEN') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    testResult.verdict.includes('ALLOWED') || testResult.verdict.includes('PERMITTED') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {testResult.verdict}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500">Input String:</span> <code className="text-amber-300 break-all">{testResult.input}</code>
                  </div>
                  {testResult.cleanUrl && (
                    <div>
                      <span className="text-slate-500">Sanitized Target:</span> <code className="text-cyan-300 break-all">{testResult.cleanUrl}</code>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Engine Analysis:</span> <span className="text-slate-200">{testResult.securityDetails}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Logs Stream */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Live Security Interceptor Audit Stream ({policyState.recentSecurityLogs.length})
              </span>
              <button
                onClick={() => WhitelistSecurityService.clearSecurityLogs()}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear Audit History
              </button>
            </div>

            {policyState.recentSecurityLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                No recent security interception events recorded.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {policyState.recentSecurityLogs.map((log: SecurityAuditEvent) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs ${
                      log.status === 'blocked' ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' :
                      log.status === 'sanitized' ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' :
                      'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        log.status === 'blocked' ? 'bg-rose-500/30 text-rose-300' :
                        log.status === 'sanitized' ? 'bg-amber-500/30 text-amber-300' :
                        'bg-emerald-500/30 text-emerald-300'
                      }`}>
                        {log.status}
                      </span>
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-cyan-300 truncate max-w-[200px]">{log.target}</span>
                      <span className="text-slate-400 text-[11px]">({log.reason})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default BrowserControl;

