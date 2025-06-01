# Backup Analytics - BRIO Content

Este diretório contém os arquivos originais do sistema de Analytics que foram temporariamente removidos para resolver problemas de dependências com recharts/d3-array.

## Arquivos Preservados

- `analytics-dashboard.tsx` - Componente principal do dashboard de analytics
- `chart.tsx` - Wrapper customizado para componentes de gráficos

## Por Que Foi Removido

O Analytics estava bloqueando o deploy devido a um conflito de dependências:
- recharts depende de d3-array
- d3-array v3 tem problemas de compatibilidade com o Vite
- Erro: "Could not resolve './greatest.js' from 'node_modules/d3-array/src/index.js'"

## Quando Restaurar

Considere restaurar o Analytics quando:
1. Tiver validado o produto principal com usuários reais
2. Usuários solicitarem especificamente métricas e analytics
3. Tiver tempo para migrar de recharts para Chart.js (sem dependências problemáticas)

## Como Restaurar

1. Copie os arquivos deste diretório de volta para suas localizações originais
2. Instale Chart.js ao invés de recharts: `npm install chart.js react-chartjs-2`
3. Adapte os componentes para usar Chart.js

Data do backup: 01/06/2025
Motivo: Deploy bloqueado há dias devido a erro de dependências
Decisão tomada por: CEO João Roveré