"use client";

import Link from "next/link";
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer id="contacts" className="flex-shrink-0 border-t border-secondary-hover bg-secondary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">RaamatuPood</h3>
            <p className="text-amber-50 text-sm">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2 text-amber-50 text-sm">
              <li><Link href="/" className="transition hover:text-primary-soft">{t('nav.home')}</Link></li>
              <li><Link href="/catalog" className="transition hover:text-primary-soft">{t('nav.catalog')}</Link></li>
              <li><Link href="/account" className="transition hover:text-primary-soft">{t('footer.myLibrary')}</Link></li>
              <li><Link href="/contacts" className="transition hover:text-primary-soft">{t('nav.contacts')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.information')}</h4>
            <ul className="space-y-2 text-amber-50 text-sm">
              <li><Link href="/about" className="transition hover:text-primary-soft">{t('footer.about')}</Link></li>
              <li><Link href="/privacy" className="transition hover:text-primary-soft">{t('footer.privacy')}</Link></li>
              <li><Link href="/delivery" className="transition hover:text-primary-soft">{t('footer.delivery')}</Link></li>
              <li><Link href="/returns" className="transition hover:text-primary-soft">{t('footer.returns')}</Link></li>
              <li><Link href="/faq" className="transition hover:text-primary-soft">{t('footer.faq')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactsAndSocial')}</h4>

            <ul className="space-y-2 text-amber-50 text-sm">
              <li>Email: infobook@raamatu.com</li>
              <li>{t('footer.phone')}: +372 53425673</li>
              <li>{t('footer.supportHours')}: {t('footer.supportHoursValue')}</li>
              <li className="pt-2 flex gap-3">
                <a href="#" className="transition hover:text-primary-soft">Instagram</a>
                <a href="#" className="transition hover:text-primary-soft">Facebook</a>
                <a href="#" className="transition hover:text-primary-soft">X</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary-hover pt-8 flex justify-between items-center text-amber-50 text-sm">
          <p>&copy; 2026 RaamatuPood. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;