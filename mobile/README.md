# App mobile — Comercial do Trigo

App em Expo (SDK 58) para vendedores, supervisores e gerentes acompanharem metas e
rupturas pelo celular. Consome a mesma API do dashboard web (`/api/`).

## Rodar no celular (Expo Go)

Requer Node.js 22.13 ou mais novo (`node -v`).

```bash
cd mobile
npm install
copy .env.example .env      # Windows (no Linux/macOS: cp .env.example .env)
npx expo start -c
```

No `.env`, coloque o IP do computador que roda o Django, na mesma rede Wi-Fi do celular
(o `npx expo start` mostra esse IP na linha `Metro: exp://SEU_IP:8081`):

```
EXPO_PUBLIC_API_URL=http://SEU_IP:8002/api
```

O Django precisa aceitar esse IP e escutar na rede:

```bash
# backend/.env
EXTRA_ALLOWED_HOSTS=SEU_IP

python manage.py runserver 0.0.0.0:8002
```

Leia o QR code com o Expo Go (SDK 58). O Expo Go do iPhone só roda a versão mais
recente do SDK: quando a loja atualizar o Expo Go, o projeto precisa subir junto
(`npx expo install expo@^<nova>.0.0 --fix`). Variáveis `EXPO_PUBLIC_*` só são lidas quando o
`expo start` inicia: depois de mudar o `.env`, reinicie com `-c`.

Se o login mostrar "Sem conexão com o servidor", abra `http://SEU_IP:8002/api/me/` no
navegador do celular. Se não abrir, o problema é rede ou firewall (no Windows, libere a
porta 8002), não o app.

Para instalar pacotes, use sempre `npx expo install <pacote>`: ele escolhe a versão
compatível com o SDK. Não rode `npm audit fix --force`, que troca versões e quebra o SDK.

## Estrutura

```
src/app/                    rotas (Expo Router)
  _layout.jsx               sessão, proteção de rotas, tela de "sem conexão"
  login.jsx
  (app)/_layout.jsx         abas, com contador de alertas não lidos
  (app)/index.jsx           indicadores + fechamento previsto, alocado, ano passado, ruptura
  (app)/equipe.jsx          lista por vendedor (meta, pré-venda, mix, ruptura)
  (app)/alertas.jsx         central de rupturas
  (app)/perfil.jsx          notificações, Telegram, sair
  (detalhe)/vendedor/[cod]  detalhe do vendedor: indicadores, projeção, atalhos, segmentos
  (detalhe)/mix.jsx         itens vendidos / não vendidos (por quantidade ou valor)
  (detalhe)/clientes.jsx    clientes positivados / sem compra, por rota
  (detalhe)/ruptura.jsx     ruptura por item, com totais
  (detalhe)/pre-venda.jsx   pré-vendas não processadas ou com problema
  (detalhe)/pre-venda-itens.jsx
  (detalhe)/comissoes.jsx   total e pedidos comissionáveis
src/api.js                  axios + token no SecureStore + refresh automático
src/contexts/auth.jsx
src/contexts/painel.jsx     período + /api/Indicadores/, compartilhado entre as telas
src/contexts/alertas.jsx    consulta /api/alertas/ e dispara notificação local
src/lib/                    lógica pura: indicadores, vendedores, segmentos, consultas, formatação
src/components/             IndicadorLinha (régua de meta), Blocos, Lista, Segmentos, Segmentado, Botao
```

Os detalhamentos seguem a visão escolhida na tela inicial: em "Só eu" mostram o vendedor
logado; em "Equipe/Empresa", os vendedores do escopo. Abertos pelo detalhe de um vendedor,
mostram só ele.

## O que o app usa da API

| Rota | Para quê |
|---|---|
| `POST /api/token/`, `POST /api/token/refresh/` | login e renovação do token |
| `GET /api/me/` | nome, perfil, `cod_funcionario`, `is_gerente`, unidade gestora |
| `GET /api/Indicadores/?de=&ate=` | tela inicial, lista por vendedor e números do detalhe |
| `GET /api/indicadores/mix-itens-area/` | itens do mix (`vendedores`, `modo`, `criterio`) |
| `GET /api/indicadores/clientes-positivacao-area/` | clientes (`vendedores`, `positivados`) |
| `GET /api/indicadores/ruptura-itens/` | ruptura por item (`vendedores`, `criterio`) |
| `GET /api/indicadores/pre-venda-status/`, `GET /api/indicadores/pre-venda-itens/` | pendências e itens da pré-venda |
| `GET /api/resumo-segmento-area-venda/` | clientes por segmento (`cod_funcionarios`) |
| `GET /api/comissoes-vendedor/` | comissões (`cod_vendedor`) |
| `GET /api/alertas/`, `POST /api/alertas/marcar-lidos/` | central de alertas |
| `GET /api/telegram/status/`, `POST /api/telegram/gerar-codigo/`, `POST /api/telegram/desvincular/` | vínculo com o Telegram |

Campos de `/api/Indicadores/` lidos pelo app: `minha_visao`, `objetivo`,
`realizado_financeiro`, `realizado_peso`, `realizado_mix`, `positivacao`, `pre-venda`,
`ruptura`, `evolucao`, `escopo_rotas.e_gerente`, `projecao_empresa` (inclusive
`dias_uteis`) e, em `vendas`: `ano_anterior_agregado`, `ano_anterior_agregado_mes`,
`venda_ano_anterior_rotas` e, por vendedor, `codcampo`, `ValorLiquido`, `venda_rotas`,
`PreVenda_Valor`, `Ruptura_TotalValor`, `Ano_anterior_ValorLiquido`,
`Ano_anterior_mes_ValorLiquido` e `projecoes_detalhadas`. Renomear algum desses campos
no backend quebra o app. Por vendedor, a lista e o detalhe usam ainda `Campo`, `PesoTotal`,
`Mix`, `Positivacao_Realizado` e `objetivos_vendedores`.

## Alertas no Expo Go

O Expo Go não recebe notificação push remota. O app consulta `/api/alertas/` ao abrir, ao
voltar para ele e a cada minuto enquanto aberto, e mostra uma notificação local quando há
ruptura nova. Com o app fechado, o aviso continua chegando pelo Telegram.

Push com o app fechado exige um development build (`eas build`). A tabela `AlertaApp`
continua sendo a fonte: basta salvar o push token de cada usuário e enviar no mesmo ponto
em que `dashboard/services/alertas_service.py` cria o alerta.

## Limitações conhecidas

- Comissões aparecem com a mesma regra do web: gerente; supervisor da matriz (UG 1);
  vendedor só a própria e só se for da matriz.
- Os segmentos aparecem como barras (clientes da carteira e % que comprou), no lugar das
  três pizzas do web.

- Os números financeiros são os de rotas. O ajuste de PDV do web ainda não foi trazido.
- Fora do mês corrente, "onde você deveria estar" usa dias corridos.
- Antes de publicar na loja, definir `android.package` / `ios.bundleIdentifier` no
  `app.json` (não podem mudar depois de publicados) e trocar ícone e splash em `assets/`.
