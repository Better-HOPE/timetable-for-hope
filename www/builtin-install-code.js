function generateUserKey() {
  let key = "";
  for (let i = 0; i < 10; i++) {
    key += Math.round(Math.random() * 35).toString(36);
  }

  return `tt4h_user_key_${Date.now().toString(36)}${key}`;
}

const userKey = generateUserKey();

const code = [
  `<div id="timetable-for-hope-placeholder"></div>`,
  `<script>TT4H_USER_KEY="${userKey}"</script>`,
  `<script src="${document.location.origin}/dist/builtin/index.js" async></script>`
].join("\n");

document.getElementById("builtin-install-code").textContent = code;

document.getElementById("builtin-install-code-copy").addEventListener("click", () => {
  navigator.clipboard.writeText(code)
    .then(() => {
      document.getElementById("builtin-install-code-message").textContent = "コピーしました!"
    })
    .catch(() => {
      document.getElementById("builtin-install-code-message").textContent = "コピーできませんでした!"
    })
});
