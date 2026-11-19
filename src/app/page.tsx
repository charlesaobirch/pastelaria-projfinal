
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const produtos = [
  {
    nome: "Pastel de Nata",
    descricao: "Massa folhada crocante e creme delicado.",
    preco: "1,80 €",
    categoria: "Tradicional",
    imagem:
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=900&q=85",
  },
  {
    nome: "Croissant Artesanal",
    descricao: "Folhado com manteiga e preparado diariamente.",
    preco: "2,50 €",
    categoria: "Mais pedido",
    imagem:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=85",
  },
  {
    nome: "Bolo de Chocolate",
    descricao: "Chocolate intenso, textura macia e cremosa.",
    preco: "4,20 €",
    categoria: "Especialidade",
    imagem:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#35251c]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#e9e0d6] bg-[#faf8f4]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a href="#" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#b88449]" />
            <span className="font-serif text-3xl font-bold tracking-tight">
              doce<span className="text-[#b88449]">alto.</span>
            </span>
          </a>

          <div className="hidden items-center gap-9 text-sm font-medium md:flex">
            <a href="#inicio" className="hover:text-[#b88449]">
              Início
            </a>
            <a href="#produtos" className="hover:text-[#b88449]">
              Especialidades
            </a>
            <a href="#sobre" className="hover:text-[#b88449]">
              Nossa história
            </a>
            <a href="#contactos" className="hover:text-[#b88449]">
              Contactos
            </a>
          </div>

          <a
            href="#produtos"
            className="flex items-center gap-2 rounded-full bg-[#422c20] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b4935]"
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Ver produtos</span>
          </a>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section
          id="inicio"
          className="relative flex min-h-[650px] items-center overflow-hidden bg-[#3c281d] text-white"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-55"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1608198093002-ad4e005484df?w=1800&q=90')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#26170f]/95 via-[#26170f]/70 to-transparent" />

          <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
            <div className="max-w-2xl">
              <span className="mb-7 inline-block rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#f4d7ac]">
                Pastelaria artesanal
              </span>

              <h1 className="font-serif text-5xl leading-[1.08] font-semibold sm:text-6xl lg:text-7xl">
                A vida fica
                <br />
                mais doce
                <br />
                <span className="italic text-[#f0c58c]">
                  aqui em cima.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-8 text-[#eee3da] sm:text-lg">
                Sabores que despertam memórias. Descubra a nossa
                seleção de bolos, doces e especialidades
                preparados com dedicação todos os dias.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#produtos"
                  className="inline-flex items-center gap-3 rounded-full bg-[#e9bc80] px-7 py-4 text-sm font-bold text-[#35251c] transition hover:bg-white"
                >
                  Explorar especialidades
                  <ArrowUpRight size={18} />
                </a>

                <a
                  href="#sobre"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-4 text-sm font-semibold transition hover:bg-white/10"
                >
                  Conheça a Doce Alto
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* DESTAQUES */}
        <section
          id="produtos"
          className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
        >
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#a87843]">
                Feitos com carinho
              </span>

              <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
                Os nossos favoritos
              </h2>

              <p className="mt-4 max-w-lg leading-7 text-[#817164]">
                Uma seleção irresistível de sabores preparados
                com ingredientes de qualidade e tradição.
              </p>
            </div>

            <span className="text-sm font-semibold text-[#9c6c3b]">
              Especialidades da casa
            </span>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {produtos.map((produto) => (
              <article
                key={produto.nome}
                className="group overflow-hidden rounded-2xl border border-[#eee6dc] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative h-64 overflow-hidden bg-[#efe6da]">
                  <div
                    role="img"
                    aria-label={produto.nome}
                    className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url("${produto.imagem}")`,
                    }}
                  />

                  <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#704a2d] shadow-sm">
                    {produto.categoria}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-2xl font-bold">
                    {produto.nome}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#817164]">
                    {produto.descricao}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#eee6dc] pt-5">
                    <span className="text-xl font-bold text-[#9c6c3b]">
                      {produto.preco}
                    </span>

                    <span className="flex items-center gap-2 text-sm font-medium">
                      Feito com carinho
                      <Sparkles size={16} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* NOSSA HISTÓRIA */}
        <section id="sobre" className="bg-[#f0e8de] py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
            <div
              role="img"
              aria-label="Pastelaria artesanal"
              className="min-h-[420px] rounded-3xl bg-cover bg-center shadow-xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85')",
              }}
            />

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#a87843]">
                A nossa essência
              </span>

              <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                Mais do que doces,
                <br />
                criamos momentos.
              </h2>

              <p className="mt-7 leading-8 text-[#766659]">
                Na Doce Alto acreditamos que os melhores momentos
                da vida merecem ser acompanhados por algo especial.
                Por isso, unimos receitas tradicionais, ingredientes
                selecionados e uma paixão genuína pela pastelaria.
              </p>

              <p className="mt-5 leading-8 text-[#766659]">
                Do primeiro café da manhã à sobremesa perfeita,
                queremos fazer parte dos pequenos momentos
                que tornam cada dia memorável.
              </p>

              <a
                href="#contactos"
                className="mt-9 inline-flex items-center gap-3 border-b-2 border-[#a87843] pb-2 font-semibold text-[#8e5f32]"
              >
                Visite a nossa pastelaria
                <ArrowUpRight size={19} />
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-3xl bg-[#422c20] px-8 py-20 text-center text-white md:px-20">
            <Sparkles
              size={32}
              className="mx-auto mb-6 text-[#e9bc80]"
            />

            <h2 className="font-serif text-4xl font-semibold sm:text-5xl">
              Um doce momento espera por si.
            </h2>

            <p className="mx-auto mt-6 max-w-xl leading-8 text-[#e7d7c9]">
              Descubra o sabor das nossas especialidades
              e transforme o seu dia numa experiência mais doce.
            </p>

            <a
              href="#contactos"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#e9bc80] px-8 py-4 font-semibold text-[#35251c] transition hover:bg-white"
            >
              Entre em contacto
              <ArrowUpRight size={19} />
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        id="contactos"
        className="border-t border-[#e8ded3] bg-[#f4eee7]"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3 lg:px-10">
          <div>
            <h3 className="font-serif text-3xl font-bold">
              doce<span className="text-[#b88449]">alto.</span>
            </h3>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#817164]">
              Pastelaria artesanal feita com paixão,
              tradição e um toque especial de doçura.
            </p>
          </div>

          <div>
            <h4 className="mb-5 font-bold">Navegação</h4>
            <div className="flex flex-col gap-4 text-sm text-[#817164]">
              <a href="#inicio">Início</a>
              <a href="#produtos">Especialidades</a>
              <a href="#sobre">Nossa história</a>
              <a href="#contactos">Contactos</a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 font-bold">Informações</h4>
            <div className="flex flex-col gap-4 text-sm text-[#817164]">
              <span className="flex items-center gap-3">
                <MapPin size={18} />
                Porto, Portugal
              </span>
              <span className="flex items-center gap-3">
                <Clock3 size={18} />
                Horários a definir
              </span>
              <span className="flex items-center gap-3">
                Instagram em breve
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e8ded3] px-6 py-6 text-center text-xs text-[#817164]">
          © {new Date().getFullYear()} Doce Alto.
          Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
