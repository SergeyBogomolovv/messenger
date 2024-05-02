export default () => ({
  auth: {
    secret: process.env.JWT_SECRET,
    exp: process.env.JWT_EXP,
  },
})
