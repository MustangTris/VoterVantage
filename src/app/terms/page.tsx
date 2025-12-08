import React from "react";
import Link from "next/link";

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                Terms of Service
            </h1>
            <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">1. Acceptance of Terms</h2>
                    <p>
                        By accessing VoterVantage’s website or services, you acknowledge that you have read, understood,
                        and agree to these Terms. If you do not agree, you may not use our platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">2. Use of Services</h2>

                    <h3 className="text-lg font-medium mb-2 text-white">a. Eligibility</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>You must be at least 13 years old to use our services.</li>
                        <li>By using our platform, you represent that you meet the eligibility criteria.</li>
                    </ul>

                    <h3 className="text-lg font-medium mb-2 text-white">b. Permitted Use</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>You agree to use our services for lawful purposes only.</li>
                        <li>You may not use our platform to engage in fraudulent, abusive, or harmful activities.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">3. Intellectual Property</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>All content on the VoterVantage website, including text, graphics, logos, and software, is provided to support public awareness and engagement.</li>
                        <li>You are free to reproduce, distribute, or modify our content for non-commercial purposes, provided that you give proper credit to VoterVantage and do not misrepresent the information.</li>
                        <li>For commercial use or significant modifications, we request that you contact us for approval to ensure alignment with our mission.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">4. User-Generated Content</h2>

                    <h3 className="text-lg font-medium mb-2 text-white">a. Ownership</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>You retain ownership of any content you submit to our platform but grant VoterVantage a non-exclusive, royalty-free license to use, display, and distribute your content.</li>
                    </ul>

                    <h3 className="text-lg font-medium mb-2 text-white">b. Prohibited Content</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>You may not upload content that is unlawful, defamatory, or infringes on the rights of others.</li>
                        <li>VoterVantage reserves the right to remove user-generated content that violates these Terms.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">5. Privacy</h2>
                    <p>
                        Your use of our platform is also governed by our <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>, which outlines how we collect, use,
                        and protect your information. Please review it for more details.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">6. Disclaimers</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>VoterVantage provides its services "as is" and makes no warranties, express or implied, regarding the accuracy, reliability, or availability of our platform.</li>
                        <li>We do not guarantee that our services will be uninterrupted or error-free.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">7. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, VoterVantage shall not be liable for any indirect,
                        incidental, or consequential damages arising from your use of our platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">8. Modifications to Terms</h2>
                    <p>
                        We may update these Terms from time to time. Any changes will be effective upon posting to our
                        website, and the "Effective Date" at the top will reflect the latest revision. Continued use of our
                        platform constitutes acceptance of the revised Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">9. Termination</h2>
                    <p>
                        VoterVantage reserves the right to suspend or terminate your access to our platform if you violate
                        these Terms or engage in unlawful activities.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">10. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of the State of California, without regard to its conflict of laws
                        principles.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">11. Contact Us</h2>
                    <p className="mb-2">If you have any questions or concerns about these Terms, please contact us at:</p>
                    <div className="bg-white/5 p-4 rounded-lg inline-block">
                        <p className="font-semibold text-white">VoterVantage</p>
                        <p><a href="mailto:tristanfoulds@gmail.com" className="text-blue-400 hover:text-blue-300">tristanfoulds@gmail.com</a></p>
                        <p>+1 (760) 625-9930</p>
                    </div>
                </section>

                <p className="mt-8 text-sm opacity-70 border-t border-white/10 pt-4">
                    Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
}
