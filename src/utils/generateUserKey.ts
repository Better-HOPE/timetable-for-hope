export default function generateUserKey() {
  let key = "";
  for (let i = 0; i < 10; i++) {
    key += Math.round(Math.random() * 35).toString(36);
  }

  return `tt4h_user_key_${Date.now().toString(36)}${key}`;
}
