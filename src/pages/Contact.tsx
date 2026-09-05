import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164 } from "../lib/site";

const contactSchema = z.object({
  name: z.string().min(1, "Name cannot be empty."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string(),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormData = z.infer<typeof contactSchema>;

/** The address messages are actually addressed to. */

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  /**
   * ⚠️ THIS FORM USED TO SWALLOW EVERY MESSAGE.
   *
   * onSubmit was `console.log(data)` followed by a screen reading
   * "Transmission Sent — our operatives will review your message and respond
   * within 24 hours". Nothing was sent anywhere. A customer with a problem, or
   * a venue answering the campaign's own invitation to ask for stock, would
   * have been promised a reply to a message nobody would ever see.
   *
   * There is no mail service wired to this site and a static host has no
   * server to add one, so rather than pretend, the form now hands the message
   * to the visitor's own email client, already written and addressed. That
   * genuinely arrives — and the screen afterwards says plainly that it is not
   * sent until they press send there, and shows the address to copy if no mail
   * app opens.
   *
   * When a mail service is added, replace this body with the POST and the
   * original wording becomes true.
   */
  const onSubmit = (data: ContactFormData) => {
    const subject = `[${data.subject || "Enquiry"}] from ${data.name}`;
    const body =
      `${data.message}

` +
      `— 
` +
      `${data.name}
` +
      `${data.email}
` +
      `Sent from rawprotection.com`;

    setIsSubmitted(true);
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-[80vh] relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/10 blur-[200px] pointer-events-none rounded-full z-0 mix-blend-screen" />
      <div className="grid lg:grid-cols-2 gap-24 xl:gap-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          className="flex flex-col justify-center"
        >
          <span className="text-[0.75rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-500 mb-8 block flex items-center gap-4 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping shadow-[0_0_8px_currentColor]" /> Comm_Link Established
          </span>
          <h1 className="font-sans font-black uppercase tracking-tighter leading-[0.8] mb-16 text-editorial-text drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-display-md">
            CONNECT <br /> WITH THE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] pb-3 inline-block">PACK</span>
          </h1>
          
          <div className="space-y-12">
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex gap-8 items-center group w-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              <div className="w-20 h-20 xl:w-24 xl:h-24 rounded-3xl border border-editorial-border bg-editorial-bg/80 backdrop-blur-3xl flex items-center justify-center text-editorial-text-muted group-hover:text-red-500 group-hover:border-red-500/50 group-hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)] group-hover:-translate-y-2 transition-all duration-500 transform-gpu relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Mail className="w-8 h-8 xl:w-10 xl:h-10 group-hover:drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all relative z-10" />
              </div>
              <div className="flex-1 border-b border-editorial-border pb-6 text-left">
                <h4 className="font-sans font-black text-editorial-text uppercase tracking-tighter text-2xl xl:text-3xl mb-2 group-hover:text-red-500 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Email Us</h4>
                <p className="text-editorial-text-muted font-light text-xl xl:text-2xl [overflow-wrap:anywhere]">{CONTACT_EMAIL}</p>
                <p className="text-red-500/70 text-[0.6875rem] xl:text-[0.6875rem] mt-4 font-black uppercase tracking-[0.3em]">Response within 24 hours</p>
              </div>
            </a>

            <a href={`tel:${CONTACT_PHONE_E164}`} className="flex gap-8 items-center group w-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              <div className="w-20 h-20 xl:w-24 xl:h-24 rounded-3xl border border-editorial-border bg-editorial-bg/80 backdrop-blur-3xl flex items-center justify-center text-editorial-text-muted group-hover:text-red-500 group-hover:border-red-500/50 group-hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)] group-hover:-translate-y-2 transition-all duration-500 transform-gpu relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Phone className="w-8 h-8 xl:w-10 xl:h-10 group-hover:drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all relative z-10" />
              </div>
              <div className="flex-1 border-b border-editorial-border pb-6 text-left">
                <h4 className="font-sans font-black text-editorial-text uppercase tracking-tighter text-2xl xl:text-3xl mb-2 group-hover:text-red-500 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Speak to Us</h4>
                <p className="text-editorial-text-muted font-light text-xl xl:text-2xl">{CONTACT_PHONE_DISPLAY}</p>
                <p className="text-red-500/70 text-[0.6875rem] xl:text-[0.6875rem] mt-4 font-black uppercase tracking-[0.3em]">Mon - Fri, 9am - 6pm GMT</p>
              </div>
            </a>

            <div className="flex gap-8 items-center group">
              <div className="w-20 h-20 xl:w-24 xl:h-24 rounded-3xl border border-editorial-border bg-editorial-bg/80 backdrop-blur-3xl flex items-center justify-center text-editorial-text-muted group-hover:text-red-500 group-hover:border-red-500/50 group-hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)] group-hover:-translate-y-2 transition-all duration-500 transform-gpu relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <MapPin className="w-8 h-8 xl:w-10 xl:h-10 group-hover:drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all relative z-10" />
              </div>
              <div className="flex-1">
                <h4 className="font-sans font-black text-editorial-text uppercase tracking-tighter text-2xl xl:text-3xl mb-2 group-hover:text-red-500 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Headquarters</h4>
                <p className="text-editorial-text-muted font-light text-xl xl:text-2xl">RAW Official HQ<br />United Kingdom</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          className="bg-editorial-bg/60 backdrop-blur-3xl p-6 sm:p-12 xl:p-16 border border-editorial-border rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000 shadow-[0_0_15px_#dc2626]" />
          
          {isSubmitted ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="h-full flex flex-col items-center justify-center text-center py-20"
            >
               <div className="relative">
                 <CheckCircle className="w-24 h-24 text-emerald-500 mb-10 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] relative z-10" />
                 <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
               </div>
               <h3 className="text-4xl font-black uppercase tracking-tighter mb-6 text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">Check your email app</h3>
               <p className="text-editorial-text-muted font-light text-lg xl:text-xl max-w-md leading-relaxed">
                 Your message has been written out and addressed for you. It is
                 <strong className="text-editorial-text"> not sent until you press send</strong> there.
               </p>
               <p className="mt-8 text-editorial-text-muted text-sm leading-relaxed max-w-md">
                 If nothing opened, email us directly at{" "}
                 <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-400 underline underline-offset-4 hover:text-red-300">
                   {CONTACT_EMAIL}
                 </a>.
               </p>
               <button
                 onClick={() => { setIsSubmitted(false); reset(); }}
                 className="mt-10 rounded-xl border border-editorial-border-light px-6 py-3 font-mono text-[0.6875rem] font-black uppercase tracking-[0.25em] text-editorial-text-muted transition-colors hover:border-white/30 hover:text-white"
               >
                 Write another
               </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 group/input">
                  <label htmlFor="contact-name" className="text-[0.6875rem] xl:text-[0.75rem] font-black uppercase tracking-[0.4em] text-red-500 flex items-center gap-4 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                    Full Name
                  </label>
                  <input id="contact-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} className={`w-full bg-editorial-bg/80 border ${errors.name ? 'border-red-500' : 'border-editorial-border'} rounded-2xl px-4 sm:px-8 py-4 sm:py-6 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black outline-none transition-all duration-300 font-mono text-editorial-text text-lg`} />
                  {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name.message}</p>}
                </div>
                <div className="space-y-4 group/input">
                  <label htmlFor="contact-email" className="text-[0.6875rem] xl:text-[0.75rem] font-black uppercase tracking-[0.4em] text-red-500 flex items-center gap-4 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                    Email Address
                  </label>
                  <input id="contact-email" type="email" autoComplete="email" inputMode="email" aria-invalid={!!errors.email} {...register("email")} className={`w-full bg-editorial-bg/80 border ${errors.email ? 'border-red-500' : 'border-editorial-border'} rounded-2xl px-4 sm:px-8 py-4 sm:py-6 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black outline-none transition-all duration-300 font-mono text-editorial-text text-lg`} />
                  {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-4 group/input">
                <label htmlFor="contact-subject" className="text-[0.6875rem] xl:text-[0.75rem] font-black uppercase tracking-[0.4em] text-red-500 flex items-center gap-4 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                  Subject
                </label>
                <div className="relative">
                  <select id="contact-subject" {...register("subject")} className="w-full bg-editorial-bg/80 border border-editorial-border rounded-2xl pl-4 sm:pl-8 pr-14 py-4 sm:py-6 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black outline-none transition-all duration-300 appearance-none font-mono text-editorial-text text-lg cursor-pointer">
                    <option className="bg-editorial-surface text-editorial-text py-2">Order Inquiry</option>
                    <option className="bg-editorial-surface text-editorial-text py-2">Product Question</option>
                    <option className="bg-editorial-surface text-editorial-text py-2">Wholesale / Gym Partnership</option>
                    <option className="bg-editorial-surface text-editorial-text py-2">Ambassador Program</option>
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-editorial-text-muted" />
                </div>
              </div>
              <div className="space-y-4 group/input">
                <label htmlFor="contact-message" className="text-[0.6875rem] xl:text-[0.75rem] font-black uppercase tracking-[0.4em] text-red-500 flex items-center gap-4 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                  Message
                </label>
                <textarea id="contact-message" rows={6} aria-invalid={!!errors.message} {...register("message")} className={`w-full bg-editorial-bg/80 border ${errors.message ? 'border-red-500' : 'border-editorial-border'} rounded-2xl px-4 sm:px-8 py-4 sm:py-6 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black outline-none transition-all duration-300 resize-none font-mono text-editorial-text text-lg custom-scrollbar`}></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-2">{errors.message.message}</p>}
              </div>
              <button type="submit" className="bg-red-600 border border-red-500 text-white w-full py-6 sm:py-8 rounded-2xl font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[0.8125rem] flex items-center justify-center gap-4 hover:bg-editorial-text hover:text-editorial-bg hover:border-white focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-500 shadow-[0_20px_40px_rgba(220,38,38,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] group/btn transform-gpu hover:-translate-y-1 relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  Transmit Message <Send className="w-5 h-5 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
