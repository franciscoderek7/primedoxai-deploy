const SESSION_KEY = "primedox_pwa_session";

const DOC_TEMPLATES = {
  statement_of_claim: {
    label: "Statement of Claim",
    text: () =>
      "STATEMENT OF CLAIM\n\n" +
      "Court File No.: [Insert]\n" +
      "Plaintiff(s): [Insert Name]\n" +
      "Defendant(s): [Insert Name]\n\n" +
      "1. The Plaintiff claims against the Defendant for [insert relief sought].\n" +
      "2. The facts giving rise to this claim are as follows: [insert narrative].\n" +
      "3. The Plaintiff therefore claims:\n   (a) [insert amount or relief];\n   (b) Costs of this proceeding;\n   (c) Such further and other relief as this Court deems just.\n\n" +
      "Date: " + new Date().toLocaleDateString("en-CA")
  },
  affidavit: {
    label: "Affidavit",
    text: () =>
      "AFFIDAVIT\n\n" +
      "I, [Insert Name], of the [City/Town] of [Insert], MAKE OATH AND SAY AS FOLLOWS:\n\n" +
      "1. I am [the Plaintiff/Defendant] in this proceeding and as such have personal knowledge of the matters herein deposed to.\n" +
      "2. [Insert facts, numbered paragraph by paragraph].\n\n" +
      "SWORN before me at [City], this ___ day of [Month], [Year]."
  },
  notice_of_motion: {
    label: "Notice of Motion",
    text: () =>
      "NOTICE OF MOTION\n\n" +
      "TAKE NOTICE that a motion will be made to this Court on [date] at [time], or as soon after that time as the motion can be heard.\n\n" +
      "THE MOTION IS FOR:\n   (a) [Insert order sought];\n   (b) Costs of this motion.\n\n" +
      "THE GROUNDS FOR THE MOTION ARE:\n   (a) [Insert grounds]."
  },
  defence: {
    label: "Defence",
    text: () =>
      "STATEMENT OF DEFENCE\n\n" +
      "1. The Defendant denies the allegations in paragraph(s) [insert] of the Statement of Claim.\n" +
      "2. [Insert facts supporting the defence].\n" +
      "3. The Defendant asks that this action be dismissed with costs."
  },
  demand_letter: {
    label: "Demand Letter",
    text: () =>
      "DEMAND LETTER\n\n" +
      "Re: Demand for Payment / Action\n\n" +
      "Dear [Insert Name],\n\n" +
      "This letter is to formally demand that you [insert demand] within [insert number] days of the date of this letter, failing which legal proceedings may be commenced without further notice.\n\n" +
      "Sincerely,\n[Insert Name]"
  }
};

function $(id) { return document.getElementById(id); }

function populateTemplateSelect() {
  const select = $("template-select");
  Object.keys(DOC_TEMPLATES).forEach(function (key) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = DOC_TEMPLATES[key].label;
    select.appendChild(opt);
  });
}

function showApp() {
  $("login-view").classList.add("hidden");
  $("app-view").classList.remove("hidden");
}

function showLogin() {
  $("app-view").classList.add("hidden");
  $("login-view").classList.remove("hidden");
}

$("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  localStorage.setItem(SESSION_KEY, $("username").value.trim() || "user");
  showApp();
});

$("logout-btn").addEventListener("click", function () {
  localStorage.removeItem(SESSION_KEY);
  showLogin();
});

$("generate-btn").addEventListener("click", function () {
  const key = $("template-select").value;
  const template = DOC_TEMPLATES[key];
  $("result-display").textContent = template ? template.text() : "Select a template first.";
});

populateTemplateSelect();
if (localStorage.getItem(SESSION_KEY)) showApp();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}
