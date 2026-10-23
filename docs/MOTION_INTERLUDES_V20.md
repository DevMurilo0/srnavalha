# SR. NAVALHA / V20 — original motion & scene grammar

## Diagnóstico corrigido
A versão V19 lançava animações de scroll sobre texto/imagens já pintados. Um `IntersectionObserver` esperava o alvo entrar antes de aplicar o primeiro quadro da animação. A rotina `motion.js` ainda buscava `.portal-architecture`, removido na V18. O loader dependia de sessão e não aparecia após refresh.

## Mudanças no carregamento
- Bootstrap mínimo em `index.html` antes do CSS instala as classes `sr-loader-boot` e `sr-motion-boot` apenas quando há suporte a movimento.
- A cortina já existe no HTML e só é mostrada quando o JS aplica a classe: não há layout bloqueado sem JS.
- `js/ritual/opening.js` mostra o loader em TODA navegação ou reload; no topo, a marca migra para o hero, em links de âncora se desfaz para revelar a seção correta.
- O timeout é apenas recuperação: não remove o estado de ocultação dos elementos ainda aguardando observação quando o sistema de movimento iniciou corretamente.

## Revelações sem flash
- Antes de levantar a classe de primeiro-paint, `initMotion` registra `.sr-enter-queued` nos alvos, e `initAtmosphere` / `initSceneCuts` fazem o mesmo com elementos fotográficos.
- Após o primeiro quadro da Web Animations API ser agendado, o componente sai da fila e se revela gradativamente com fill backwards.
- Cada elemento é revelado uma vez; evitar recriar ao retornar à seção.
- Movimento reduzido, pausa e falha de carregamento permanecem com saída segura.

## Oito transições diferentes
1. Fachada/hero → casa: arco de entrada com fotografia do salão.
2. Casa → serviços: corte oblíquo com navalha, metal e régua de cobre.
3. Serviços → equipe: tira de negativos fotográficos com trabalhos reais.
4. Equipe → portfólio: etiqueta de couro costurada.
5. Portfólio → produtos: prateleira com fotografias do catálogo.
6. Produtos → avaliações: emblema estrelado, usando estrelas decorativas.
7. Avaliações → localização: linha de trajeto e etiqueta Prado/Gravatá.
8. Visite → rodapé: assinatura da casa com fachada real.
Cada uma tem coreografia própria e fallback estático.

## Novo componente interativo
Hover preview dos profissionais: retrato e nome acompanham o cursor (somente mouse fino, sem dependências), uma reinterpretação autoral dos princípios de [Hover Members, Skiper UI](https://skiper-ui.com/v1/skiper6). Não foi copiado conteúdo Pro. Imagens já pertencem ao acervo local da Sr. Navalha.

## Referências técnicas e artísticas
- [Skiper UI](https://skiper-ui.com/), em particular conceito de image reveal e hover members. Muitos componentes originais são React/Framer Motion/Pro; esta implementação foi escrita em JS puro.
- [Codrops image layer clip-path](https://tympanus.net/codrops/2023/10/31/image-layer-animations-with-clip-path/).
- Repositórios `DevMurilo0/escola-peralta` e `DevMurilo0/meus-primeiros-passos`: o segundo usa uma fita horizontal entre capítulos e múltiplos estilos de revelação; esta adaptação usa processos e materiais reais de uma barbearia.
- Diretrizes dos três plugins locais Taste Frontend, Impeccable UI e Emil Design Engineering.

## Escopo e verificação
- Mantém Live Server sem npm; preserva app de agendamento, avaliações, fotos originais, conteúdo e navegação.
- Foram verificadas sintaxe JS, balanceamento do HTML/CSS, existência dos assets, imports e estados de fallback. Inspeção visual real no Chromium/Firefox ainda não realizada nesta sessão.
