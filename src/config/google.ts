export default () => ({
  google: {
    client: process.env.GOOGLE_CLIENT,
    secret: process.env.GOOGLE_SECRET,
    callback: process.env.GOOGLE_CALLBACK,
    client_redirect: process.env.GOOGLE_LOGIN_REDIRECT,
  },
})
