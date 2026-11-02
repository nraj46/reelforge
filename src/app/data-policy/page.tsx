export default function DataPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl bg-zinc-950 px-6 py-10 text-zinc-100">
      <p className="mb-2 text-sm">
        <a href="/" className="text-fuchsia-300 hover:underline">← Back to ReelForge AI</a>
      </p>
      <h1 className="text-3xl font-bold tracking-tight">Data &amp; Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-400">
        What ReelForge AI handles, what it keeps, and what it never does with it. The short
        version: your business details are used to make your reels — and for nothing else.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-300">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-2 text-base font-semibold text-zinc-100">What data ReelForge AI handles</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Business details you type in</strong> — business name, business type, and the offer text you want promoted.</li>
            <li><strong>Generated content</strong> — the script, scenes, caption, and hashtags created from those details.</li>
            <li><strong>In the full version (launching soon)</strong> — account email, brand assets you upload (logo, photos), and billing handled by our payment provider. This demo has no accounts and takes no payments.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-2 text-base font-semibold text-zinc-100">What we do with it</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Your business details are used to generate your reel, its voiceover script, and its caption — nothing more.</li>
            <li>Voiceover in this demo is spoken by your own browser's built-in text-to-speech; the text never leaves your device for voicing.</li>
            <li>Generated reels belong to the business that created them, to post wherever they like.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-red-900/60 bg-red-950/30 p-5">
          <h2 className="mb-2 text-base font-semibold text-zinc-100">What we never do</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Never train models on your business content or offers.</strong> Your promotions are your competitive edge, not training data.</li>
            <li><strong>Never sell or share</strong> your business details, offers, or generated content with third parties or advertisers.</li>
            <li><strong>Never post on your behalf</strong> without your explicit action. ReelForge hands you the video; you decide where it goes.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-2 text-base font-semibold text-zinc-100">Retention &amp; owner controls</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>In the full version, generated reels and projects are kept while your account is active, and you can delete any project at any time.</li>
            <li>You can request a full export or deletion of your business data at any time.</li>
            <li>Payment details are processed by our payment provider and never touch ReelForge servers.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-2 text-base font-semibold text-zinc-100">About this demo</h2>
          <p>
            This public demo runs entirely in your browser — the details you type are not sent
            to or stored on a server, there are no accounts, and nothing is written to a
            database. Refresh the page and everything is gone. Please use a test business
            name if you prefer not to type your real one.
          </p>
        </section>
      </div>

      <footer className="mt-10 text-xs text-zinc-600">
        <p>© 2026 ReelForge AI · A DailyByte product</p>
      </footer>
    </main>
  );
}
