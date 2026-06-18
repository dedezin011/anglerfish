import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Política de Privacidade | AnglerFish",
  description:
    "Política de privacidade da lista de espera do AnglerFish."
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-foam text-midnight">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/anglerfish-logo.png"
            alt="AnglerFish"
            width={190}
            height={48}
            className="h-11 w-auto"
          />
        </Link>

        <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="mt-5 leading-7 text-slate-600">
            Coletamos nome, email e respostas da pesquisa de validação para
            gerenciar a lista de espera, enviar novidades do projeto e organizar
            comunicações sobre pilotos, campeonatos e parceiros.
          </p>
          <p className="mt-4 leading-7 text-slate-600">
            Quando você responder a pesquisa anonimamente ou enviar uma sugestão
            opcional para a plataforma, essas informações serão usadas apenas
            para entender melhor as necessidades da comunidade de pesca.
          </p>
          <p className="mt-4 leading-7 text-slate-600">
            Os dados não serão vendidos. O acesso é restrito à operação do
            AnglerFish e poderá ser usado para melhorar a priorização de regiões
            e modalidades no lançamento.
          </p>
          <p className="mt-4 leading-7 text-slate-600">
            Para solicitar remoção ou atualização dos seus dados, entre em
            contato pelo email contato@anglerfish.com.br.
          </p>
        </div>
      </section>
    </main>
  );
}
