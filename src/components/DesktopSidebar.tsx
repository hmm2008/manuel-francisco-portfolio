import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { getFontFamily, getTextStyleProps } from '../utils/fontUtils';
import { navItems } from './NavigationItems';
import type { SiteSettings, View } from '../types';

interface DesktopSidebarProps {
  siteSettings: Partial<SiteSettings>;
  activeView: View;
  setActiveView: (view: View) => void;
  isMobileLandscape: boolean;
  menuStyle: React.CSSProperties;
  navItemClass: (isActive: boolean) => string;
}

export default function DesktopSidebar({
  siteSettings,
  activeView,
  setActiveView,
  isMobileLandscape,
  menuStyle,
  navItemClass
}: DesktopSidebarProps) {
  return (
    <>

      {/* Desktop Sidebar */}
      <aside className={`w-[340px] flex-shrink-0 h-full bg-[#fafafa] border-r border-[#4a4a4a]/10 flex-col justify-between overflow-y-auto z-30 ${isMobileLandscape ? 'hidden' : 'hidden md:flex'}`}>
        <div>
          <div className="text-center typography-site-name-desktop" style={{ 
            paddingTop: `${siteSettings?.sidebarTitleTopMargin !== undefined ? siteSettings.sidebarTitleTopMargin : 48}px`,
            paddingBottom: `${siteSettings?.sidebarTitleBottomMargin !== undefined ? siteSettings.sidebarTitleBottomMargin : 32}px`,
            paddingLeft: `${siteSettings?.sidebarTitleLeftMargin !== undefined ? siteSettings.sidebarTitleLeftMargin : 40}px`,
            paddingRight: `${siteSettings?.sidebarTitleRightMargin !== undefined ? siteSettings.sidebarTitleRightMargin : 40}px`,
            color: siteSettings?.siteNameColor || '#4a4a4a',
            fontFamily: getFontFamily(siteSettings?.siteNameFont),
            letterSpacing: siteSettings?.siteNameLetterSpacing || '0px',
            ...getTextStyleProps(siteSettings?.siteNameTextStyle)
          }}>
            <h1 className="tracking-widest leading-tight uppercase whitespace-pre-line font-semibold">{siteSettings.siteName}</h1>
            <p className="text-[#7a7a7a] tracking-widest text-[12px] font-sans mt-2 uppercase">{siteSettings.siteSubtitle}</p>
          </div>
          <div 
            className="px-10 text-xs md:text-sm leading-relaxed mb-8 whitespace-pre-line typography-message"
            style={{ 
              marginTop: `${siteSettings?.messageSpacing !== undefined ? siteSettings.messageSpacing : 16}px`,
              color: siteSettings?.messageColor || '#4a4a4a',
              textAlign: (siteSettings?.messageAlignment as any) || 'left',
              fontFamily: getFontFamily(siteSettings?.messageFont),
              letterSpacing: siteSettings?.messageLetterSpacing || '0px',
              ...getTextStyleProps(siteSettings?.messageTextStyle)
            }}
          >
            <p>{siteSettings.welcomeMessage}</p>
          </div>
          <nav className="flex flex-col border-t border-[#1a1a1a]/5">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as View)}
                  style={{
                    ...menuStyle,
                    paddingTop: siteSettings?.sidebarButtonSpacing !== undefined ? `${siteSettings.sidebarButtonSpacing}px` : undefined,
                    paddingBottom: siteSettings?.sidebarButtonSpacing !== undefined ? `${siteSettings.sidebarButtonSpacing}px` : undefined,
                  }}
                  className={navItemClass(isActive)}
                >
                  {isActive && (
                    <div className="absolute left-8 top-0 bottom-0 w-[1.5px] bg-[#4a4a4a]" />
                  )}
                  <Icon className="w-4 h-4" strokeWidth={1} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
        <div 
          className="px-10 pt-8 text-center text-[#7a7a7a]/60 text-[10px] tracking-[0.05em] font-sans flex flex-col items-center"
          style={{ paddingBottom: siteSettings?.sidebarFooterBottomMargin !== undefined ? `${siteSettings.sidebarFooterBottomMargin}px` : '32px' }}
        >
          {/* Social Network Icons above copyright in sidebar */}
          {(siteSettings?.instagram || siteSettings?.facebook || siteSettings?.twitter) && (
            <div className="flex items-center justify-center gap-4 mb-4 text-[#4a4a4a]">
              {siteSettings?.instagram && (
                <a 
                  href={siteSettings.instagram.startsWith('http') ? siteSettings.instagram : `https://${siteSettings.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#1a1a1a] hover:scale-110 transition-all p-1" 
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4 stroke-[1.5]" />
                </a>
              )}
              {siteSettings?.facebook && (
                <a 
                  href={siteSettings.facebook.startsWith('http') ? siteSettings.facebook : `https://${siteSettings.facebook}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#1a1a1a] hover:scale-110 transition-all p-1" 
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 stroke-[1.5]" />
                </a>
              )}
              {siteSettings?.twitter && (
                <a 
                  href={siteSettings.twitter.startsWith('http') ? siteSettings.twitter : `https://${siteSettings.twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#1a1a1a] hover:scale-110 transition-all p-1" 
                  title="Twitter / X"
                >
                  <Twitter className="w-4 h-4 stroke-[1.5]" />
                </a>
              )}
            </div>
          )}

          <p className="mb-1">{siteSettings.footerText || `© ${new Date().getFullYear()} — Todos os direitos reservados.`}</p>
          <p>O conteúdo e as imagens não podem ser reproduzidos de qualquer forma sem o consentimento do autor.</p>
        </div>
      </aside>

    </>
  );
}
