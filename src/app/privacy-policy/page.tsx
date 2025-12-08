import React from "react";

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                Privacy Policy
            </h1>
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                <p>
                    At VoterVantage, accessible from https://votervantage.org, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by VoterVantage and how we use it.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Log Files</h2>
                <p>
                    VoterVantage follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies and Web Beacons</h2>
                <p>
                    Like any other website, VoterVantage uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Data Transparency</h2>
                <p>
                    VoterVantage relies on publicly available data, including Form 460 filings. While we strive for accuracy, we report data as it is filed by the respective committees and entities.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Consent</h2>
                <p>
                    By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
                </p>

                <p className="mt-8 text-sm opacity-70">
                    Last updated: December 7, 2025.
                </p>
            </div>
        </div>
    );
}
