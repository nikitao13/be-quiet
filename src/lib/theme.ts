import { initialiseAccentEasterEgg } from "@/lib/dp";

const accents = [
  {
    name: "green",
    value: "var(--color-accent-green)",
  },
  {
    name: "red",
    value: "var(--color-accent-red)",
  },
  {
    name: "blue",
    value: "var(--color-accent-blue)",
  },
] as const;

const defaultAccentIndex = 1;

const actionSelector = '[data-terminal-action="cycle-accent"]';

const valueSelector = '[data-terminal-action-value="cycle-accent"]';

const normaliseIndex = (index: number) =>
  ((index % accents.length) + accents.length) % accents.length;

const getCurrentIndex = () => {
  const currentIndex = Number.parseInt(
    document.documentElement.dataset.accentIndex ?? String(defaultAccentIndex),
    10,
  );

  return Number.isNaN(currentIndex)
    ? defaultAccentIndex
    : normaliseIndex(currentIndex);
};

const updateAccentLabels = (name: string) => {
  document.querySelectorAll<HTMLElement>(actionSelector).forEach((element) => {
    const value = element.querySelector<HTMLElement>(valueSelector);

    if (value) {
      value.textContent = name;
    }

    element.setAttribute(
      "aria-label",
      `Current accent colour: ${name}. Click to change.`,
    );
  });
};

const applyAccent = (index: number) => {
  const safeIndex = normaliseIndex(index);
  const accent = accents[safeIndex];

  document.documentElement.dataset.accentIndex = String(safeIndex);

  document.documentElement.style.setProperty("--color-accent", accent.value);

  updateAccentLabels(accent.name);
};

const cycleAccent = () => {
  applyAccent(getCurrentIndex() + 1);
};

export const initialiseAccentPicker = () => {
  document.documentElement.dataset.accentIndex ??= String(defaultAccentIndex);

  document.querySelectorAll<HTMLElement>(actionSelector).forEach((element) => {
    if (element.dataset.accentInitialised === "true") {
      return;
    }

    element.dataset.accentInitialised = "true";

    element.addEventListener("click", cycleAccent);

    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      cycleAccent();
    });
  });

  initialiseAccentEasterEgg(cycleAccent);
};
