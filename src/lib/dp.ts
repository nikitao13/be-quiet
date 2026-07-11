const secretSequences = [
  ["ArrowRight", "ArrowDown", "ArrowRight"],
  ["d", "s", "d"],
  ["6", "2", "3"],
] as const;

const sequenceTimeout = 700;
const cycleIterations = 15;
const cycleInterval = 120;

let sequenceIndex = 0;
let activeSequence: (typeof secretSequences)[number] | undefined;
let sequenceTimer: ReturnType<typeof setTimeout> | undefined;
let activeAnimation: ReturnType<typeof setInterval> | undefined;

const isEditableElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

const resetSequence = () => {
  sequenceIndex = 0;
  activeSequence = undefined;

  if (sequenceTimer) {
    clearTimeout(sequenceTimer);
    sequenceTimer = undefined;
  }
};

const runAccentAnimation = (cycleAccent: () => void) => {
  if (activeAnimation) {
    clearInterval(activeAnimation);
  }

  let completedIterations = 0;

  activeAnimation = setInterval(() => {
    cycleAccent();
    completedIterations += 1;

    if (completedIterations >= cycleIterations) {
      clearInterval(activeAnimation);
      activeAnimation = undefined;
    }
  }, cycleInterval);
};

const handleSecretSequence = (
  event: KeyboardEvent,
  cycleAccent: () => void,
) => {
  if (event.repeat || isEditableElement(event.target)) {
    return;
  }

  const key = event.key.toLowerCase();

  if (!activeSequence) {
    activeSequence = secretSequences.find(
      (sequence) => sequence[0].toLowerCase() === key,
    );

    if (!activeSequence) {
      return;
    }

    sequenceIndex = 1;

    sequenceTimer = setTimeout(resetSequence, sequenceTimeout);

    return;
  }

  const expectedKey = activeSequence[sequenceIndex].toLowerCase();

  if (key !== expectedKey) {
    resetSequence();

    const restartedSequence = secretSequences.find(
      (sequence) => sequence[0].toLowerCase() === key,
    );

    if (restartedSequence) {
      activeSequence = restartedSequence;
      sequenceIndex = 1;

      sequenceTimer = setTimeout(resetSequence, sequenceTimeout);
    }

    return;
  }

  sequenceIndex += 1;

  if (sequenceIndex < activeSequence.length) {
    return;
  }

  resetSequence();
  runAccentAnimation(cycleAccent);
};

export const initialiseAccentEasterEgg = (cycleAccent: () => void) => {
  if (document.documentElement.dataset.accentEasterEggInitialised === "true") {
    return;
  }

  document.documentElement.dataset.accentEasterEggInitialised = "true";

  window.addEventListener("keydown", (event) => {
    handleSecretSequence(event, cycleAccent);
  });
};
