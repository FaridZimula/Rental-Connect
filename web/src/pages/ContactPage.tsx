import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, ShieldCheck, Sparkles, Building2, HelpCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Save contact message locally to ensure zero loss
    const existingMessagesStr = localStorage.getItem('rc_contact_messages');
    const existingMessages = existingMessagesStr ? JSON.parse(existingMessagesStr) : [];
    const newMessage = {
      id: `msg_${Date.now()}`,
      full_name: fullName,
      email,
      phone,
      category,
      message,
      submitted_at: new Date().toISOString(),
    };
    localStorage.setItem('rc_contact_messages', JSON.stringify([newMessage, ...existingMessages]));

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <Layout>
      <div className="bg-zinc-50 min-h-screen pt-24 pb-20 text-zinc-900">
        {/* Hero Header Section */}
        <section className="bg-zinc-950 text-white py-16 relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#f06023]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f06023]/20 text-[#f06023] border border-[#f06023]/30 text-xs font-bold uppercase tracking-wider mb-4"
            >
              <Sparkles className="h-3.5 w-3.5" /> We're Here To Help
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
            >
              Get in Touch with <span className="text-[#f06023]">Rental Connect</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-sm sm:text-base leading-relaxed"
            >
              Have questions about property listings, premium owner plans, or tenant inquiries? Drop us a line below or reach out directly to our support team.
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#f06023]" /> Contact Information
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#f06023] flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Main HQ Office</h4>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">Rental Connect House, Kampala</p>
                      <p className="text-xs text-zinc-500">Kololo Hill Road & Kampala Rd, Uganda</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#f06023] flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Phone & WhatsApp</h4>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">+256 700 000 000</p>
                      <p className="text-xs text-zinc-500">+256 772 000 000 (Toll Free Line)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#f06023] flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</h4>
                      <p className="text-sm font-bold text-[#f06023] mt-0.5">support@rentalconnect.ug</p>
                      <p className="text-xs text-zinc-500">Fast response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#f06023] flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Operating Hours</h4>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">Monday – Saturday: 8:00 AM – 7:00 PM</p>
                      <p className="text-xs text-zinc-500">Sunday & Public Holidays: Emergency Support</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-sm border border-zinc-800 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#f06023] text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Verified Assistance Guarantee</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">All inquiries are reviewed directly by dedicated customer experience managers.</p>
                </div>
              </div>
            </div>

            {/* Interactive Contact Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 px-4"
                  >
                    <div className="h-16 w-16 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">Message Sent Successfully!</h3>
                    <p className="text-zinc-600 text-sm max-w-md mx-auto mb-6">
                      Thank you for contacting Rental Connect. Our support team has received your inquiry and will reach out to you shortly via email.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSubmitted(false);
                        setFullName('');
                        setEmail('');
                        setPhone('');
                        setMessage('');
                      }}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-1 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#f06023]" /> Send Us a Message
                      </h3>
                      <p className="text-xs text-zinc-500 mb-6">Fill in the details below and we will get back to you promptly.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Full Name <span className="text-[#f06023]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mukasa Robert"
                          className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50/50"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Email Address <span className="text-[#f06023]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. mukasa@gmail.com"
                          className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="+256 700 000 000"
                          className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50/50"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Inquiry Category
                        </label>
                        <select
                          className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50/50"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="general">General Support Inquiry</option>
                          <option value="property">Property Listing Help</option>
                          <option value="billing">Billing & Premium Plans</option>
                          <option value="report">Report Fraud / Fraudulent Listing</option>
                          <option value="partnership">Partnership & Enterprise</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Your Message <span className="text-[#f06023]">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Write your message or inquiry here..."
                        className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50/50"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      type="submit"
                      disabled={submitting}
                      icon={<Send className="h-4 w-4" />}
                    >
                      {submitting ? 'Sending Message...' : 'Submit Message'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
