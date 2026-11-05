const chance = .35;

export const CAR_DIALOGUES = Object.freeze({
  Obscury: Object.freeze({ chance, text: 'Maldito Protagonista' }),
  Obsession: Object.freeze({ chance, text: 'Ave Lilith... O que será de mim Meu Deus' }),
  Shroom: Object.freeze({ chance, text: 'Acende, puxa, prende passa...🍁' }),
  'Neon Syndicate': Object.freeze({ chance, text: 'Pane no sistema, alguém me desconfigurou' }),
  Envy: Object.freeze({ chance, text: 'Envys, formação... Chelseaaa, minha peruca caiu' }),
  Villains: Object.freeze({ chance, text: 'Dracarys... NA GENTE?' }),
  Hotties: Object.freeze({ chance, text: 'Meu pompom queimou veyrrr' })
});

export function chooseCarDialogue(carName, random = Math.random) {
  const dialogue = Object.hasOwn(CAR_DIALOGUES, carName) ? CAR_DIALOGUES[carName] : null;
  if (!dialogue || (dialogue.chance < 1 && random() >= dialogue.chance)) return null;
  return dialogue.text;
}
