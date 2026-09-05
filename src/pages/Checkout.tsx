import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";

/**
 * ⚠️ THE ONE SWITCH THAT MAKES THIS SHOP REAL.
 *
 * While false, the checkout collects no card details and never claims an
 * order was placed. Set it to true only when a payment processor is actually
 * connected — the moment this is true, the page will tell customers their
 * order is confirmed, so it must not be true before that is a fact.
 */
const PAYMENTS_ENABLED = false;

export default function Checkout() {
  const { items, cartTotal, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notLive, setNotLive] = useState(false);
  // The processor's own order reference, shown on the confirmation screen. Never invented locally.
  const [orderRef, setOrderRef] = useState<string | null>(null);

  /**
   * ⚠️ ORDERING IS NOT LIVE, AND THE PAGE NOW SAYS SO.
   *
   * What this did before: waited 2.5 seconds, declared "Order Protocol
   * Confirmed. Awaiting Dispatch.", invented a TRANSACTION_HASH to make the
   * order look verifiable, and emptied the cart. No payment processor, no
   * order record, nothing sent anywhere. A customer would have typed their
   * card number, expiry and CVV into a form connected to nothing and been
   * told their purchase succeeded.
   *
   * That is the most damaging thing a shop can do, so the simulated
   * confirmation is gone for good. Flipping PAYMENTS_ENABLED alone does NOT
   * confirm anything: the enabled branch below is the seam where the real
   * processor call goes. Only its response may set orderRef and isSuccess.
   */
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!PAYMENTS_ENABLED) {
      setNotLive(true);
      // The cart is deliberately NOT cleared: nothing was bought.
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsProcessing(true);
    // INTEGRATION SEAM — replace this block with the real processor call:
    //   const { orderRef } = await processor.createOrder({ items, cartTotal, ...form });
    //   setOrderRef(orderRef);
    //   items.forEach(item => removeFromCart(item.id));
    //   setIsSuccess(true);
    // Until that call exists nothing is confirmed, no matter what the switch says.
    setIsProcessing(false);
    setNotLive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center relative">
        <motion.div
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }}
           className="text-center py-20 bg-editorial-bg border border-editorial-border rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] px-10 max-w-xl mx-auto w-full"
        >
           <ShieldCheck className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
           <span className="font-mono text-xs text-editorial-text-muted uppercase tracking-widest font-bold block mb-2">Cart Empty</span>
           <p className="text-zinc-600 font-light mx-auto mb-8">You have no active hardware or nutrient protocols in your deployment queue.</p>
           <Link to="/shop" className="inline-block bg-red-600 text-white hover:bg-editorial-text hover:text-editorial-bg transition-all px-8 py-4 rounded-xl font-black uppercase text-[0.6875rem] tracking-widest">
             Browse Archive
           </Link>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none mix-blend-screen" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-editorial-bg/90 backdrop-blur-3xl border border-emerald-500/30 p-16 xl:p-24 rounded-[3rem] relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] w-full"
        >
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-12 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
             <CheckCircle className="w-12 h-12 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
          <h1 className="font-black uppercase tracking-tighter mb-6 text-editorial-text drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-display-sm">Logistics <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700 pb-2">Initialized</span></h1>
          <p className="text-editorial-text-muted mb-12 font-mono text-[0.6875rem] xl:text-[0.75rem] tracking-[0.4em] uppercase font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
            Order Protocol Confirmed. Awaiting Dispatch.
          </p>
          {orderRef && (
            <div className="font-mono text-[0.6875rem] text-editorial-text-muted mb-12 border-t border-editorial-border-light pt-10 bg-editorial-bg/60 p-8 rounded-2xl border border-editorial-border inline-block text-left relative z-10 w-full max-w-md mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <span className="font-bold tracking-widest">ORDER_REF:</span>
                <span className="text-editorial-text drop-shadow-[0_0_5px_rgba(0,0,0,0.06)] break-all">{orderRef}</span>
              </div>
            </div>
          )}
          <br className="hidden md:block"/>
          <Link to="/" className="inline-flex items-center gap-4 bg-editorial-text text-editorial-bg px-12 py-6 font-black uppercase tracking-[0.4em] text-[0.75rem] hover:bg-emerald-500 hover:text-editorial-text transition-all duration-500 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] relative z-10 mx-auto group/btn transform-gpu hover:-translate-y-1">
            Return to Base <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-[80vh] relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/10 blur-[200px] pointer-events-none rounded-full mix-blend-screen" />
      <div className="mb-20 border-b border-editorial-border pb-12 relative z-10">
        <span className="font-mono text-[0.6875rem] xl:text-[0.75rem] text-red-500 font-black tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] mb-8 block uppercase flex items-center gap-4 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
          <ShieldCheck className="w-6 h-6" /> SECURE_CHECKOUT // SSL_ENCRYPTED
        </span>
        <h1 className="font-black uppercase tracking-tighter leading-[0.85] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-display-md">
          Finalize <br /> <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-900 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] pb-4 inline-block">Logistics</span>
        </h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_0.8fr] gap-16 xl:gap-24 relative z-10">
        <div>
          {!PAYMENTS_ENABLED && (
            <div className="mb-10 rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] p-6">
              <p className="font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-amber-400">
                Ordering is not open yet
              </p>
              <p className="mt-3 text-sm leading-relaxed text-editorial-text-muted">
                This checkout is not connected to a payment provider, so no order
                can be placed and no card is taken. The form is disabled for
                that reason — please don&rsquo;t enter card details anywhere on
                this page. Your basket is kept as it is.
              </p>
            </div>
          )}

          {notLive && (
            <div
              role="status"
              className="mb-10 rounded-2xl border border-red-500/50 bg-red-500/10 p-6"
            >
              <p className="font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-red-300">
                No order was placed
              </p>
              <p className="mt-3 text-sm leading-relaxed text-editorial-text-muted">
                RAW is not taking orders through this site yet. Nothing has been
                charged and nothing has been sent — your basket is untouched, so
                you can come back to it when ordering opens.
              </p>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-12">
            {/* Contact */}
            <div className="bg-editorial-bg/80 backdrop-blur-3xl p-10 xl:p-14 border border-editorial-border rounded-[2rem] space-y-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] hover:border-red-500/40 transition-colors duration-[800ms] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] shadow-[0_0_15px_#dc2626]" />
              <h2 className="font-sans font-black text-3xl uppercase tracking-tighter border-b border-editorial-border pb-8 text-editorial-text group-hover:text-red-500 transition-colors duration-[800ms] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Contact Information</h2>
              <div className="space-y-4">
                <label htmlFor="co-email" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">Email Address</label>
                <input id="co-email" required disabled={!PAYMENTS_ENABLED} type="email" autoComplete="email" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-lg text-editorial-text shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg placeholder:text-zinc-600 hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" placeholder="operative@domain.com" />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-editorial-bg/80 backdrop-blur-3xl p-10 xl:p-14 border border-editorial-border rounded-[2rem] space-y-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] hover:border-red-500/40 transition-colors duration-[800ms] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] shadow-[0_0_15px_#dc2626]" />
              <h2 className="font-sans font-black text-3xl uppercase tracking-tighter border-b border-editorial-border pb-8 text-editorial-text group-hover:text-red-500 transition-colors duration-[800ms] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Shipping Protocol</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label htmlFor="co-first-name" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">First Name</label>
                  <input id="co-first-name" required disabled={!PAYMENTS_ENABLED} autoComplete="given-name" type="text" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-lg text-editorial-text shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
                </div>
                <div className="space-y-4">
                  <label htmlFor="co-last-name" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">Last Name</label>
                  <input id="co-last-name" required disabled={!PAYMENTS_ENABLED} autoComplete="family-name" type="text" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-lg text-editorial-text shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
                </div>
              </div>
              <div className="space-y-4">
                <label htmlFor="co-address" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">Sector / Address</label>
                <input id="co-address" required disabled={!PAYMENTS_ENABLED} autoComplete="street-address" type="text" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-lg text-editorial-text shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label htmlFor="co-city" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">City</label>
                  <input id="co-city" required disabled={!PAYMENTS_ENABLED} autoComplete="address-level2" type="text" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-lg text-editorial-text shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
                </div>
                <div className="space-y-4">
                  <label htmlFor="co-postal-code" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">Postal Code</label>
                  <input id="co-postal-code" required disabled={!PAYMENTS_ENABLED} autoComplete="postal-code" type="text" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-lg text-editorial-text shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-editorial-bg/80 backdrop-blur-3xl p-10 xl:p-14 border border-editorial-border rounded-[2rem] space-y-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden group hover:border-red-500/40 transition-colors duration-[800ms]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <ShieldCheck className="w-64 h-64" />
              </div>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-l from-transparent via-red-600/50 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] shadow-[0_0_15px_#dc2626]" />
              
              <h2 className="font-sans font-black text-3xl uppercase tracking-tighter border-b border-editorial-border pb-8 relative z-10 text-editorial-text group-hover:text-red-500 transition-colors duration-[800ms] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Payment Mechanism</h2>
              <div className="space-y-4 relative z-10">
                <label htmlFor="co-card-number" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">Card Number</label>
                <input id="co-card-number" required={PAYMENTS_ENABLED} disabled={!PAYMENTS_ENABLED} autoComplete="off" type="text" inputMode="numeric" pattern="[0-9 ]{13,23}" title="13 to 19 digits, spaces allowed" placeholder="0000 0000 0000 0000" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-xl text-editorial-text tracking-widest shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg placeholder:text-zinc-600 hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
              </div>
              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                  <label htmlFor="co-card-expiry" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">Expiry (MM/YY)</label>
                  <input id="co-card-expiry" required={PAYMENTS_ENABLED} disabled={!PAYMENTS_ENABLED} autoComplete="off" type="text" inputMode="numeric" placeholder="12/25" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-xl text-editorial-text tracking-widest shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg placeholder:text-zinc-600 hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
                </div>
                <div className="space-y-4">
                  <label htmlFor="co-card-cvc" className="text-[0.6875rem] font-black uppercase tracking-[0.4em] text-editorial-text-muted ml-2">CVC</label>
                  <input id="co-card-cvc" required={PAYMENTS_ENABLED} disabled={!PAYMENTS_ENABLED} autoComplete="off" type="password" inputMode="numeric" placeholder="***" className="w-full bg-editorial-bg/80 backdrop-blur-md border border-editorial-border rounded-2xl px-8 py-6 focus:border-red-500 outline-none transition-all duration-[500ms] font-mono text-xl text-editorial-text tracking-widest shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] focus:bg-editorial-bg placeholder:text-zinc-600 hover:border-editorial-border-light disabled:cursor-not-allowed disabled:opacity-40" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-8">
          <div className="bg-editorial-bg/90 backdrop-blur-3xl border border-editorial-border p-10 xl:p-12 rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)] sticky top-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-overlay" />
            <h2 className="font-sans font-black text-3xl uppercase tracking-tighter mb-10 border-b border-editorial-border pb-8 text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Payload Summary</h2>
            
            {items.length === 0 ? (
              <p className="text-editorial-text-muted font-mono text-[0.6875rem] font-black uppercase tracking-[0.4em] text-center py-16 bg-editorial-bg/40 rounded-2xl border border-editorial-border">No items in payload</p>
            ) : (
              <div className="space-y-6 mb-12 max-h-[45vh] overflow-y-auto custom-scrollbar pr-4 relative z-10">
                {items.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="flex gap-6 group hover:bg-editorial-text/[0.03] p-4 rounded-2xl transition-colors duration-[800ms] border border-transparent hover:border-editorial-border -mx-4" aria-label={`View ${item.name}`}>
                    <div className="w-24 h-24 bg-editorial-text border border-editorial-border-light rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1]" />
                      <div className="absolute inset-0 bg-editorial-bg/10 group-hover:bg-transparent transition-colors duration-[800ms] pointer-events-none" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-sm xl:text-base font-black uppercase tracking-widest text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] mb-3">{item.name}</h3>
                      <p className="font-mono text-[0.6875rem] text-red-500 font-black uppercase tracking-[0.4em]">QTY: {item.quantity}</p>
                    </div>
                    <div className="font-black text-xl xl:text-2xl tracking-tighter text-editorial-text flex items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
                      £{(parseFloat(item.price.replace("£", "")) * item.quantity).toFixed(2)}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="space-y-6 border-t border-editorial-border pt-10 relative z-10">
              <div className="flex justify-between font-mono text-[0.6875rem] xl:text-[0.75rem] font-bold uppercase tracking-[0.4em] text-editorial-text-muted">
                <span>Subtotal</span>
                <span className="text-editorial-text">£{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-mono text-[0.6875rem] xl:text-[0.75rem] font-bold uppercase tracking-[0.4em] text-editorial-text-muted">
                <span>Global Logistics</span>
                <span className="text-emerald-500 font-black drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between items-end font-black text-5xl xl:text-6xl tracking-tighter uppercase text-editorial-text border-t border-editorial-border pt-10 mt-8">
                <span className="text-xl xl:text-2xl pb-2 text-editorial-text-muted font-sans tracking-tight">Total</span>
                <span className="drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-editorial-text relative">
                   <span className="text-2xl opacity-50 mr-1">£</span>{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={!PAYMENTS_ENABLED || items.length === 0 || isProcessing}
              aria-disabled={!PAYMENTS_ENABLED || items.length === 0 || isProcessing}
              className="w-full mt-12 bg-red-600 border-b-[4px] border-red-800 text-white py-7 rounded-2xl font-black uppercase tracking-[0.4em] text-[0.8125rem] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-[800ms] ease-[0.16,1,0.3,1] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 relative overflow-hidden group/btn shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.08)] transform-gpu active:border-b-0 active:translate-y-[2px] z-10"
            >
              {isProcessing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-5 h-5 border-[3px] border-black/30 border-t-black rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.08)]" />
                  <span className="relative z-10 mt-0.5 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] text-editorial-bg">TRANSMITTING...</span>
                </>
              ) : (
                <>
                   <span className="relative z-10 mt-0.5 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] group-hover/btn:drop-shadow-none group-hover/btn:text-editorial-bg">AUTHORIZE DEPLOYMENT</span>
                   {!PAYMENTS_ENABLED && (
                     <span className="relative z-10 font-mono text-[0.5625rem] tracking-widest border border-white/40 rounded px-1.5 py-0.5 pointer-events-none">COMING_SOON</span>
                   )}
                   <ArrowRight className="w-6 h-6 relative z-10 group-hover/btn:translate-x-3 transition-transform duration-[800ms] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] group-hover/btn:drop-shadow-none group-hover/btn:text-editorial-bg" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
