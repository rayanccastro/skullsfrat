# Skulls Fraternity · Vercel

Projeto completo, adaptado para a Vercel. Inclui o site compilado em `public/`, o código editável em `web/`, as funções de recrutamento e a configuração de publicação.

O selo que se quebra, a música iniciada na entrada, o cursor de serpente, as animações, os quatro atos, o jogo de sete níveis e o formulário original completo estão preservados.

## Vídeo de fundo

O vídeo **Skulls cinematic**, `uoe9E8KZH1I`, está configurado como fundo do site pelo player incorporado do YouTube. Ele carrega depois da abertura do selo, toca em loop e fica sempre sem áudio. O player recebe os comandos de silenciar e volume zero antes de iniciar. A trilha musical do site continua separada do vídeo.

O fundo tem uma camada escura para manter a leitura. O botão **Pausar fundo** permite interromper a reprodução. Ao sair da aba, o vídeo pausa; quando a aba volta, ele retoma caso o visitante não o tenha pausado. Com movimento reduzido habilitado, a reprodução depende de clicar em **Ativar fundo**.

Se a rede ou o YouTube recusarem o player, o site mantém o fundo escuro e oferece **Recarregar fundo**. Os erros 101/150 indicam restrição de incorporação no YouTube, conforme a [documentação do player](https://developers.google.com/youtube/iframe_api_reference#onError). O código do vídeo pode ser alterado em `web/background-video.js`, na constante `BACKGROUND_VIDEO_ID`.

Na verificação desta atualização, o YouTube ainda retornou **erro 150**, inclusive depois da informação de que a incorporação havia sido habilitada. Portanto, a reprodução real desse vídeo não foi confirmada no navegador de teste. A integração silenciosa, o tratamento de falhas e o botão de nova tentativa estão incluídos.

## Novo movimento da serpente

Depois de **Entrar no labirinto**, escolha uma direção pelas setas, WASD, botões ou gesto de deslizar. Um único comando mantém a cobra andando. A direção seguinte pode ser preparada enquanto ela se move; a curva é aplicada no centro da próxima célula. O desenho interpola a posição a cada quadro para evitar saltos entre as casas.

Ao tocar uma parede, o jogador perde a fase e pode clicar em **Tentar novamente**, retornando ao começo do mesmo nível, com zero passos. As pistas obtidas em fases anteriores são preservadas. Chegar à saída libera a próxima pista e o próximo nível.

O botão **Pausar**, ou a tecla Espaço com o jogo em foco, preserva a posição. O jogo também pausa quando a aba perde foco ou o tabuleiro sai da tela. Para retomar, clique em **Continuar fase**.

## Publicar na Vercel

1. Extraia o ZIP e abra a pasta `Skulls-Vercel`. A raiz do projeto é a pasta que contém `package.json` e `vercel.json`.
2. Coloque esse projeto em um repositório Git e importe-o em [Vercel · New Project](https://vercel.com/new).
3. Selecione **Other** como Framework Preset e a raiz do projeto. A configuração já está em `vercel.json`:

   | Opção | Valor |
   | --- | --- |
   | Node.js | `24.x` |
   | Install Command | `npm ci` |
   | Build Command | `npm run build` |
   | Output Directory | `public` |

4. Clique em **Deploy**. Para futuras alterações, edite `web/` e envie as mudanças ao repositório.

Também é possível publicar pela ferramenta oficial, executando `npx vercel --prod` na raiz do projeto e seguindo a autenticação e a seleção do projeto na sua conta.

O pacote já inclui os arquivos estáticos compilados. Na publicação, a Vercel executa o build e prepara as funções de `api/`. Importe o projeto completo, incluindo `api/` e `server/`.

## Ativar o envio do formulário

A webhook foi deixada em branco, conforme solicitado. O formulário pode ser preenchido e o envio permanece desativado até que você configure um destino.

No projeto da Vercel, abra **Settings → Environment Variables** e configure:

| Variável | Uso |
| --- | --- |
| `RECRUITMENT_WEBHOOK_URL` | Endereço HTTPS que receberá as inscrições. |
| `RECRUITMENT_WEBHOOK_SECRET` | Opcional: segredo Bearer para Make, n8n ou outro endpoint. Não é necessário para Discord. |

Depois, faça um **Redeploy** para aplicar as variáveis ao ambiente correspondente, Production ou Preview. Mantenha esses valores nas configurações da Vercel.

No Discord, a equipe recebe um resumo e o arquivo `recrutamento.txt` com a ficha completa. Outros destinos recebem um evento JSON completo, do tipo `skulls.recruitment.created`. Só há confirmação de sucesso quando o destino aceita a entrega. Nenhuma inscrição é salva em banco nesta versão.

## Executar no computador

Instale Node.js 24 e, dentro da pasta do projeto, execute:

```sh
npm ci
npm run dev
```

Abra **http://localhost:3000**. O servidor local executa as mesmas funções usadas na Vercel. Para usar uma webhook localmente, copie `.env.example` para `.env.local` e preencha as variáveis. Esse arquivo é carregado automaticamente pelo servidor local e fica excluído do Git.

## Compilar e verificar

```sh
npm run check
```

Esse comando compila os arquivos, executa os testes e verifica o pacote. Não há pacotes npm necessários em produção. O fundo depende do player externo do YouTube e de conexão à internet.

```text
api/                    Funções da Vercel: configuração e recrutamento
server/                 Entrega por webhook e servidor de prévia local
web/                    Site editável e todas as logos
public/                 Site já compilado, com arquivos versionados
scripts/                Compilação, prévia e validação
tests/                  Testes do site, do formulário, do jogo e das funções
vercel.json             Configuração pronta para a Vercel
.env.example            Nomes das variáveis, com valores em branco
```

O formulário mantém as 12 perguntas, os dois grupos, os campos e as opções conferidos no original. A música começa ao clicar no selo e pode ser pausada no player. O progresso do jogo é salvo apenas no navegador. As respostas do formulário ficam na página até o envio ou a saída.

Este pacote não contém vínculo com o projeto da hospedagem anterior nem credenciais. A publicação na sua conta da Vercel é uma etapa separada.

## Referências de compatibilidade

Configuração conferida na documentação oficial: [funções Node.js e Web Handlers](https://vercel.com/docs/functions/runtimes/node-js), [versões de Node.js](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) e [vercel.json](https://vercel.com/docs/project-configuration/vercel-json).
