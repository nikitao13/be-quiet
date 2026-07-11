interface MotionConfig {
  fast: number;
  base: number;
  layout: number;
  easing: string;
}

const getMotionValue = (property: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(property).trim();

const parseDuration = (value: string): number => {
  if (value.endsWith("ms")) {
    return Number.parseFloat(value);
  }

  if (value.endsWith("s")) {
    return Number.parseFloat(value) * 1000;
  }

  return Number.parseFloat(value);
};

const getMotionConfig = (): MotionConfig => ({
  fast: parseDuration(getMotionValue("--motion-duration-fast")),
  base: parseDuration(getMotionValue("--motion-duration-base")),
  layout: parseDuration(getMotionValue("--motion-duration-layout")),
  easing: getMotionValue("--motion-easing"),
});

const animateRemainingTerminals = (
  previousPositions: Map<HTMLElement, DOMRect>,
): void => {
  const motion = getMotionConfig();

  previousPositions.forEach((previousPosition, terminal) => {
    if (!terminal.isConnected) return;

    const currentPosition = terminal.getBoundingClientRect();
    const offsetY = previousPosition.top - currentPosition.top;

    if (Math.abs(offsetY) < 1) return;

    terminal.animate(
      [
        {
          transform: `translateY(${offsetY}px)`,
        },
        {
          transform: "translateY(0)",
        },
      ],
      {
        duration: motion.layout,
        easing: motion.easing,
      },
    );
  });
};

const getRemainingTerminalPositions = (
  terminal: HTMLElement,
): Map<HTMLElement, DOMRect> => {
  const parent = terminal.parentElement;

  if (!parent) {
    return new Map();
  }

  const remainingTerminals = Array.from(
    parent.querySelectorAll<HTMLElement>(".terminal-list"),
  ).filter((item) => item !== terminal);

  return new Map(
    remainingTerminals.map((item) => [item, item.getBoundingClientRect()]),
  );
};

const removeTerminal = async (terminal: HTMLElement): Promise<void> => {
  if (terminal.dataset.closing === "true") return;

  terminal.dataset.closing = "true";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !terminal.parentElement) {
    terminal.remove();
    return;
  }

  const previousPositions = getRemainingTerminalPositions(terminal);
  const motion = getMotionConfig();

  terminal.style.pointerEvents = "none";
  terminal.style.transformOrigin = "center top";

  const exitAnimation = terminal.animate(
    [
      {
        opacity: 1,
        transform: "translateY(0) scale(1)",
      },
      {
        opacity: 0,
        transform: "translateY(-0.25rem) scale(0.99)",
      },
    ],
    {
      duration: motion.base,
      easing: motion.easing,
      fill: "forwards",
    },
  );

  try {
    await exitAnimation.finished;
  } finally {
    terminal.remove();

    requestAnimationFrame(() => {
      animateRemainingTerminals(previousPositions);
    });
  }
};

const updateToggleButton = (
  toggleButton: HTMLButtonElement | null,
  terminalTitle: string,
  isMinimised: boolean,
): void => {
  if (!toggleButton) return;

  const action = isMinimised ? "Restore" : "Minimise";

  toggleButton.setAttribute("aria-expanded", String(!isMinimised));
  toggleButton.setAttribute(
    "aria-label",
    `${action} ${terminalTitle} terminal`,
  );

  toggleButton.title = action;
};

const initialiseControlPanel = (controlPanel: HTMLElement): void => {
  if (controlPanel.dataset.initialised === "true") return;

  const terminal = controlPanel.closest<HTMLElement>(".terminal-list");
  const terminalHeader = controlPanel.closest<HTMLElement>(
    ".terminal-list-header",
  );

  if (!terminal) return;

  controlPanel.dataset.initialised = "true";

  const closeButton = controlPanel.querySelector<HTMLButtonElement>(
    '[data-terminal-action="close"]',
  );

  const toggleButton = controlPanel.querySelector<HTMLButtonElement>(
    '[data-terminal-action="toggle"]',
  );

  const toggleTerminal = (): void => {
    const isMinimised = terminal.classList.toggle("is-minimised");
    const terminalTitle = terminal.dataset.terminalTitle ?? "";

    updateToggleButton(toggleButton, terminalTitle, isMinimised);
  };

  closeButton?.addEventListener("click", () => {
    void removeTerminal(terminal);
  });

  toggleButton?.addEventListener("click", toggleTerminal);

  terminalHeader?.addEventListener("click", (event) => {
    const isMobile = window.matchMedia("(max-width: 600px)").matches;

    if (!isMobile) return;

    const target = event.target;

    if (!(target instanceof Element)) return;
    if (target.closest("[data-terminal-controls]")) return;

    toggleTerminal();
  });
};

export const initialiseTerminalControls = (): void => {
  const controlPanels = document.querySelectorAll<HTMLElement>(
    "[data-terminal-controls]",
  );

  controlPanels.forEach(initialiseControlPanel);
};
