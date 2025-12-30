import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-500 animate-in absolute inset-0 z-50">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 flex items-center z-10 sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-all"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-2xl font-black text-slate-800 dark:text-white tracking-tight pr-10">
          Privacy Policy
        </h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-8 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Introduction</h2>
          <p className="leading-relaxed">
            Welcome to <strong>MindGrid</strong>. We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Data Collection</h2>
          <p className="leading-relaxed">
            <strong>We do not collect, transmit, or store any personal data.</strong> MindGrid operates as a standalone application on your device. We do not require you to create an account, and we do not track your usage behavior.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Local Storage</h2>
          <p className="leading-relaxed">
            We use your device's local storage to save your game progress, high scores, and preferences (such as theme and visual settings). This data is stored strictly on your device and is not shared with us or any third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Online Play</h2>
          <p className="leading-relaxed">
            For multiplayer features, MindGrid establishes a direct Peer-to-Peer (P2P) connection between players. No gameplay data, chat messages, or personal identifiers pass through or are stored on our servers. Ephemeral connection IDs are used solely to establish the game session and are discarded afterwards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Analytics & Tracking</h2>
          <p className="leading-relaxed">
            We do not use any third-party analytics services, tracking pixels, or advertising cookies.
          </p>
        </section>

        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 text-center">
          <p>MindGrid © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;