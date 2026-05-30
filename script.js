const composePage = document.querySelector("#composePage");
const historyPage = document.querySelector("#historyPage");
const aiConfig = document.querySelector("#aiConfig");
const customUpload = document.querySelector("#customUpload");
const drawerOverlay = document.querySelector("#drawerOverlay");
const configDrawer = document.querySelector("#configDrawer");
const drawerTitle = document.querySelector("#drawerTitle");
const drawerContent = document.querySelector("#drawerContent");
const drawerClose = document.querySelector("#drawerClose");
const imagePreviewOverlay = document.querySelector("#imagePreviewOverlay");
const imagePreviewImg = document.querySelector("#imagePreviewImg");
const imagePreviewTitle = document.querySelector("#imagePreviewTitle");
const imagePreviewClose = document.querySelector("#imagePreviewClose");
let activeEditor = null;
let activeEditorHost = null;

function closeDrawer() {
  if (!activeEditor) {
    return;
  }

  activeEditorHost.appendChild(activeEditor);
  activeEditor = null;
  activeEditorHost = null;
  configDrawer.classList.remove("is-open");
  configDrawer.setAttribute("aria-hidden", "true");
  drawerOverlay.classList.remove("is-open");
  drawerOverlay.hidden = true;
  document.body.classList.remove("drawer-open");
}

function openDrawer(editorKey) {
  const editor = document.querySelector(`[data-editor-panel="${editorKey}"]`);
  if (!editor) {
    return;
  }

  if (activeEditor && activeEditor !== editor) {
    closeDrawer();
  }

  activeEditor = editor;
  activeEditorHost = editor.parentElement;
  drawerTitle.textContent = editor.dataset.drawerTitle || "修改";
  drawerContent.appendChild(editor);
  drawerOverlay.hidden = false;
  requestAnimationFrame(() => {
    drawerOverlay.classList.add("is-open");
    configDrawer.classList.add("is-open");
  });
  configDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function setSceneMode(mode, shouldCloseDrawer = true) {
  const isAi = mode === "ai";
  aiConfig.style.display = isAi ? "grid" : "none";
  customUpload.classList.toggle("is-active", !isAi);
  if (shouldCloseDrawer) {
    closeDrawer();
  }
}

setSceneMode(document.querySelector(".mode-option.is-active")?.dataset.mode || "custom", false);

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

    setSceneMode(button.dataset.mode);
  });
});

document.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-editor]");
  if (!editButton) {
    return;
  }

  event.preventDefault();
  openDrawer(editButton.dataset.editor);
});

drawerClose.addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeImagePreview();
    closeDrawer();
  }
});


function openImagePreview(button) {
  imagePreviewImg.src = button.dataset.previewSrc;
  imagePreviewImg.alt = button.closest(".style-preview-frame")?.querySelector("img")?.alt || "风格示例";
  imagePreviewTitle.textContent = button.dataset.previewTitle || "风格示例";
  imagePreviewOverlay.hidden = false;
  document.body.classList.add("preview-open");
}

function closeImagePreview() {
  imagePreviewOverlay.hidden = true;
  imagePreviewImg.src = "";
  document.body.classList.remove("preview-open");
}

document.addEventListener("click", (event) => {
  const previewButton = event.target.closest(".style-preview-btn");
  if (!previewButton) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  openImagePreview(previewButton);
});

imagePreviewClose.addEventListener("click", closeImagePreview);
imagePreviewOverlay.addEventListener("click", (event) => {
  if (event.target === imagePreviewOverlay) {
    closeImagePreview();
  }
});

document.querySelectorAll(".choice-type").forEach((button) => {
  button.addEventListener("click", () => {
    const editor = button.closest(".config-editor");
    editor.querySelectorAll(".choice-type").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    const preset = editor.querySelector(".chips");
    const custom = editor.querySelector(".custom-line");
    const styleNote = editor.querySelector(".style-example-note");
    const showCustom = button.dataset.target.endsWith("Custom");
    preset.style.display = showCustom ? "none" : "grid";
    custom.classList.toggle("is-active", showCustom);
    if (styleNote) {
      styleNote.hidden = showCustom;
    }
  });
});

function bindChips(containerId, valueId) {
  const container = document.querySelector(`#${containerId}`);
  const value = document.querySelector(`#${valueId}`);
  const getChipText = (chip) => chip.querySelector(".style-chip-label")?.textContent.trim() || chip.textContent.trim();
  const hideRecommend = () => {
    const recommend = value.closest(".selection-info")?.querySelector(".recommend");
    if (recommend) {
      recommend.hidden = true;
    }
  };

  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      container.querySelectorAll(".chip").forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      resetCustom(false);
      value.textContent = getChipText(chip);
      hideRecommend();
    });
    chip.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        chip.click();
      }
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
    hideRecommend();
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
