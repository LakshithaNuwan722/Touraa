import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Button } from 'components/ui/button';

export default function ContactPage() {
  const whatsappNumber = '+94771234567';
  const whatsappMessage = encodeURIComponent('Hello! I would like to inquire about taxi rental services in Sri Lanka.');

  return (
    <div className="min-h-screen" data-testid="contact-page">
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-accent" />
            <p className="font-sans text-sm font-semibold tracking-widest uppercase text-accent">
              Contact Us
            </p>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Have questions or need assistance? Our team is here to help you plan your perfect Sri Lankan journey. 
            Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-serif text-3xl font-medium text-primary mb-8">
                Contact Information
              </h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="bg-white rounded-2xl p-6 border border-black/5 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Phone</h3>
                      <p className="text-muted-foreground">+94 77 123 4567</p>
                      <p className="text-muted-foreground">+94 11 234 5678</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white rounded-2xl p-6 border border-black/5 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Email</h3>
                      <p className="text-muted-foreground">info@touraa.com</p>
                      <p className="text-muted-foreground">bookings@touraa.com</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-2xl p-6 border border-black/5 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Address</h3>
                      <p className="text-muted-foreground">
                        123 Galle Road,<br />
                        Colombo 03,<br />
                        Sri Lanka
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-white rounded-2xl p-6 border border-black/5 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Working Hours</h3>
                      <p className="text-muted-foreground">24/7 Available</p>
                      <p className="text-sm text-accent font-medium mt-1">
                        Airport pickups available round the clock
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Section */}
            <div>
              <div className="bg-[#25D366] rounded-3xl p-8 md:p-12 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-3xl font-medium mb-4">
                  Chat on WhatsApp
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  Get instant responses! Chat with us directly on WhatsApp for quick inquiries, 
                  booking assistance, or any travel questions.
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber.replace('+', '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    className="w-full h-14 bg-white text-[#25D366] hover:bg-white/90 rounded-xl text-lg font-semibold"
                    data-testid="whatsapp-btn"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start WhatsApp Chat
                  </Button>
                </a>
                <p className="text-white/60 text-sm mt-4 text-center">
                  Usually responds within 5 minutes
                </p>
              </div>

              {/* FAQ Preview */}
              <div className="mt-8 bg-white rounded-3xl p-8 border border-black/5">
                <h3 className="font-serif text-2xl font-medium text-primary mb-6">
                  Frequently Asked
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      q: 'Is the driver included in the price?',
                      a: 'Yes! All our rentals include a free professional English-speaking driver.'
                    },
                    {
                      q: 'How is the cost calculated?',
                      a: 'We charge Rs 120 per kilometer. The total cost is calculated based on the distance between your pickup and drop locations.'
                    },
                    {
                      q: 'Can you do airport pickups?',
                      a: 'Absolutely! We offer 24/7 airport pickup services from both Colombo (CMB) and Mattala (HRI) airports.'
                    }
                  ].map((faq, index) => (
                    <div key={index} className="pb-4 border-b border-black/5 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-primary mb-1">{faq.q}</h4>
                      <p className="text-muted-foreground text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
