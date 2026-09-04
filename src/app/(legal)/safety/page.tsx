import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety Tips | Bai and Sil',
  description: 'Safety tips for buying and selling on Bai and Sil',
};

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Safety Tips</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg mb-8">
          Your safety is our priority. Here are some tips to keep you safe when buying and selling on Bai and Sil.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Meeting Safely</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Meet in public places:</strong> Always meet in well-lit, populated areas like malls, cafes, or police stations. Avoid meeting at your home or the buyer's home.</li>
            <li><strong>Bring a friend:</strong> If possible, bring a friend or family member with you when meeting a stranger. There's safety in numbers, pare.</li>
            <li><strong>Tell someone:</strong> Always let someone know where you're going and who you're meeting. Share your location and the details of the meeting.</li>
            <li><strong>Trust your instincts:</strong> If something feels off or too good to be true, walk away. Your safety comes first, always.</li>
            <li><strong>Meet during daylight:</strong> Schedule meetings during daylight hours whenever possible. Avoid meeting at night, especially in unfamiliar areas.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Payment Safety</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>No upfront payments:</strong> Never pay for an item before seeing it in person. If a seller asks for upfront payment, that's a red flag.</li>
            <li><strong>Cash preferred:</strong> Cash transactions are safest for local pickups. Avoid bank transfers or online payments with strangers.</li>
            <li><strong>Verify the item:</strong> Inspect the item thoroughly before paying. Check for defects, damage, or anything that doesn't match the listing.</li>
            <li><strong>Use secure payment methods:</strong> If you must pay online, use secure payment methods that offer buyer protection.</li>
            <li><strong>Get a receipt:</strong> Always ask for a receipt or proof of purchase when buying items.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Listing Safety</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Use real photos:</strong> Always use actual photos of the item you're selling. Don't use stock photos or images from the internet.</li>
            <li><strong>Accurate description:</strong> Be honest about the condition, features, and any defects of your item. Honesty builds trust.</li>
            <li><strong>Fair pricing:</strong> Set reasonable prices. Overpriced items may attract scammers looking to take advantage.</li>
            <li><strong>Protect your privacy:</strong> Don't include personal information like your full address in listings. Use general location areas.</li>
            <li><strong>Watermark photos:</strong> Consider watermarking your photos to prevent them from being used by scammers.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Scam Avoidance</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Too good to be true:</strong> If a deal seems too good to be true, it probably is. Be wary of prices significantly below market value.</li>
            <li><strong>Off-platform payment requests:</strong> Never agree to pay outside the platform. Scammers often try to move conversations to other apps.</li>
            <li><strong>Pressure tactics:</strong> Be cautious of sellers who pressure you to make quick decisions or pay immediately.</li>
            <li><strong>Fake escrow services:</strong> Don't use unfamiliar escrow services. Stick to well-known, reputable payment methods.</li>
            <li><strong>Verify identity:</strong> If possible, verify the seller's identity before meeting. Check their profile and reviews.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Reporting Issues</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Report suspicious activity:</strong> If you encounter a suspicious listing or user, report it immediately through the platform.</li>
            <li><strong>Document everything:</strong> Keep records of conversations, transactions, and any suspicious behavior.</li>
            <li><strong>Contact authorities:</strong> If you've been scammed or feel unsafe, contact local authorities immediately.</li>
            <li><strong>Warn others:</strong> If you've had a bad experience, leave honest feedback to help other users avoid similar situations.</li>
            <li><strong>Block and report:</strong> Use the block and report features to prevent further contact with suspicious users.</li>
          </ul>
        </section>

        <section className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Remember</h2>
          <p className="text-lg">
            Your safety is more important than any transaction. If something doesn't feel right, trust your 
            instincts and walk away. There will always be other items to buy or sell. Stay safe, pare!
          </p>
        </section>
      </div>
    </div>
  );
}