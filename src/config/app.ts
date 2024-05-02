export default () => ({
  port: 5174,
  client_url: process.env.CLIENT_URL,
  server_url: process.env.SERVER_URL,
  email_redirect: process.env.EMAIL_VERIFY_REDIRECT_URL,
})
