export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <form className="space-y-6">
        <div>
          <label className="block mb-2 text-gray-300">Your Email</label>
          <input type="email" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" placeholder="you@email.com" />
        </div>
        <div>
          <label className="block mb-2 text-gray-300">Message</label>
          <textarea className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" rows={5} placeholder="Your message..."></textarea>
        </div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold">Send</button>
      </form>
      <div className="mt-8 text-gray-400">
        Or email us at: <a href="mailto:admin@unlockvault.com" className="underline text-purple-300">admin@unlockvault.com</a>
      </div>
    </div>
  );
} 