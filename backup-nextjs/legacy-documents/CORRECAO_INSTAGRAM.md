# Correção de compilação — Ícone do Instagram

## Problema

Ao iniciar `npm run dev`, Next.js informa `Export Instagram doesn't exist in target module`.
A versão instalada de `lucide-react` não exporta `Instagram`.

## Correção aplicada

- Criado o ícone SVG local `src/components/brand/instagram-icon.tsx`.
- `src/components/layout/header.tsx`: usa `InstagramIcon` no menu móvel.
- `src/components/layout/footer.tsx`: usa `InstagramIcon` no link do Instagram.
- `src/features/home/sections.tsx`: removido import não utilizado de `Instagram`.
- Não foram alteradas as rotas, dados da barbearia, animações ou agendamento.

## Como usar

Se você já tem o projeto instalado, aplique os quatro arquivos do ZIP de correção na raiz do projeto (mantendo caminhos). Depois execute:

```bash
npm run dev
```

Não é necessário reinstalar as dependências para esta correção.

## Verificação realizada

- Todos os 25 arquivos de origem TypeScript/TSX foram analisados sintaticamente com o compilador TypeScript global, sem erros de sintaxe.
- Os imports locais e imagens estáticas referenciadas foram verificados, sem referências faltantes nessa verificação.
- `npm run build` ainda deve ser executado no ambiente com dependências instaladas para validar a compilação completa.
