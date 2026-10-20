# Sr. Navalha — Hero V11 (atualização conservadora)

Este ZIP **não substitui o restante da Sr. Navalha**. Ele instala somente:

- O cabeçalho na composição aprovada: navegação lateral, logo oficial central e botão de agendamento;
- O hero com a fotografia do interior, títulos e informações da captura aprovada;
- Uma entrada cinematográfica curta (cortina + logo), seguida por revelação dos textos;
- Um movimento fotográfico discreto ligado ao scroll, respeitando movimento reduzido;
- Imagens responsivas em WebP: 3840 × 2160 (saída 4K), 1920 × 1080 e versão mobile.

Os serviços, equipe, produtos, galeria, avaliações, mapa e rodapé são **preservados**, assim como os dados e links existentes. O instalador também atualiza o gerador HTML opcional para que ele não reverta o hero numa geração futura.

## Instalação no Linux com fish (sem npm)

1. Extraia o ZIP com o gerenciador de arquivos.
2. Abra o terminal **dentro da pasta extraída**, onde está `APLICAR_HERO_V11.py`.
3. Primeiro faça a verificação (não modifica nada):

```fish
python3 APLICAR_HERO_V11.py ~/Dev/andamento/srnavalha --dry-run
```

4. Se aparecer `OK`, aplique:

```fish
python3 APLICAR_HERO_V11.py ~/Dev/andamento/srnavalha
```

5. Volte à pasta `~/Dev/andamento/srnavalha`, abra `index.html` no Live Server e use **Ctrl+Shift+R** para limpar o cache da página.

O instalador cria uma pasta de backup ao lado do projeto (`srnavalha-backup-hero-v11-*`), nunca dá `git reset`, não apaga arquivos antigos e gera um ZIP **completo** da versão local atualizada: `srnavalha-Hero-V11-completo.zip`. Pode executar novamente, sem duplicar o hero.

**Aviso importante:** a pasta do projeto precisa conter `index.html`, `js/site.js` e `scripts/build-v9.mjs`. Se algum desses arquivos estiver ausente, o instalador informa o caminho e não modifica nada. Não restaure todo o repositório com `git reset --hard`.

## Fotografia em 4K

O arquivo `assets/images/hero-ambiente-3840.webp` possui **3840 × 2160 pixels**, exportado com reamostragem Lanczos e leve correção de nitidez/cor a partir da fotografia já usada na V10. É uma versão de saída 4K, **não uma nova fotografia capturada originalmente em 4K**. O detalhe que não existia na fotografia de origem não pode ser recuperado por simples reamostragem. A imagem mantém o enquadramento e a identidade visual já aprovados.

O navegador carrega uma versão apropriada à largura/tela via `picture` e `srcset`; celulares não precisam baixar a versão 4K.

## Arquivos incluídos

- `APLICAR_HERO_V11.py` — instalador seguro com `--dry-run`, backup e ZIP completo;
- `templates/header.html`, `templates/hero.html` — HTML do cabeçalho e hero;
- `css/hero-v11.css`, `js/hero-v11.js` — CSS e animação do hero somente;
- `scripts/hero-v11-patch.mjs`, `scripts/v11-templates/` — persistência no gerador existente;
- `assets/images/` — imagens WebP do fundo;
- `preview/` — screenshots da prévia de layout.

## Verificações realizadas

- Integridade e sintaxe Python/JavaScript;
- Aplicação em teste contra a estrutura V10 e preservação literal do conteúdo a partir da seção `Serviços`;
- Teste de idempotência do instalador para não duplicar scripts;
- Prévia HTML/CSS/JS carregada diretamente no Chromium em 320, 390, 768, 1440 e 1672 px: sem overflow horizontal e sem erro JS observado;
- O servidor HTTP local foi bloqueado pelo ambiente de teste; **a navegação real via Live Server ainda deve ser conferida no seu computador**.

### Fonte e licenciamento

Os arquivos do fundo são variantes do material aprovado nas etapas anteriores, não fotos documentais originais 4K. Nenhuma fonte do sistema foi incluída no ZIP. O CSS utiliza `Noto Serif Display` via Google Fonts e um fallback serifado; a marca original é reutilizada da pasta existente do repositório (`assets/images/v9/logo.webp`).

Nenhuma alteração foi enviada ao GitHub nesta entrega.
