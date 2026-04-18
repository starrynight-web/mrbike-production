import json
from django.core.management.base import BaseCommand
from apps.core.models import SiteConfig

class Command(BaseCommand):
    help = 'Seed initial site configuration data from live site extras.'

    def handle(self, *args, **options):
        # 1. About Page Seeding
        configs = {
            "cms_about_subtitle": "The largest and most trusted motorcycle marketplace in Bangladesh.",
            "cms_about_stats": json.dumps([
                {"label": "Active Users", "value": "500K+"},
                {"label": "Bike Listings", "value": "50K+"},
                {"label": "Verified Dealers", "value": "1.2K+"},
                {"label": "Cities Covered", "value": "64"}
            ]),
            "cms_about_story": "<p>Founded in 2020, MrBikeBD started with a simple mission: to make bike ownership accessible to every Bangladeshi. We understood the challenges of navigating the fragmented motorcycle market and decided to build a platform that brings transparency, trust, and variety to the forefront.</p><p>Today, we are proud to serve over half a million bikers, helping them find their perfect ride through our advanced search tools and verified dealer network.</p>",
            "cms_about_values": json.dumps([
                {"title": "Transparency", "desc": "We believe in honest pricing and verified seller data for every listing."},
                {"title": "Community", "desc": "Built by bikers, for bikers. We foster a helpful and passionate ecosystem."},
                {"title": "Innovation", "desc": "Using technology to make bike buying and selling as fast as a quick shifter."}
            ]),
            "cms_about_cta_title": "Ready to start your journey?",
            "cms_about_cta_desc": "Join thousands of bikers today.",
            
            # 2. Contact Page Seeding
            "cms_contact_phone": "+880 1712 000 000, +880 1678 999 999",
            "cms_contact_email": "info@mrbikebd.com, support@mrbikebd.com",
            "cms_contact_hours": "Saturday - Thursday: 10 AM - 7 PM, Friday: Closed",
            "cms_contact_map_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116833.8318789355!2d90.337288!3d23.7808875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1713430000000!5m2!1sen!2sbd",
            
            # 3. FAQs Page Seeding
            "cms_faqs": json.dumps([
                {
                    "category": "Buying & Selling",
                    "items": [
                        {"q": "How do I post a bike ad?", "a": "Simply click the 'Post Ad' button in the navbar, log in to your account, and fill in the bike details with clear photos."},
                        {"q": "Is posting an ad free?", "a": "Yes! Basic listings are 100% free. We also offer Premium ads for faster selling."},
                        {"q": "How do I contact a seller?", "a": "On the bike details page, you'll see the seller's verified phone number and a messaging option."}
                    ]
                },
                {
                    "category": "Account & Safety",
                    "items": [
                        {"q": "How can I stay safe when buying?", "a": "Always meet the seller in a public place, inspect the bike documents thoroughly (Blue-book, Tax token), and never pay in advance."},
                        {"q": "What should I do if a deal seems suspicious?", "a": "Report the listing immediately using the 'Report' button on the page."}
                    ]
                }
            ]),
            "cms_faq_cta_title": "Still have questions?",
            "cms_faq_cta_desc": "Our support team is here to help you 24/7.",
            
            # 4. Advertise Page Seeding
            "cms_advertise_hero_title": "Grow Your Business with MrBikeBD",
            "cms_advertise_hero_desc": "Reach over 1 million motorcycle enthusiasts every month in Bangladesh's largest bike directory.",
            "cms_advertise_stats": json.dumps([
                {"label": "Monthly Visitors", "value": "1M+"},
                {"label": "Ad Impressions", "value": "12M+"},
                {"label": "Avg. Click Rate", "value": "3.2%"}
            ]),
            "cms_advertise_pricing_title": "Ad Solutions",
            "cms_advertise_pricing_desc": "Choose a plan that fits your business needs, from verified badges to whole-site banners.",
            "cms_advertise_plans": json.dumps([
                {"name": "Standard Seller", "price": "Free", "features": ["UNLIMITED listings", "Direct messaging", "Public profile"]},
                {"name": "Verified Dealer", "price": "1,999 ৳ / mo", "features": ["Verified checkmark", "Priority search placement", "Inventory manager", "Analytics dashboard"]},
                {"name": "Brand Partner", "price": "Custom", "features": ["Banner placements", "Newsletter slots", "Sponsored content", "Dedicated account manager"]}
            ]),
            "cms_advertise_content": "<h3>Why Advertise with Us?</h3><p>MrBikeBD is not just a marketplace; it's a community. When you advertise with us, you aren't just getting eyeballs; you're getting high-intent buyers who are ready for their next ride.</p>",
            
            # 5. Support Page Seeding
            "cms_support_phone": "+880 1712 999 000",
            "cms_support_email": "support@mrbikebd.com",
            "cms_support_content": "<h3>Need Help Fast?</h3><p>If you have any issues with your account or a transaction, please use the ticket form below for fastest response. Our technicians are standing by.</p>",
            
            # 6. Bike Registration Seeding
            "cms_bike_registration_content": "<h3>Official Registration Guidelines</h3><p>Motorcycle registration in Bangladesh is handled by BRTA. It is mandatory for all motorcycles according to the Motor Vehicles Ordinance of 1983.</p>",
            "cms_bike_reg_license_fees": json.dumps([
                {"type": "Learner (1 Class)", "base": 300, "vat": 45, "total": 345},
                {"type": "Learner (2 Classes)", "base": 450, "vat": 68, "total": 518},
                {"type": "Amateur Issue", "base": 2210, "vat": 332, "total": 2542},
                {"type": "Professional Issue", "base": 1460, "vat": 219, "total": 1679}
            ]),
            "cms_bike_reg_steps": json.dumps([
                "Collect assessment slip from BRTA office",
                "Fee Deposit: Visit bank with slip & mobile number",
                "Submit money receipt & documents to BRTA",
                "Receive SMS for biometric submission",
                "Submit biometrics on scheduled date",
                "Receive SMS for RFID plate & Smart Card",
                "Collect card & plate from your circle office"
            ]),
            "cms_bike_reg_smartcard_fees": json.dumps([
                {"item": "Smart Card Fee", "fee": 2200, "vat": 330, "total": 2530},
                {"item": "RFID Plate Fee", "fee": 540, "vat": 81, "total": 621}
            ]),
            "cms_bike_reg_reg_fees": json.dumps([
                {"cc": "Up to 100cc", "period": "2 Years", "fee": "10,664 BDT"},
                {"cc": "Over 100cc", "period": "2 Years", "fee": "19,664 BDT"},
                {"cc": "Up to 100cc", "period": "10 Years", "fee": "11,764 BDT"},
                {"cc": "Over 100cc", "period": "10 Years", "fee": "20,964 BDT"}
            ]),
            "cms_bike_reg_docs_license": json.dumps([
                "Birth Certificate Copy",
                "NID / Voter ID Card",
                "Passport (if available)",
                "Educational Certificate Copy",
                "4 Copies Passport Size Photo"
            ]),
            "cms_bike_reg_docs_registration": json.dumps([
                "Original Assessment slip",
                "Money receipt from bank",
                "Dealer delivery documents",
                "Tax token application"
            ]),
            "cms_bike_reg_faqs": json.dumps([
                {"q": "Can I register a second-hand bike?", "a": "Yes, but you must complete the ownership transfer forms and submit the current blue-book."},
                {"q": "How long does the smart card take?", "a": "Typically 3-6 months after biometric submission."},
                {"q": "Is insurance mandatory for registration?", "a": "Yes, at least third-party insurance is required by law."}
            ]),
            
            # 7. Expense Calculator Seeding
            "cms_expense_calculator_title": "Digital Expense Panel",
            "cms_expense_calculator_subtitle": "Gain full control over your motorcycle finances with our precision-engineered calculators.",
            "cms_expense_calculator_content": "<h3>Financial Planning for Bikers</h3><p>Whether you're planning to buy a new beast or calculating your monthly commute costs, our tools provide accurate estimates based on standard bank interest rates and current fuel market prices in Bangladesh.</p>"
        }

        for key, val in configs.items():
            SiteConfig.objects.update_or_create(key=key, defaults={'value': val})
            self.stdout.write(self.style.SUCCESS(f'Successfully seeded config: {key}'))
