import React from 'react';

interface PrivacyScreenProps {
  onBack: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-sm border-2 border-violet-600/60 rounded-2xl shadow-2xl shadow-violet-500/20">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest bg-gradient-to-r from-violet-400 to-amber-400 text-transparent bg-clip-text text-center mb-8">
        Política de Privacidade
      </h1>

      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-violet-300 font-bold uppercase tracking-wider mb-2">O que coletamos</h2>
          <p>
            Usamos o login do Google apenas para confirmar que cada pessoa vota uma única vez.
            Guardamos somente: o <strong className="text-white">nickname</strong> que você escolhe,
            seus <strong className="text-white">votos</strong> e a data/hora.
          </p>
        </section>

        <section>
          <h2 className="text-violet-300 font-bold uppercase tracking-wider mb-2">O que NÃO guardamos</h2>
          <p>
            Seu <strong className="text-white">e-mail nunca é armazenado</strong>. Ele é usado apenas
            no momento do login para gerar um código anônimo e irreversível (hash), que serve só para
            impedir votos duplicados. Não guardamos seu nome real, foto, IP ou qualquer dado de rastreamento.
          </p>
        </section>

        <section>
          <h2 className="text-violet-300 font-bold uppercase tracking-wider mb-2">Base legal e finalidade (LGPD)</h2>
          <p>
            O tratamento ocorre com base no seu <strong className="text-white">consentimento</strong>,
            com a finalidade exclusiva de viabilizar um bolão de votação justo (1 voto por pessoa).
          </p>
        </section>

        <section>
          <h2 className="text-violet-300 font-bold uppercase tracking-wider mb-2">Seus direitos</h2>
          <p>
            Você pode <strong className="text-white">apagar seu voto</strong> a qualquer momento
            (direito de exclusão). Os dados são mantidos apenas durante o evento e podem ser
            removidos após o encerramento.
          </p>
        </section>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onBack}
          className="px-8 py-3 text-base font-bold bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white rounded-md uppercase tracking-widest shadow-lg shadow-violet-500/40 hover:shadow-xl transition-all duration-300"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PrivacyScreen;
