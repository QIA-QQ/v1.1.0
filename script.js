const composePage = document.querySelector("#composePage");
const historyPage = document.querySelector("#historyPage");
const aiConfig = document.querySelector("#aiConfig");
const customUpload = document.querySelector("#customUpload");
const sceneTabs = document.querySelector("#sceneTabs");

sceneTabs.style.display = "none";

document.querySelector("#toHistory").addEventListener("click", () => {
  composePage.classList.remove("is-active");
  historyPage.classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#backCompose").addEventListener("click", () => {
  historyPage.classList.remove("is-active");
  composePage.classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll(".mode-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-option").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    const isAi = button.dataset.mode === "ai";
    aiConfig.style.display = isAi ? "grid" : "none";
    customUpload.classList.toggle("is-active", !isAi);
    sceneTabs.style.display = isAi ? "none" : "block";
  });
});

document.querySelectorAll(".choice-type").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".config-card");
    card.querySelectorAll(".choice-type").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    const preset = card.querySelector(".chips");
    const custom = card.querySelector(".custom-line");
    const showCustom = button.dataset.target.endsWith("Custom");
    preset.style.display = showCustom ? "none" : "flex";
    custom.classList.toggle("is-active", showCustom);
  });
});

function bindChips(containerId, valueId) {
  const container = document.querySelector(`#${containerId}`);
  const value = document.querySelector(`#${valueId}`);

  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      container.querySelectorAll(".chip").forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      resetCustom(false);
      value.textContent = chip.textContent.trim();
    });
  });

  const customLine = document.querySelector(`#${containerId.replace("Preset", "Custom")}`);
  const input = customLine.querySelector("input");
  const button = customLine.querySelector("button");
  const confirmedList = customLine.querySelector(".confirmed-list");
  const defaultValue = value.textContent.trim();

  const resetCustom = (focusInput = true) => {
    input.disabled = false;
    button.disabled = false;
    input.value = "";
    confirmedList.innerHTML = "";
    value.textContent = defaultValue || "未选择";
    if (focusInput) {
      input.focus();
    }
  };

  const confirmCustom = () => {
    const nextValue = input.value.trim();
    if (!nextValue) {
      input.focus();
      return;
    }
    input.value = nextValue;
    value.textContent = nextValue;
    container.querySelectorAll(".chip").forEach((item) => item.classList.remove("is-active"));
    input.disabled = true;
    button.disabled = true;
    confirmedList.innerHTML = "";

    const item = document.createElement("span");
    item.className = "confirmed-item";
    item.textContent = nextValue;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "confirmed-remove";
    remove.textContent = "×";
    remove.addEventListener("click", () => resetCustom());

    item.appendChild(remove);
    confirmedList.appendChild(item);
  };

  button.addEventListener("click", confirmCustom);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      confirmCustom();
    }
  });
}

bindChips("spacePreset", "spaceValue");
bindChips("stylePreset", "styleValue");

document.querySelector(".generate-btn").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const oldText = button.innerHTML;
  button.textContent = "生成中";
  button.disabled = true;

  setTimeout(() => {
    button.innerHTML = oldText;
    button.disabled = false;
  }, 900);
});
