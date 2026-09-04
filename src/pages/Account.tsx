import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Settings, LogOut, Hexagon, ShieldAlert, Cpu } from "lucide-react";
import { useState } from "react";
import MagneticWrapper from "../components/MagneticWrapper";
import { useToast } from "../components/common/Toast";

/**
 * ⚠️ THERE IS NO ACCOUNT SYSTEM BEHIND THIS PAGE.
 *
 * No sign-in exists anywhere in the app; the profile shown is a hard-coded
 * GUEST_OPERATIVE. That is fine as a preview — but two controls here claimed
 * to have DONE something:
 *
 *  · "Cycle Encryption Key" announced "Generating new 2048-bit encryption
 *    key..." then "Encryption key cycled successfully. Node secured." while
 *    changing nothing. That is the dangerous one: somebody who feared their
 *    password was compromised would press it, be told they were secure, and
 *    remain exactly as exposed.
 *  · "Disconnect Node" reported "Operator session ended" when there was no
 *    session to end.
 *
 * Both are now honest. Flip ACCOUNTS_ENABLED when real accounts exist.
 */
const ACCOUNTS_ENABLED = false;

export default function Account() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { addToast } = useToast();

  return (
    <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-[80vh] relative">
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-red-900/10 blur-[200px] pointer-events-none rounded-full mix-blend-screen" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
        className="mb-20 relative z-10 border-b border-editorial-border pb-10 flex flex-col md:flex-row justify-between items-end gap-10"
      >
        <div>
          <span className="font-mono text-[0.6875rem] xl:text-[0.75rem] text-red-500 font-black tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] mb-8 block uppercase flex items-center gap-4 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
            <Hexagon className="w-5 h-5 animate-[spin_10s_linear_infinite]" /> OPERATIVE_DASHBOARD
          </span>
          <h1 className="font-black uppercase tracking-tighter leading-[0.85] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-display-md">
            Command <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] pb-4 inline-block">Center</span>
          </h1>

          {/* Said up front rather than only when a button is pressed: a page
              that looks like a real account should say when it is not one. */}
          {!ACCOUNTS_ENABLED && (
            <p className="mt-8 max-w-md rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] px-6 py-4 text-sm leading-relaxed text-editorial-text-muted">
              <span className="mb-1 block font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-amber-400">
                Preview
              </span>
              Accounts aren&rsquo;t live yet, so this is a placeholder profile —
              nothing here is stored and there is no sign-in.
            </p>
          )}
        </div>
        <div className="hidden md:flex gap-5 items-center bg-editorial-bg/60 p-5 xl:p-6 border border-editorial-border rounded-2xl backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] transform-gpu hover:-translate-y-1 transition-transform duration-500">
           <Cpu className="w-6 h-6 text-red-500 drop-shadow-[0_0_5px_currentColor]" />
           <div className="flex flex-col gap-1">
              <span className="font-mono text-[0.6875rem] xl:text-[0.6875rem] uppercase tracking-widest text-editorial-text-muted font-bold">System_Status</span>
              <span className="font-mono text-sm xl:text-base uppercase tracking-widest text-emerald-500 font-black drop-shadow-[0_0_8px_#10b981] flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> OPTIMAL
              </span>
           </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12 xl:gap-16 relative z-10">
        <div className="lg:col-span-3 space-y-4">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left p-6 font-black uppercase text-[0.75rem] tracking-[0.2em] flex items-center gap-5 transition-all duration-500 rounded-2xl group relative overflow-hidden ${activeTab === 'profile' ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.4)]' : 'bg-editorial-bg/80 border border-editorial-border text-editorial-text-muted hover:text-editorial-text hover:border-red-500/50 hover:bg-editorial-surface/90 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)]'}`}
          >
            {activeTab === 'profile' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-editorial-text shadow-[0_0_10px_#fff]" />}
            <User className={`w-6 h-6 transition-transform duration-500 ${activeTab === 'profile' ? 'scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]' : 'group-hover:scale-110 group-hover:text-red-500'}`} /> Identity Profile
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left p-6 font-black uppercase text-[0.75rem] tracking-[0.2em] flex items-center gap-5 transition-all duration-500 rounded-2xl group relative overflow-hidden ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.4)]' : 'bg-editorial-bg/80 border border-editorial-border text-editorial-text-muted hover:text-editorial-text hover:border-red-500/50 hover:bg-editorial-surface/90 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)]'}`}
          >
            {activeTab === 'orders' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-editorial-text shadow-[0_0_10px_#fff]" />}
            <Package className={`w-6 h-6 transition-transform duration-500 ${activeTab === 'orders' ? 'scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]' : 'group-hover:scale-110 group-hover:text-red-500'}`} /> Logistics History
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left p-6 font-black uppercase text-[0.75rem] tracking-[0.2em] flex items-center gap-5 transition-all duration-500 rounded-2xl group relative overflow-hidden ${activeTab === 'settings' ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.4)]' : 'bg-editorial-bg/80 border border-editorial-border text-editorial-text-muted hover:text-editorial-text hover:border-red-500/50 hover:bg-editorial-surface/90 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)]'}`}
          >
            {activeTab === 'settings' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-editorial-text shadow-[0_0_10px_#fff]" />}
            <Settings className={`w-6 h-6 transition-transform duration-500 ${activeTab === 'settings' ? 'scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]' : 'group-hover:scale-110 group-hover:text-red-500'}`} /> System Config
          </button>
          <button 
            onClick={() => {
              if (!ACCOUNTS_ENABLED) {
                // No session exists, so nothing is ended — just go home quietly.
                navigate("/");
                return;
              }
              addToast("Disconnecting neural node...", "info");
              setTimeout(() => {
                 navigate("/");
                 addToast("Node disconnected successfully. Operator session ended.", "success");
              }, 1500);
            }}
            className="w-full text-left p-6 font-black uppercase text-[0.75rem] tracking-[0.2em] flex items-center gap-5 transition-all duration-500 rounded-2xl group bg-transparent text-zinc-600 hover:text-red-500 mt-16 hover:bg-red-950/30 border border-transparent hover:border-red-900/50"
          >
            <LogOut className="w-6 h-6 group-hover:-translate-x-2 transition-transform duration-500" /> Disconnect Node
          </button>
        </div>

        <div className="lg:col-span-9 h-full min-h-[500px]">
           {activeTab === 'profile' && (
             <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-8 h-full">
                <div className="bg-editorial-bg/90 p-12 xl:p-16 border border-editorial-border rounded-[2rem] relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)] h-full backdrop-blur-3xl group">
                   <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none mix-blend-screen" />
                   <h2 className="font-sans font-black text-3xl uppercase tracking-tighter border-b border-editorial-border pb-8 mb-12 text-editorial-text drop-shadow-[0_2px_10px_rgba(0,0,0,0.08)]">Operative Details</h2>
                   <div className="grid md:grid-cols-2 gap-12 relative z-10">
                     <div className="bg-editorial-bg/60 p-8 rounded-2xl border border-editorial-border shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                       <label className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-red-500 mb-4 block flex items-center gap-3"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Callsign (Name)</label>
                       <p className="font-mono text-xl xl:text-2xl tracking-widest text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">GUEST_OPERATIVE</p>
                     </div>
                     <div className="bg-editorial-bg/60 p-8 rounded-2xl border border-editorial-border shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                       <label className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-red-500 mb-4 block flex items-center gap-3"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Comms Link (Email)</label>
                       <p className="font-mono text-xl xl:text-2xl tracking-widest text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] break-all">GUEST@RAWOFFICIAL.CO</p>
                     </div>
                   </div>
                   <div className="mt-16 pt-10 border-t border-editorial-border flex justify-end relative z-10">
                      <MagneticWrapper>
            <button 
               onClick={() => addToast(ACCOUNTS_ENABLED ? "Initializing parameter edit interface..." : "Accounts are not live yet — nothing to edit.", "info")}
               className="bg-editorial-text text-editorial-bg px-12 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[0.75rem] hover:bg-red-600 hover:text-white transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.4)] transform-gpu hover:-translate-y-1">
               Edit Parameters
            </button>
                      </MagneticWrapper>
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'orders' && (
             <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="bg-editorial-bg/90 p-12 xl:p-16 border border-editorial-border rounded-[2rem] text-center py-32 xl:py-48 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)] h-full flex flex-col items-center justify-center backdrop-blur-3xl group">
               <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none mix-blend-screen" />
               <Package className="w-20 h-20 text-zinc-600 mx-auto mb-10 relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.08)]" />
               <h3 className="font-black uppercase tracking-[0.2em] text-3xl mb-6 text-editorial-text relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">No Active Deployments</h3>
               <p className="text-editorial-text-muted font-mono text-[0.75rem] uppercase tracking-[0.4em] relative z-10 font-bold">Your logistics history is empty.</p>
               <MagneticWrapper>
                 <Link to="/shop" className="inline-block mt-12 bg-red-600 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[0.75rem] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-500 relative z-10 shadow-[0_15px_40px_rgba(220,38,38,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transform-gpu hover:-translate-y-1">
                    Access Inventory
                 </Link>
               </MagneticWrapper>
             </motion.div>
           )}

           {activeTab === 'settings' && (
             <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-8 h-full">
                <div className="bg-editorial-bg/90 p-12 xl:p-16 border border-editorial-border rounded-[2rem] relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)] h-full backdrop-blur-3xl group">
                   <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none mix-blend-screen" />
                   <h2 className="font-sans font-black text-3xl uppercase tracking-tighter border-b border-editorial-border pb-8 mb-12 text-editorial-text drop-shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center gap-4">
                     <ShieldAlert className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_#dc2626]" /> Security Protocols
                   </h2>
                   <div className="space-y-10 relative z-10">
                      <div className="bg-editorial-bg/60 p-10 rounded-2xl border border-editorial-border shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                        <label className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-red-500 mb-6 block flex items-center gap-3"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Encryption Key (Password)</label>
                        <p className="font-mono text-4xl xl:text-5xl tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">••••••••</p>
                      </div>
                      <MagneticWrapper>
                        <button 
                          disabled={!ACCOUNTS_ENABLED}
                          onClick={() => {
                            if (!ACCOUNTS_ENABLED) {
                              addToast("Accounts are not live yet — there is no password to change.", "info");
                              return;
                            }
                            addToast("Generating new 2048-bit encryption key...", "info");
                            setTimeout(() => {
                               addToast("Encryption key cycled successfully. Node secured.", "success");
                            }, 1500);
                          }}
                          className="bg-transparent border border-editorial-border-light text-editorial-text px-12 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[0.75rem] hover:bg-editorial-text hover:text-editorial-bg hover:border-white transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transform-gpu hover:-translate-y-1">
                          Cycle Encryption Key
                        </button>
                      </MagneticWrapper>
                   </div>
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
