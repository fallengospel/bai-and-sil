import Link from "next/link";
import Logo from "@/components/brand/Logo";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Logo tone="reverse" size={28} asLink />
            <p className="mt-3 text-sm text-gray-400">
              Ang marketplace ng Pinas. Benta, hanap, loop lang. Walang hassle, promise.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories" className="text-sm hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm hover:text-white transition-colors">
                  Search Items
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-sm hover:text-white transition-colors">
                  Start Selling
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Help &amp; Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/safety" className="text-sm hover:text-white transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} BAI &amp; SIL. Gawang Pinas, para sa Pinas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
