export default (env) => {
  return [
    require(`./webpack/ui.${env}`),
    require(`./webpack/interceptor.${env}`),
  ];
}
