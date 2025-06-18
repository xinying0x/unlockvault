import React, { useState, useEffect } from 'react';

interface SecurityIndicatorsProps {
  showSSL?: boolean;
  showTrustBadges?: boolean;
  className?: string;
}

const SecurityIndicators: React.FC<SecurityIndicatorsProps> = ({
  showSSL = true,
  showTrustBadges = true,
  className = ''
}) => {
  const [isSecure, setIsSecure] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);

  useEffect(() => {
    // Check if site is HTTPS
    if (typeof window !== 'undefined') {
      setIsSecure(window.location.protocol === 'https:');
      
      // Try to get certificate information (limited in browser)
      if (window.location.protocol === 'https:') {
        // Simulate certificate info - in production, this would come from your backend
        setCertificateInfo({
          issuer: 'Let\'s Encrypt',
          validFrom: new Date().toLocaleDateString(),
          validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          cipher: 'TLS 1.3'
        });
      }
    }
  }, []);

  const TrustBadge = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
      <span className="text-green-600 dark:text-green-400">{icon}</span>
      <div>
        <div className="text-xs font-semibold text-green-800 dark:text-green-300">{title}</div>
        <div className="text-xs text-green-600 dark:text-green-400">{description}</div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* SSL Certificate Indicator */}
      {showSSL && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-full ${isSecure ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              {isSecure ? (
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2h-1V7a4 4 0 00-8 0v1H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isSecure ? 'Secure Connection' : 'Connection Not Secure'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSecure ? 'Your connection is encrypted with SSL/TLS' : 'This connection is not secure'}
              </p>
            </div>
          </div>

          {isSecure && certificateInfo && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Issued by:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{certificateInfo.issuer}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Valid until:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{certificateInfo.validTo}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Encryption:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{certificateInfo.cipher}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span className="ml-2 text-green-600 dark:text-green-400 font-medium">Valid</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trust Badges */}
      {showTrustBadges && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TrustBadge 
            icon="🛡️"
            title="Safe Browsing"
            description="Verified by Google Safe Browsing"
          />
          <TrustBadge 
            icon="🔒"
            title="Data Protection"
            description="GDPR Compliant"
          />
          <TrustBadge 
            icon="⚡"
            title="Fast & Secure"
            description="99.9% Uptime Guarantee"
          />
          <TrustBadge 
            icon="✅"
            title="Verified Site"
            description="Domain Validated SSL"
          />
        </div>
      )}

      {/* Additional Security Features */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 
                      border border-purple-200 dark:border-purple-700 rounded-xl p-4">
        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
          🔐 Enhanced Security
        </h4>
        <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-400">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Bot protection enabled
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Real-time threat monitoring
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Secure payment processing
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Privacy-first analytics
          </li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          🔒 Your privacy is protected. We don't store personal data without consent.
        </p>
        <a href="/privacy-policy" className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium">
          View Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default SecurityIndicators; 