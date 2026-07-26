import React, { useState } from 'react';
import Footer from './Footer';
import { getFontFamily, getTextStyleProps } from '../utils/fontUtils';

interface ContactProps {
  settings: any;
  setActiveView: (view: any) => void;
  onOpenTerms: () => void;
}

export default function Contact({ settings, setActiveView, onOpenTerms }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('https://formsubmit.co/ajax/manuelfrancisco3@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: 'Nova mensagem de contacto do site',
          _template: 'box'
        })
      });

      if (response.ok) {
        setIsSubmitting(false);
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error('Falha no envio');
      }
    } catch (error) {
      // Caso o fetch falhe (por exemplo, bloqueio de CORS nalguns browsers com adblockers),
      // fazemos fallback para o mailto no topo da janela para contornar restrições de iframe.
      const subject = encodeURIComponent('Nova mensagem de contacto do site');
      const body = encodeURIComponent(`Nome: ${formData.name}\nEmail: ${formData.email}\n\nMensagem:\n${formData.message}`);
      window.open(`mailto:manuelfrancisco3@gmail.com?subject=${subject}&body=${body}`, '_top');
      
      setIsSubmitting(false);
      setSubmitStatus('error');
    }
  };

  const mainContent = (
    <div className="w-full flex-1 max-w-5xl mx-auto flex flex-col items-center">
      {/* Header Section */}
      {(settings?.showPageHeaderTitle !== false || settings?.showPageHeaderLines !== false) && (
        <div 
          className="text-center w-full flex-shrink-0"
          style={{ marginBottom: settings?.mainTitleBottomMargin !== undefined ? `${settings.mainTitleBottomMargin}px` : '40px' }}
        >
          <div className={`py-4 mb-4 ${settings?.showPageHeaderLines !== false ? 'border-y border-[#4a4a4a]/10' : ''}`}>
            {settings?.showPageHeaderTitle !== false && (
              <h1 className="font-sans text-lg md:text-xl text-[#4a4a4a] tracking-widest uppercase font-semibold">
                {settings?.siteName ? settings.siteName.replace('\n', ' ') : 'Manuel Francisco Fotografia'}
              </h1>
            )}
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="w-full max-w-[600px] mx-auto flex-1 pb-8 pt-4">
        <div className="mb-10 text-left">
          <p 
            className="mb-3 uppercase"
            style={{
              fontFamily: getFontFamily(settings?.contactSubtitleFont || settings?.globalFont),
              fontSize: settings?.contactSubtitleFontSize ? (settings.contactSubtitleFontSize.includes('px') ? settings.contactSubtitleFontSize : `${settings.contactSubtitleFontSize}px`) : undefined,
              color: settings?.contactSubtitleColor || '#7a7a7a',
              letterSpacing: settings?.contactSubtitleLetterSpacing || '2px',
              ...getTextStyleProps(settings?.contactSubtitleStyle)
            }}
          >
            {settings?.contactSectionSubtitle || 'ENTRE EM CONTACTO'}
          </p>
          <h2 
            className="font-light"
            style={{
              fontFamily: getFontFamily(settings?.contactTitleFont || settings?.globalFont),
              fontSize: settings?.contactTitleFontSize ? (settings.contactTitleFontSize.includes('px') ? settings.contactTitleFontSize : `${settings.contactTitleFontSize}px`) : undefined,
              color: settings?.contactTitleColor || '#4a4a4a',
              letterSpacing: settings?.contactTitleLetterSpacing || '0px',
              ...getTextStyleProps(settings?.contactTitleStyle)
            }}
          >
            {settings?.contactSectionTitle || 'Contacto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="block uppercase"
              style={{
                fontFamily: getFontFamily(settings?.contactFormLabelFont || settings?.globalFont),
                fontSize: settings?.contactFormLabelSize ? (settings.contactFormLabelSize.includes('px') ? settings.contactFormLabelSize : `${settings.contactFormLabelSize}px`) : '10px',
                color: settings?.contactFormLabelColor || '#4a4a4a',
                letterSpacing: settings?.contactFormLabelLetterSpacing || '0.2em',
              }}
            >
              Nome *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="O seu nome"
              required
              className="w-full bg-transparent border border-[#4a4a4a]/20 px-4 py-3 text-sm font-sans text-[#4a4a4a] focus:outline-none focus:border-[#4a4a4a]/60 transition-colors placeholder:text-[#4a4a4a]/40"
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block uppercase"
              style={{
                fontFamily: getFontFamily(settings?.contactFormLabelFont || settings?.globalFont),
                fontSize: settings?.contactFormLabelSize ? (settings.contactFormLabelSize.includes('px') ? settings.contactFormLabelSize : `${settings.contactFormLabelSize}px`) : '10px',
                color: settings?.contactFormLabelColor || '#4a4a4a',
                letterSpacing: settings?.contactFormLabelLetterSpacing || '0.2em',
              }}
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              required
              className="w-full bg-transparent border border-[#4a4a4a]/20 px-4 py-3 text-sm font-sans text-[#4a4a4a] focus:outline-none focus:border-[#4a4a4a]/60 transition-colors placeholder:text-[#4a4a4a]/40"
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="message" 
              className="block uppercase"
              style={{
                fontFamily: getFontFamily(settings?.contactFormLabelFont || settings?.globalFont),
                fontSize: settings?.contactFormLabelSize ? (settings.contactFormLabelSize.includes('px') ? settings.contactFormLabelSize : `${settings.contactFormLabelSize}px`) : '10px',
                color: settings?.contactFormLabelColor || '#4a4a4a',
                letterSpacing: settings?.contactFormLabelLetterSpacing || '0.2em',
              }}
            >
              Mensagem *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="A sua mensagem..."
              required
              rows={6}
              className="w-full bg-transparent border border-[#4a4a4a]/20 px-4 py-3 text-sm font-sans text-[#4a4a4a] focus:outline-none focus:border-[#4a4a4a]/60 transition-colors resize-none placeholder:text-[#4a4a4a]/40"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1a1a1a] hover:bg-[#333333] text-white px-6 py-4 text-[11px] font-sans tracking-[0.2em] uppercase transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? 'A ENVIAR...' : 'ENVIAR MENSAGEM'}
          </button>
          
          {submitStatus === 'success' && (
            <p className="text-sm text-green-600 font-sans mt-4 text-center">Mensagem enviada com sucesso!</p>
          )}
          {submitStatus === 'error' && (
            <p className="text-sm text-red-600 font-sans mt-4 text-center">Ocorreu um erro ao enviar a mensagem. Tente novamente.</p>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {settings?.separateFooterDiv ? (
        <>
          {/* Scrollable upper content container (2-divs mode) */}
          <div 
            className="flex-1 w-full overflow-y-auto px-6 pb-6 md:px-10 md:pb-10 flex flex-col items-center"
            style={{ paddingTop: settings?.mainTitleTopMargin !== undefined ? `${settings.mainTitleTopMargin}px` : '40px' }}
          >
            {mainContent}
          </div>

          {/* Separate fixed bottom Footer div */}
          <div className="w-full flex-shrink-0 border-t border-[#4a4a4a]/10 bg-[#f7f5f0]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 z-10">
            <Footer 
              activeView="contacto" 
              setActiveView={setActiveView} 
              settings={settings} 
              onOpenTerms={onOpenTerms} 
            />
          </div>
        </>
      ) : (
        <div 
          className="w-full h-full overflow-y-auto px-6 pb-6 md:px-10 md:pb-10 flex flex-col items-center justify-between"
          style={{ paddingTop: settings?.mainTitleTopMargin !== undefined ? `${settings.mainTitleTopMargin}px` : '40px' }}
        >
          {mainContent}

          {/* Footer inside main scrollable div */}
          <div className="w-full max-w-5xl mt-10 pt-4 border-t border-[#4a4a4a]/10 flex-shrink-0">
            <Footer 
              activeView="contacto" 
              setActiveView={setActiveView} 
              settings={settings} 
              onOpenTerms={onOpenTerms} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
