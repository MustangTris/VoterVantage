import React from "react";

export default function AccessibilityStatement() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                Accessibility Statement
            </h1>
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                <p>
                    VoterVantage is committed to ensuring digital accessibility for people of all abilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Conformance Status</h2>
                <p>
                    The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. VoterVantage is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Feedback</h2>
                <p>
                    We welcome your feedback on the accessibility of VoterVantage. Please let us know if you encounter accessibility barriers on VoterVantage:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                    <li>Phone: (555) 123-4567</li>
                    <li>E-mail: accessibility@votervantage.org</li>
                    <li>Visitor Address: 123 Democracy Lane, Civic City, CA 92262</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Assessment Approach</h2>
                <p>
                    VoterVantage assessed the accessibility of VoterVantage by the following approaches:
                </p>
                <ul className="list-disc list-inside mt-2">
                    <li>Self-evaluation</li>
                </ul>

                <p className="mt-8 text-sm opacity-70">
                    This statement was created on December 7, 2025.
                </p>
            </div>
        </div>
    );
}
