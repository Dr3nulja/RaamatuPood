'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function Contacts() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-white to-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="mb-4 text-5xl font-bold text-secondary md:text-6xl">{t('contacts.title')}</h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-700">
            {t('contacts.subtitle')}
          </p>
        </div>
        
        {/* Information cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* About company */}
          <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-amber-100 hover:scale-105 flex flex-col items-center text-center">
            
            <h2 className="mb-4 text-2xl font-bold text-secondary">RaamatuPood</h2>
            <p className="text-base leading-relaxed text-zinc-700">
              {t('contacts.aboutText')}
            </p>
          </div>

          {/* Contacts */}
          <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-amber-100 hover:scale-105 flex flex-col items-center text-center">
            <h2 className="mb-6 text-2xl font-bold text-secondary">{t('contacts.contactDetails')}</h2>
            <ul className="space-y-5 w-full text-left">
              <li className="flex items-start gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{t('contacts.email')}</p>
                  <p className="text-base text-zinc-700 transition-colors hover:text-secondary">infobook@raamatu.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3"> 
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{t('contacts.phone')}</p>
                  <p className="text-base text-zinc-700 transition-colors hover:text-secondary">+372 53425673</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{t('contacts.supportHours')}</p>
                  <p className="text-base text-zinc-700">24/7</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-amber-100 hover:scale-105 flex flex-col items-center text-center">
            <h2 className="mb-4 text-2xl font-bold text-secondary">{t('contacts.address')}</h2>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 w-full text-center">
              <p className="text-lg font-semibold text-secondary">Rohuaia tn 67</p>
              <p className="mt-2 text-sm text-zinc-700">Jõhvi, 41533</p>
              <p className="text-sm text-zinc-700">{t('contacts.region')}</p>
            </div>
          </div>
        </div>
        
        {/* Google Maps */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-amber-100 p-2">
          <div className="mb-6 px-8 pt-8">
            <h2 className="mb-2 text-3xl font-bold text-secondary">{t('contacts.ourLocation')}</h2>
            <p className="text-zinc-700">{t('contacts.mapHint')}</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-inner border border-amber-100 mx-8 mb-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d184.9884995179597!2d27.393560111662485!3d59.36091456438828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x469465605dd01af3%3A0xef1cb4f518b677e!2sRohuaia%20tn%2067%2C%20J%C3%B5hvi%2C%2041533%20Ida-Viru%20maakond!5e0!3m2!1sru!2see!4v1773660938972!5m2!1sru!2see"
              width="100%"
              height="450"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full border-0"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}