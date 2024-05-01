export default () => ({
  mail: {
    transport: process.env.MAIL_TRANSPORT,
    defaults: {
      host: process.env.MAIL_HOST,
      from: process.env.MAIL_USER,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      secure: false,
      port: 587,
    },
  },
})
