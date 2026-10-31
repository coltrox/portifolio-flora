# by flora studio — Portfólio

Site de portfólio de **Flora Stenico** — Social Media, Story Maker, Captação de
Conteúdo e Tráfego Pago. Pensado para ser o link principal da bio do Instagram
(`linktr.ee/byflorastudio`), então é **mobile-first** e carrega rápido.

**Site estático puro**: HTML, CSS e um JavaScript pequeno. Sem build, sem
dependências, sem framework.

---

## Estrutura

```
index.html              Todo o conteúdo da página
assets/css/style.css    Estilos (a paleta fica no topo, em :root)
assets/js/main.js       Menu mobile, revelação no scroll
assets/img/             Logo, mascote e imagens dos trabalhos
```

## Identidade

Cores extraídas do logo e do material original da marca:

| Token       | Hex       | Uso                          |
|-------------|-----------|------------------------------|
| `--wine`    | `#8A0117` | Vinho do logo, títulos       |
| `--brick`   | `#A31D2A` | Vermelho tijolo, cartões     |
| `--pink`    | `#FA9BB5` | Rosa, destaques e sparkles   |
| `--cream`   | `#F3E5BE` | Creme manteiga, superfícies  |
| `--paper`   | `#FFFAF3` | Fundo da página              |
| `--mustard` | `#CF9746` | Mostarda, acento             |

Para mudar a marca inteira, edite as variáveis no `:root` do `style.css`.

Tipografia (Google Fonts): **Anton** (títulos), **Instrument Serif** (itálicos),
**Poppins** (texto).

## Editar o conteúdo

Tudo está no `index.html`, em português e com comentários por seção.

- **Trabalhos** — cada projeto é um bloco `<article class="work">`. Para trocar
  as fotos, substitua os arquivos em `assets/img/` mantendo os nomes, ou ajuste
  o `src`. Sempre atualize o `alt` junto.
- **Serviços / Processo** — listas numeradas; é só editar o texto.
- **Contato** — WhatsApp e Instagram ficam na seção `#contato` e no menu mobile.

### Trocar o logo

`assets/img/logo-mascote.jpg` é a mascote (usada no topo e no favicon) e
`assets/img/logo-byflora.png` é o logotipo da barra de navegação.

> Se tiver o logo em **SVG**, prefira ele: fica nítido em qualquer tela e pesa
> menos. Salve como `assets/img/logo-byflora.svg` e troque o `src` no HTML.
> Um PNG **com fundo transparente de verdade** também serve — um print de um
> editor mostrando o fundo quadriculado não funciona, porque o xadrez vem
> gravado nos pixels.

## Publicar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e importe este repositório
2. Em **Framework Preset**, escolha **Other**
3. Deixe *Build Command* e *Output Directory* vazios
4. **Deploy**

Cada push na branch publica uma nova versão automaticamente.

## Rodar localmente

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Acessibilidade e performance

- HTML semântico, com link para pular ao conteúdo e foco visível
- Imagens com `alt` descritivo e `loading="lazy"`
- Respeita `prefers-reduced-motion` (desliga marquee e animações)
- Sem rastreadores; as únicas requisições externas são as fontes do Google
