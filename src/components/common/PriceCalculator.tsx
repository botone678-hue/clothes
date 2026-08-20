import React, { useState } from 'react';
import { Service } from '../../types';
import { Calculator, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface PriceCalculatorProps {
  services: Service[];
  onStartBooking: () => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ services, onStartBooking }) => {
  const [washKg, setWashKg] = useState(4); // Wash, Dry & Fold (4 kg default)
  const [ironShirts, setIronShirts] = useState(3);
  const [suits, setSuits] = useState(1);
  const [duvets, setDuvets] = useState(1);
  const [shoes, setShoes] = useState(0);

  const washService = services.find((s) => s.category === 'wash_fold') || { base_price: 150 };
  const ironService = services.find((s) => s.category === 'wash_iron') || { base_price: 80 };
  const suitService = services.find((s) => s.category === 'suits') || { base_price: 600 };
  const duvetService = services.find((s) => s.category === 'bedding') || { base_price: 700 };
  const shoeService = services.find((s) => s.category === 'shoes') || { base_price: 350 };

  const subtotal =
    washKg * washService.base_price +
    ironShirts * ironService.base_price +
    suits * suitService.base_price +
    duvets * duvetService.base_price +
    shoes * shoeService.base_price;

  const deliveryFee = 150;
  const estimatedTotal = subtotal + (subtotal > 0 ? deliveryFee : 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Instant Eldoret Laundry Estimator</h3>
          <p className="text-xs text-slate-500">Calculate your estimated laundry & garment spa total in KSh</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Item 1: Wash, Dry & Fold */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Wash, Dry & Fold</span>
            <span className="text-[11px] text-slate-500">KSh {washService.base_price} / kg</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWashKg(Math.max(0, washKg - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900">{washKg} kg</span>
            <button
              onClick={() => setWashKg(washKg + 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Item 2: Wash & Iron */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Wash & Steam Iron (Shirts / Dresses)</span>
            <span className="text-[11px] text-slate-500">KSh {ironService.base_price} / item</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIronShirts(Math.max(0, ironShirts - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900">{ironShirts}</span>
            <button
              onClick={() => setIronShirts(ironShirts + 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Item 3: Executive Suit */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Executive Suit Dry Clean</span>
            <span className="text-[11px] text-slate-500">KSh {suitService.base_price} / suit</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSuits(Math.max(0, suits - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900">{suits}</span>
            <button
              onClick={() => setSuits(suits + 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Item 4: Heavy Duvet */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Heavy Duvet / Blanket Deep Clean</span>
            <span className="text-[11px] text-slate-500">KSh {duvetService.base_price} / item</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDuvets(Math.max(0, duvets - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900">{duvets}</span>
            <button
              onClick={() => setDuvets(duvets + 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Item 5: Sneakers */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Sneakers Deep Restoration Spa</span>
            <span className="text-[11px] text-slate-500">KSh {shoeService.base_price} / pair</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShoes(Math.max(0, shoes - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900">{shoes}</span>
            <button
              onClick={() => setShoes(shoes + 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">
            Subtotal: KSh {subtotal.toLocaleString()} + Pickup & Delivery: KSh {deliveryFee}
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            KSh {estimatedTotal.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">estimated</span>
          </div>
        </div>

        <button
          onClick={onStartBooking}
          className="w-full sm:w-auto px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>Book This Order</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
