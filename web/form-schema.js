// Transcribed from the public reference form, including its input types and options.
export const FORM_SCHEMA = {
  "title": "S K U L L S",
  "version": 9,
  "intro": "Nas sombras da cidade nasce a irmandade Skulls, não como um grupo, mas como um chamado. Formada por aqueles que o mundo julgou, ela acolhe os que carregam dentro de si o peso do próprio caos. Aqui, o pecado não é negado… é aceito como parte inevitável da existência. Cada membro traz nos ombros sua própria víbora, símbolo vivo de culpa, instinto e sobrevivência, um ciclo onde predador e presa se tornam um só. Marcados por símbolos incompreendidos, os Skulls não buscam aceitação. Caminham como tempestades silenciosas, unidos não por semelhança… mas por uma verdade compartilhada: viver intensamente, mesmo que isso custe a própria alma.",
  "startLabel": "Começar",
  "submitLabel": "Sua culpa foi entregue.",
  "steps": false,
  "questions": [
    {
      "key": "characterName",
      "label": "Nome completo do personagem",
      "section": "Informações Gerais",
      "type": "fullname",
      "subType": null,
      "required": true,
      "labels": {
        "firstName": "Primeiro nome",
        "lastName": "Último nome"
      },
      "options": null,
      "maxLength": null
    },
    {
      "key": "cityId",
      "label": "ID na Cidade",
      "section": "Informações Gerais",
      "type": "text",
      "subType": "shorttext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": null
    },
    {
      "key": "discord",
      "label": "Discord ID (Ex: 477781963214815233) e usuário do discord (Ex: @owdead)",
      "section": "Informações Gerais",
      "type": "fullname",
      "subType": null,
      "required": true,
      "labels": {
        "firstName": "Dc ID",
        "lastName": "Usuário do Dc"
      },
      "options": null,
      "maxLength": null
    },
    {
      "key": "instagram",
      "label": "Instagram (Global)",
      "section": "Informações Gerais",
      "type": "text",
      "subType": "shorttext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": null
    },
    {
      "key": "ageOff",
      "label": "Idade (Off-RP)",
      "section": "Informações Gerais",
      "type": "text",
      "subType": "shorttext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": null
    },
    {
      "key": "university",
      "label": "Está matriculado na Universidade?",
      "section": "Informações Gerais",
      "type": "choice",
      "subType": "yesno",
      "required": true,
      "labels": null,
      "options": [
        "Sim",
        "Não"
      ],
      "maxLength": null
    },
    {
      "key": "previousFraternity",
      "label": "Já fez parte de alguma fraternidade antes? Se sim, qual?",
      "section": "Informações Gerais",
      "type": "text",
      "subType": "shorttext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": null
    },
    {
      "key": "discovery",
      "label": "Como você conheceu os Skulls?",
      "section": "Questionário",
      "type": "text",
      "subType": "shorttext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": null
    },
    {
      "key": "motivation",
      "label": "O que na escuridão dos Skulls mexeu com você e te trouxe até aqui?",
      "section": "Questionário",
      "type": "text",
      "subType": "shorttext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": null
    },
    {
      "key": "offering",
      "label": "O que você ofertaria para se tornar parte do nosso segredo?",
      "section": "Questionário",
      "type": "text",
      "subType": "shorttext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": null
    },
    {
      "key": "lore",
      "label": "Qual passado seu personagem carrega? Apresente a nós a sua lore...",
      "section": "Questionário",
      "type": "text",
      "subType": "longtext",
      "required": true,
      "labels": null,
      "options": null,
      "maxLength": 0
    },
    {
      "key": "oath",
      "label": "Entrar nos Skulls não é convite — é sentença. Você jura guardar, nas sombras do silêncio, tudo o que viu, ouviu e viveu entre nós?",
      "section": "Questionário",
      "type": "choice",
      "subType": "yesno",
      "required": true,
      "labels": null,
      "options": [
        "Sim",
        "Não"
      ],
      "maxLength": null
    }
  ]
};
