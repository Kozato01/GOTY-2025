import React from 'react';

interface PrivacyScreenProps {
  onBack: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn p-5 sm:p-8 bg-velvet/95 border border-velvet-line rounded-lg shadow-2xl shadow-black/40">
      <h1 className="font-display text-2xl sm:text-4xl uppercase tracking-wide text-center mb-8 text-paper">
        Política de <span className="text-gold">Privacidade</span>
      </h1>

      <div className="space-y-6 text-ash text-sm leading-relaxed">
        <section>
          <h2 className="text-gold font-bold uppercase tracking-wider mb-2">O que coletamos</h2>
          <p>
            Usamos o login do Google apenas para confirmar que cada pessoa vota uma única vez.
            Guardamos somente: o <strong className="text-paper">nickname</strong> que você escolhe,
            seus <strong className="text-paper">votos</strong> e a data/hora.
          </p>
        </section>

        <section>
          <h2 className="text-gold font-bold uppercase tracking-wider mb-2">O que NÃO guardamos</h2>
          <p>
            Seu <strong className="text-paper">e-mail nunca é armazenado</strong>. Ele é usado apenas
            no momento do login para gerar um código anônimo e irreversível (hash), que serve só para
            impedir votos duplicados. Não guardamos seu nome real, foto, IP ou qualquer dado de rastreamento.
          </p>
        </section>

        <section>
          <h2 className="text-gold font-bold uppercase tracking-wider mb-2">Base legal e finalidade (LGPD)</h2>
          <p>
            O tratamento ocorre com base no seu <strong className="text-paper">consentimento</strong>,
            com a finalidade exclusiva de viabilizar um bolão de votação justo (1 voto por pessoa).
          </p>
        </section>

        <section>
          <h2 className="text-gold font-bold uppercase tracking-wider mb-2">Seus direitos</h2>
          <p>
            Você pode <strong className="text-paper">apagar seu voto</strong> a qualquer momento
            (direito de exclusão). Os dados são mantidos apenas durante o evento e podem ser
            removidos após o encerramento.
          </p>
        </section>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onBack}
          className="px-8 py-3 text-base font-bold bg-gold hover:bg-gold-bright text-ink rounded-md uppercase tracking-widest shadow-lg shadow-black/30 transition-all duration-300"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PrivacyScreen;
