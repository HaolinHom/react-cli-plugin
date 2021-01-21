process.env.NODE_ENV = 'production';

module.exports = async function (context, args) {
  const { std } = context.utils;

  // TODO: do something about publish!
  std.warn('TODO: do something about publish!');
};